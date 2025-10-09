import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { toStartOfDayISOString } from '../utils/date.js'
import {
  calculateNextResetTimestamp,
  getNextRotationAssignee,
} from '../utils/recurrence.js'

const STORAGE_KEY = 'famboard-state-v1'

const normalizeAssignees = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return Array.from(new Set(value.filter(Boolean)))
  }
  return [value].filter(Boolean)
}

const withSchedule = (chore) => {
  const anchor = chore?.schedule?.anchorDate
  const resolvedAnchor = anchor ? toStartOfDayISOString(anchor) : toStartOfDayISOString(new Date())
  const assigned = normalizeAssignees(chore?.assignedTo)

  return {
    ...chore,
    assignedTo: assigned,
    rotateAssignment: assigned.length <= 1 ? Boolean(chore?.rotateAssignment) : false,
    schedule: {
      anchorDate: resolvedAnchor,
      allDay: chore?.schedule?.allDay ?? true,
    },
  }
}

const defaultData = {
  theme: 'light',
  activeView: 'family',
  pwaInstallDismissedAt: null,
  mediaLibrary: [],
  settingsPin: null,
  familyMembers: [
    {
      id: 'member-1',
      name: 'Alex',
      points: 0,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'member-2',
      name: 'Jamie',
      points: 0,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1520719627573-5e2c1a6610f0?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'member-3',
      name: 'Riley',
      points: 0,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1445633883498-7f9922d37a3d?auto=format&fit=crop&w=160&q=80',
    },
  ],
  chores: [
    withSchedule({
      id: 'chore-1',
      title: 'Clear the dinner table',
      description: 'Tidy up after meals and wipe the table clean.',
      assignedTo: ['member-1'],
      points: 10,
      completed: false,
      completedAt: null,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
      recurrence: 'daily',
      rotateAssignment: false,
    }),
    withSchedule({
      id: 'chore-2',
      title: 'Feed the pets',
      description: 'Fresh water and food for the pets before school.',
      assignedTo: ['member-2'],
      points: 8,
      completed: false,
      completedAt: null,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=200&q=80',
      recurrence: 'weekdays',
      rotateAssignment: true,
    }),
    withSchedule({
      id: 'chore-3',
      title: 'Laundry helper',
      description: 'Sort colors and help fold clothes.',
      assignedTo: ['member-3'],
      points: 12,
      completed: false,
      completedAt: null,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=200&q=80',
      recurrence: 'weekly',
      rotateAssignment: false,
    }),
  ],
  rewards: [
    {
      id: 'reward-1',
      title: 'Pick the family movie',
      description: 'Choose the movie for Friday movie night.',
      cost: 30,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'reward-2',
      title: 'Extra 30 minutes of screen time',
      description: 'Enjoy more tablet or console time.',
      cost: 45,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1486578077620-8a022ddd481f?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'reward-3',
      title: 'Choose dinner',
      description: 'Decide what the family will have for dinner.',
      cost: 60,
      imageId: null,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
    },
  ],
}

