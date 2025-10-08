import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'famboard-state-v1'

const defaultData = {
  theme: 'light',
  activeView: 'family',
  familyMembers: [
    {
      id: 'member-1',
      name: 'Alex',
      points: 0,
      imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'member-2',
      name: 'Jamie',
      points: 0,
      imageUrl: 'https://images.unsplash.com/photo-1520719627573-5e2c1a6610f0?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'member-3',
      name: 'Riley',
      points: 0,
      imageUrl: 'https://images.unsplash.com/photo-1445633883498-7f9922d37a3d?auto=format&fit=crop&w=160&q=80',
    },
  ],
  chores: [
    {
      id: 'chore-1',
      title: 'Clear the dinner table',
      description: 'Tidy up after meals and wipe the table clean.',
      assignedTo: 'member-1',
      points: 10,
      completed: false,
      completedAt: null,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'chore-2',
      title: 'Feed the pets',
      description: 'Fresh water and food for the pets before school.',
      assignedTo: 'member-2',
      points: 8,
      completed: false,
      completedAt: null,
      imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'chore-3',
      title: 'Laundry helper',
      description: 'Sort colors and help fold clothes.',
      assignedTo: 'member-3',
      points: 12,
      completed: false,
      completedAt: null,
      imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=200&q=80',
    },
  ],
  rewards: [
    {
      id: 'reward-1',
      title: 'Pick the family movie',
      description: 'Choose the movie for Friday movie night.',
      cost: 30,
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'reward-2',
      title: 'Extra 30 minutes of screen time',
      description: 'Enjoy more tablet or console time.',
      cost: 45,
      imageUrl: 'https://images.unsplash.com/photo-1486578077620-8a022ddd481f?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'reward-3',
      title: 'Choose dinner',
      description: 'Decide what the family will have for dinner.',
      cost: 60,
      imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
    },
  ],
}

const FamboardContext = createContext()

const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

export function FamboardProvider({ children }) {
  const [state, setState] = useState(defaultData)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState((current) => ({ ...current, ...parsed }))
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
      addFamilyMember: (payload) =>
        setState((prev) => ({
          ...prev,
          familyMembers: [
            ...prev.familyMembers,
            {
              id: createId('member'),
              name: payload.name,
              points: 0,
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
          familyMembers: prev.familyMembers.map((member) =>
            member.id === id ? { ...member, ...updates } : member,
          ),
        })),
      removeFamilyMember: (id) =>
        setState((prev) => ({
          ...prev,
          familyMembers: prev.familyMembers.filter((member) => member.id !== id),
          chores: prev.chores.map((chore) =>
            chore.assignedTo === id ? { ...chore, assignedTo: null } : chore,
          ),
          activeView: prev.activeView === id ? 'family' : prev.activeView,
        })),
      addChore: (payload) =>
        setState((prev) => ({
          ...prev,
          chores: [
            ...prev.chores,
            {
              id: createId('chore'),
              title: payload.title,
              description: payload.description,
              assignedTo: payload.assignedTo ?? null,
              points: Math.max(Number(payload.points) || 0, 0),
              completed: false,
              completedAt: null,
              imageUrl: payload.imageUrl ?? '',
            },
          ],
        })),
      updateChore: (id, updates) =>
        setState((prev) => {
          const existing = prev.chores.find((chore) => chore.id === id)
          if (!existing) return prev

          const nextPoints =
            updates.points !== undefined
              ? Math.max(Number(updates.points) || 0, 0)
              : existing.points
          const nextAssigned =
            updates.assignedTo !== undefined ? updates.assignedTo : existing.assignedTo

          const updatedChores = prev.chores.map((chore) =>
            chore.id === id
              ? {
                  ...chore,
                  ...updates,
                  assignedTo: nextAssigned ?? null,
                  points: nextPoints,
                  imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : chore.imageUrl,
                }
              : chore,
          )

          let familyMembers = prev.familyMembers
          if (existing.completed) {
            familyMembers = prev.familyMembers.map((member) => {
              if (member.id === existing.assignedTo && existing.assignedTo !== nextAssigned) {
                return {
                  ...member,
                  points: Math.max(member.points - existing.points, 0),
                }
              }
              if (member.id === nextAssigned) {
                const basePoints =
                  nextAssigned === existing.assignedTo ? member.points : member.points + nextPoints
                const adjusted =
                  nextAssigned === existing.assignedTo
                    ? member.points + (nextPoints - existing.points)
                    : basePoints
                return { ...member, points: Math.max(adjusted, 0) }
              }
              return member
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
          if (target.completed && target.assignedTo) {
            familyMembers = prev.familyMembers.map((member) =>
              member.id === target.assignedTo
                ? {
                    ...member,
                    points: Math.max(member.points - target.points, 0),
                  }
                : member,
            )
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
          if (target.assignedTo) {
            updatedMembers = prev.familyMembers.map((member) =>
              member.id === target.assignedTo
                ? {
                    ...member,
                    points: Math.max(
                      member.points + (updatedStatus ? target.points : -target.points),
                      0,
                    ),
                  }
                : member,
            )
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
      resetAll: () =>
        setState({
          ...defaultData,
          theme: state.theme,
          activeView: 'family',
        }),
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

export function useFamboard() {
  const context = useContext(FamboardContext)
  if (!context) {
    throw new Error('useFamboard must be used within a FamboardProvider')
  }
  return context
}