const FamboardContext = createContext()

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function FamboardProvider({ children }) {
  const [state, setState] = useState(defaultData)
  const [isHydrated, setIsHydrated] = useState(false)

  const runRecurrenceCheck = useCallback(() => {
    setState((prev) => {
      if (!prev.chores || prev.chores.length === 0) {
        return prev
      }

      const now = Date.now()
      let updated = false

      const updatedChores = prev.chores.map((chore) => {
        if (!chore.recurrence || chore.recurrence === 'none') {
          return chore
        }

        if (!chore.completed || !chore.completedAt) {
          return chore
        }

        const nextReset = calculateNextResetTimestamp(chore.completedAt, chore.recurrence)
        if (!nextReset || now < nextReset) {
          return chore
        }

        const currentAssignees = normalizeAssignees(chore.assignedTo)
        const nextAssignee = chore.rotateAssignment
          ? getNextRotationAssignee(prev.familyMembers, currentAssignees[0] ?? null)
          : currentAssignees[0] ?? null
        const nextAssignments = chore.rotateAssignment
          ? normalizeAssignees(nextAssignee)
          : currentAssignees

        updated = true

        return {
          ...chore,
          completed: false,
          completedAt: null,
          assignedTo: nextAssignments,
        }
      })

      if (!updated) {
        return prev
      }

      return {
        ...prev,
        chores: updatedChores,
      }
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState((current) => ({
          ...current,
          ...parsed,
          chores: Array.isArray(parsed?.chores)
            ? parsed.chores.map((chore) => withSchedule(chore))
            : current.chores,
        }))
      }
    } catch (error) {
      console.warn('Unable to read Famboard data from storage', error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Unable to persist Famboard data', error)
    }
  }, [state, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    runRecurrenceCheck()
  }, [isHydrated, state.chores, state.familyMembers, runRecurrenceCheck])

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return undefined
    const timer = window.setInterval(runRecurrenceCheck, 60 * 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [isHydrated, runRecurrenceCheck])

  useEffect(() => {
    if (!isHydrated || typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', state.theme === 'dark')
  }, [state.theme, isHydrated])

  const actions = useMemo(
    () => ({
      setTheme: (theme) =>
        setState((prev) => ({
          ...prev,
          theme,
        })),
      dismissPwaInstallPrompt: () =>
        setState((prev) => ({
          ...prev,
          pwaInstallDismissedAt: new Date().toISOString(),
        })),
      upsertMediaItem: (item) =>
        setState((prev) => {
          if (!item?.id) return prev
          const existingIndex = prev.mediaLibrary.findIndex((media) => media.id === item.id)
          const nextLibrary = [...prev.mediaLibrary]
          if (existingIndex >= 0) {
            nextLibrary[existingIndex] = { ...nextLibrary[existingIndex], ...item }
          } else {
            nextLibrary.push(item)
          }
          nextLibrary.sort((a, b) => {
            const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0
            const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0
            return bTime - aTime
          })
          return {
            ...prev,
            mediaLibrary: nextLibrary,
          }
        }),
      removeMediaItem: (id) =>
        setState((prev) => {
          if (!prev.mediaLibrary.some((media) => media.id === id)) {
            return prev
          }
          return {
            ...prev,
            mediaLibrary: prev.mediaLibrary.filter((media) => media.id !== id),
            familyMembers: prev.familyMembers.map((member) =>
              member.imageId === id ? { ...member, imageId: null } : member,
            ),
            chores: prev.chores.map((chore) =>
              chore.imageId === id ? { ...chore, imageId: null } : chore,
            ),
            rewards: prev.rewards.map((reward) =>
              reward.imageId === id ? { ...reward, imageId: null } : reward,
            ),
          }
        }),
      addFamilyMember: (payload) =>
        setState((prev) => ({
          ...prev,
          familyMembers: [
            ...prev.familyMembers,
            {
              id: createId('member'),
              name: payload.name,
              points: 0,
              imageId: payload.imageId ?? null,
              imageUrl: payload.imageUrl ?? '',
            },
          ],
        })),
      setActiveView: (view) =>
        setState((prev) => {
          if (view !== 'family' && !prev.familyMembers.some((member) => member.id === view)) {
            return prev
          }
          return {
            ...prev,
            activeView: view,
          }
        }),
      updateFamilyMember: (id, updates) =>
        setState((prev) => ({
          ...prev,
          familyMembers: prev.familyMembers.map((member) => {
            if (member.id !== id) return member
            return {
              ...member,
              ...updates,
              imageId: updates.imageId !== undefined ? updates.imageId : member.imageId ?? null,
              imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : member.imageUrl ?? '',
            }
          }),
        })),
      removeFamilyMember: (id) =>
        setState((prev) => ({
          ...prev,
          familyMembers: prev.familyMembers.filter((member) => member.id !== id),
          chores: prev.chores.map((chore) => {
            const current = normalizeAssignees(chore.assignedTo)
            if (!current.includes(id)) {
              return chore
            }
            const remaining = current.filter((memberId) => memberId !== id)
            return {
              ...chore,
              assignedTo: remaining,
              rotateAssignment:
                remaining.length <= 1 ? Boolean(chore.rotateAssignment) : false,
            }
          }),
          activeView: prev.activeView === id ? 'family' : prev.activeView,
        })),
      addChore: (payload) =>
        setState((prev) => {
          const requested = normalizeAssignees(payload.assignedTo)
          let assigned = requested
          if (payload.rotateAssignment && assigned.length === 0 && prev.familyMembers[0]?.id) {
            assigned = [prev.familyMembers[0].id]
          }
          const rotateAssignment = Boolean(payload.rotateAssignment) && assigned.length <= 1

          return {
            ...prev,
            chores: [
              ...prev.chores,
              withSchedule({
                id: createId('chore'),
                title: payload.title,
                description: payload.description,
                assignedTo: assigned,
                points: Math.max(Number(payload.points) || 0, 0),
                completed: false,
                completedAt: null,
                imageId: payload.imageId ?? null,
                imageUrl: payload.imageUrl ?? '',
                recurrence: payload.recurrence ?? 'none',
                rotateAssignment,
                schedule: payload.schedule,
              }),
            ],
          }
        }),
      updateChore: (id, updates) =>
        setState((prev) => {
          const existing = prev.chores.find((chore) => chore.id === id)
          if (!existing) return prev

          const existingAssigned = normalizeAssignees(existing.assignedTo)
          const nextPoints =
            updates.points !== undefined
              ? Math.max(Number(updates.points) || 0, 0)
              : existing.points
          let nextAssigned =
            updates.assignedTo !== undefined
              ? normalizeAssignees(updates.assignedTo)
              : existingAssigned

          const nextRecurrence = updates.recurrence ?? existing.recurrence ?? 'none'
          let nextRotateAssignment =
            updates.rotateAssignment !== undefined
              ? Boolean(updates.rotateAssignment)
              : existing.rotateAssignment ?? false

          if (nextAssigned.length > 1) {
            nextRotateAssignment = false
          }

          if (nextRotateAssignment && nextAssigned.length === 0 && prev.familyMembers.length > 0) {
            nextAssigned = [prev.familyMembers[0].id]
          }

          const updatedChores = prev.chores.map((chore) =>
            chore.id === id
              ? withSchedule({
                  ...chore,
                  ...updates,
                  assignedTo: [...nextAssigned],
                  points: nextPoints,
                  imageId: updates.imageId !== undefined ? updates.imageId : chore.imageId ?? null,
                  imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : chore.imageUrl,
                  recurrence: nextRecurrence,
                  rotateAssignment: nextRotateAssignment,
                  schedule: updates.schedule ?? chore.schedule,
                })
              : chore,
          )

          let familyMembers = prev.familyMembers
          if (existing.completed) {
            const previousSet = new Set(existingAssigned)
            const nextSet = new Set(nextAssigned)
            familyMembers = prev.familyMembers.map((member) => {
              const wasAssigned = previousSet.has(member.id)
              const willBeAssigned = nextSet.has(member.id)

              if (!wasAssigned && !willBeAssigned) {
                return member
              }

              if (wasAssigned && !willBeAssigned) {
                return {
                  ...member,
                  points: Math.max(member.points - existing.points, 0),
                }
              }

              if (!wasAssigned && willBeAssigned) {
                return {
                  ...member,
                  points: Math.max(member.points + nextPoints, 0),
                }
              }

              // Member stayed assigned; adjust if points changed
              const delta = nextPoints - existing.points
              return {
                ...member,
                points: Math.max(member.points + delta, 0),
              }
            })
          }

          return {
            ...prev,
            chores: updatedChores,
            familyMembers,
          }
        }),
      removeChore: (id) =>
        setState((prev) => {
          const target = prev.chores.find((chore) => chore.id === id)
          if (!target) return prev

          const updatedChores = prev.chores.filter((chore) => chore.id !== id)
          let familyMembers = prev.familyMembers
          if (target.completed) {
            const assignees = normalizeAssignees(target.assignedTo)
            familyMembers = prev.familyMembers.map((member) => {
              if (!assignees.includes(member.id)) {
                return member
              }
              return {
                ...member,
                points: Math.max(member.points - target.points, 0),
              }
            })
          }

          return {
            ...prev,
            chores: updatedChores,
            familyMembers,
          }
        }),
      toggleChoreComplete: (id) =>
        setState((prev) => {
          const target = prev.chores.find((chore) => chore.id === id)
          if (!target) return prev
          const updatedStatus = !target.completed
          const updatedChores = prev.chores.map((chore) =>
            chore.id === id
              ? {
                  ...chore,
                  completed: updatedStatus,
                  completedAt: updatedStatus ? new Date().toISOString() : null,
                }
              : chore,
          )

          let updatedMembers = prev.familyMembers
          const assignees = normalizeAssignees(target.assignedTo)
          if (assignees.length > 0) {
            updatedMembers = prev.familyMembers.map((member) => {
              if (!assignees.includes(member.id)) {
                return member
              }
              return {
                ...member,
                points: Math.max(
                  member.points + (updatedStatus ? target.points : -target.points),
                  0,
                ),
              }
            })
          }

          return {
            ...prev,
            chores: updatedChores,
            familyMembers: updatedMembers,
          }
        }),
      addReward: (payload) =>
        setState((prev) => ({
          ...prev,
          rewards: [
            ...prev.rewards,
            {
              id: createId('reward'),
              title: payload.title,
              description: payload.description,
              cost: Math.max(Number(payload.cost) || 0, 0),
              imageId: payload.imageId ?? null,
              imageUrl: payload.imageUrl ?? '',
            },
          ],
        })),
      updateReward: (id, updates) =>
        setState((prev) => ({
          ...prev,
          rewards: prev.rewards.map((reward) =>
            reward.id === id
              ? {
                  ...reward,
                  ...updates,
                  cost:
                    updates.cost !== undefined
                      ? Math.max(Number(updates.cost) || 0, 0)
                      : reward.cost,
                  imageId: updates.imageId !== undefined ? updates.imageId : reward.imageId ?? null,
                  imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : reward.imageUrl,
                }
              : reward,
          ),
        })),
      removeReward: (id) =>
        setState((prev) => ({
          ...prev,
          rewards: prev.rewards.filter((reward) => reward.id !== id),
        })),
      redeemReward: (memberId, rewardId) =>
        setState((prev) => {
          const member = prev.familyMembers.find((item) => item.id === memberId)
          const reward = prev.rewards.find((item) => item.id === rewardId)
          if (!member || !reward) return prev
          if (member.points < reward.cost) return prev

          const familyMembers = prev.familyMembers.map((item) =>
            item.id === memberId
              ? { ...item, points: item.points - reward.cost }
              : item,
          )

          return {
            ...prev,
            familyMembers,
          }
        }),
      setSettingsPin: (pinData) =>
        setState((prev) => ({
          ...prev,
          settingsPin: pinData,
        })),
      clearSettingsPin: () =>
        setState((prev) => ({
          ...prev,
          settingsPin: null,
        })),
      resetAll: () =>
        setState((prev) => ({
          ...defaultData,
          theme: state.theme,
          activeView: 'family',
          mediaLibrary: prev.mediaLibrary,
          settingsPin: prev.settingsPin,
          pwaInstallDismissedAt: prev.pwaInstallDismissedAt,
        })),
    }),
    [state.theme],
  )

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      ...actions,
    }),
    [actions, state, isHydrated],
  )

  return (
    <FamboardContext.Provider value={value}>
      {children}
    </FamboardContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFamboard() {
  const context = useContext(FamboardContext)
  if (!context) {
    throw new Error('useFamboard must be used within a FamboardProvider')
  }
  return context
}
