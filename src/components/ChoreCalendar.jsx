import { Fragment, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getRecurrenceLabel } from '../utils/recurrence.js'
import {
  addDays,
  addMonthsPreservingDay,
  endOfMonth,
  endOfWeek,
  formatDateLabel,
  getDateKey,
  isSameDay,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toStartOfDayISOString,
  DAY_MS,
} from '../utils/date.js'

const VIEWS = [
  { id: 'day', label: 'Day view' },
  { id: 'week', label: 'Week view' },
  { id: 'month', label: 'Month view' },
]

export function ChoreCalendar({ chores, familyMembers, focusMember, onToggleChore }) {
  const [activeView, setActiveView] = useState('week')
  const [focusDate, setFocusDate] = useState(() => startOfDay(new Date()))
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isFullscreen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  const memberMap = useMemo(() => {
    const map = new Map()
    familyMembers.forEach((member) => {
      map.set(member.id, member)
    })
    return map
  }, [familyMembers])

  const range = useMemo(() => computeRange(activeView, focusDate), [activeView, focusDate])
  const daysInRange = useMemo(() => createDateRange(range.start, range.end), [range.start, range.end])
  const occurrenceMap = useMemo(
    () => buildOccurrenceMap(chores, familyMembers, range.start, range.end),
    [chores, familyMembers, range.start, range.end],
  )

  const focusKey = getDateKey(focusDate)
  const todayKey = getDateKey(new Date())

  const focusLabel = useMemo(
    () => formatRangeLabel(activeView, focusDate, range),
    [activeView, focusDate, range],
  )

  const goToPrevious = () => {
    setFocusDate((current) => {
      if (activeView === 'day') return startOfDay(addDays(current, -1))
      if (activeView === 'week') return startOfDay(addDays(current, -7))
      return addMonthsPreservingDay(current, -1, current.getDate())
    })
  }

  const goToNext = () => {
    setFocusDate((current) => {
      if (activeView === 'day') return startOfDay(addDays(current, 1))
      if (activeView === 'week') return startOfDay(addDays(current, 7))
      return addMonthsPreservingDay(current, 1, current.getDate())
    })
  }

  const goToToday = () => {
    setFocusDate(startOfDay(new Date()))
  }

  const subjectLabel = focusMember
    ? `${focusMember.name}’s schedule`
    : 'Family schedule'

  const dayOccurrences = occurrenceMap.get(focusKey) ?? []

  const weeksForMonth = useMemo(() => {
    if (activeView !== 'month') return []
    const chunked = []
    for (let index = 0; index < daysInRange.length; index += 7) {
      chunked.push(daysInRange.slice(index, index + 7))
    }
    return chunked
  }, [activeView, daysInRange])

  const calendarSections = (
    <>
      <header className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between lg:items-center">
          <div className="space-y-1">
            <h2 className="font-display text-2xl text-slate-800 dark:text-white">Chore calendar</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subjectLabel} · Normalized for future Google, Apple, or Outlook calendar syncs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFullscreen((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFullscreen
                ? 'bg-slate-900 text-white shadow-lg focus:ring-slate-600 focus:ring-offset-slate-100 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 dark:focus:ring-slate-600 dark:focus:ring-offset-slate-900'
                : 'bg-famboard-primary text-white shadow-lg hover:-translate-y-0.5 hover:bg-famboard-dark focus:ring-famboard-accent focus:ring-offset-white dark:focus:ring-sky-400 dark:focus:ring-offset-slate-900'
            }`}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? 'Exit full screen calendar view' : 'Open chore calendar in full screen'}
            title={isFullscreen ? 'Exit full screen calendar view' : 'Open chore calendar in full screen'}
          >
            <span aria-hidden="true">{isFullscreen ? '⤡' : '⤢'}</span>
            <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
          </button>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Previous period"
            >
              ‹
            </button>
            <span className="rounded-full bg-famboard-primary/10 px-4 py-2 text-sm font-semibold text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200">
              {focusLabel}
            </span>
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-2 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Next period"
            >
              ›
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Today
            </button>
          </div>
          <div className="space-y-1 text-xs text-slate-400 dark:text-slate-500">
            <p>Use the arrows and view toggles to plan chores at a glance.</p>
            <p className="text-[0.7rem] text-slate-400 dark:text-slate-500">
              Tap “Full screen” whenever you want the calendar to take over the whole board.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {VIEWS.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  activeView === view.id
                    ? 'bg-famboard-primary text-white shadow-lg focus:ring-famboard-accent'
                    : 'bg-white text-slate-600 shadow focus:ring-famboard-primary/40 hover:bg-famboard-primary/10 hover:text-famboard-primary dark:bg-slate-800 dark:text-slate-300'
                }`}
                aria-pressed={activeView === view.id}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {activeView === 'day' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything planned for {formatDateLabel(focusDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
          {dayOccurrences.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300/70 bg-white/70 p-6 text-sm text-slate-500 shadow-inner dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400">
              No chores scheduled for this day. Update an anchor date or recurrence to add something special.
            </p>
          ) : (
            <ul className="space-y-3">
              {dayOccurrences.map((occurrence) => (
                <li key={occurrence.id}>
                  <CalendarDayCard
                    occurrence={occurrence}
                    member={memberMap.get(occurrence.assignedTo) ?? null}
                    todayKey={todayKey}
                    onToggle={onToggleChore}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeView === 'week' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {daysInRange.map((date) => {
            const key = getDateKey(date)
            const occurrences = occurrenceMap.get(key) ?? []
            const isToday = key === todayKey
            const isFocused = key === focusKey
            return (
              <article
                key={key}
                className={`flex min-h-[10rem] flex-col rounded-2xl border p-4 shadow-sm transition ${
                  isFocused
                    ? 'border-famboard-primary bg-famboard-primary/5 dark:border-sky-500 dark:bg-sky-500/10'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <header className="mb-3 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {formatDateLabel(date, { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-display ${
                      isToday ? 'text-famboard-primary dark:text-sky-300' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {formatDateLabel(date, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {isToday && (
                    <span className="rounded-full bg-famboard-primary/10 px-3 py-1 text-xs font-semibold text-famboard-primary dark:bg-sky-500/20 dark:text-sky-100">
                      Today
                    </span>
                  )}
                </header>
                <div className="flex flex-1 flex-col gap-2">
                  {occurrences.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500">No chores planned.</p>
                  ) : (
                    occurrences.map((occurrence) => (
                      <EventChip
                        key={occurrence.id}
                        occurrence={occurrence}
                        member={memberMap.get(occurrence.assignedTo) ?? null}
                      />
                    ))
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {activeView === 'month' && (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
              <span key={label} className="text-center">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px rounded-3xl bg-slate-200/80 p-px dark:bg-slate-800/80">
            {weeksForMonth.map((week, index) => (
              <Fragment key={index}>
                {week.map((date) => {
                  const key = getDateKey(date)
                  const occurrences = occurrenceMap.get(key) ?? []
                  const isToday = key === todayKey
                  const isFocused = key === focusKey
                  const isCurrentMonth = date.getMonth() === range.anchorMonth
                  return (
                    <div
                      key={key}
                      className={`flex min-h-[7rem] flex-col gap-1 rounded-2xl border bg-white p-2 text-left shadow-sm dark:bg-slate-900 ${
                        isFocused
                          ? 'border-famboard-primary/60 ring-1 ring-famboard-primary/40 dark:border-sky-500/60 dark:ring-sky-500/40'
                          : 'border-transparent'
                      } ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${
                          isToday ? 'text-famboard-primary dark:text-sky-300' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {date.getDate()}
                        </span>
                        {isToday && (
                          <span className="rounded-full bg-famboard-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold text-famboard-primary dark:bg-sky-500/20 dark:text-sky-100">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        {occurrences.slice(0, 3).map((occurrence) => (
                          <EventChip
                            key={occurrence.id}
                            occurrence={occurrence}
                            member={memberMap.get(occurrence.assignedTo) ?? null}
                            compact
                          />
                        ))}
                        {occurrences.length > 3 && (
                          <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">
                            +{occurrences.length - 3} more chore{occurrences.length - 3 === 1 ? '' : 's'}
                          </p>
                        )}
                        {occurrences.length === 0 && (
                          <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">No chores</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </>
  )

  const calendarContent = <div className="space-y-6">{calendarSections}</div>

  if (!isFullscreen || typeof document === 'undefined') {
    return calendarContent
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-label="Chore calendar full screen view"
    >
      <div className="mx-auto flex min-h-full max-w-7xl flex-col">
        {calendarContent}
      </div>
    </div>,
    document.body,
  )
}

function CalendarDayCard({ occurrence, member, todayKey, onToggle }) {
  const isToday = occurrence.dateKey === todayKey
  const isCompleted = occurrence.isCompletedToday && isToday
  const canToggle = typeof onToggle === 'function' && isToday

  const handleToggle = () => {
    if (!canToggle) return
    onToggle(occurrence.choreId, isCompleted)
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-famboard-primary/60 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-100">{occurrence.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {member ? `Assigned to ${member.name}` : 'Unassigned'} · {getRecurrenceLabel(occurrence.recurrence)}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
              : 'bg-famboard-primary/10 text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200'
          }`}
        >
          {isCompleted ? 'Completed' : `${occurrence.points} pts`}
        </span>
      </div>
      {occurrence.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{occurrence.description}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {canToggle && (
          <button
            type="button"
            onClick={handleToggle}
            aria-pressed={isCompleted}
            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-700 hover:bg-emerald-500/30 focus:ring-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30 dark:focus:ring-emerald-400/40'
                : 'bg-famboard-primary text-white shadow-sm hover:-translate-y-0.5 hover:bg-famboard-dark focus:ring-famboard-accent dark:focus:ring-sky-400'
            }`}
          >
            {isCompleted ? 'Mark as not done' : 'Mark complete'}
          </button>
        )}
        <p className="text-[0.65rem] text-slate-400 dark:text-slate-500">
          Event UID: {occurrence.icsEvent.uid}
        </p>
      </div>
    </div>
  )
}

function EventChip({ occurrence, member, compact = false }) {
  const textClass = compact ? 'text-[0.65rem]' : 'text-xs'
  return (
    <div
      className={`flex items-center gap-2 rounded-full bg-famboard-primary/10 px-3 py-1 font-medium text-famboard-primary dark:bg-sky-500/10 dark:text-sky-200 ${textClass}`}
      data-rrule={occurrence.icsEvent.recurrenceRule ?? undefined}
    >
      <span className="truncate">{occurrence.title}</span>
      {member && <span className="hidden truncate text-[0.6rem] text-slate-500 dark:text-slate-300 sm:inline">{member.name}</span>}
    </div>
  )
}

function computeRange(view, focusDate) {
  const anchor = startOfDay(focusDate)
  if (view === 'day') {
    return {
      start: anchor,
      end: anchor,
      anchorMonth: anchor.getMonth(),
    }
  }
  if (view === 'week') {
    const start = startOfWeek(anchor)
    return {
      start,
      end: endOfWeek(anchor),
      anchorMonth: anchor.getMonth(),
    }
  }
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  return {
    start: startOfWeek(monthStart),
    end: endOfWeek(monthEnd),
    anchorMonth: anchor.getMonth(),
  }
}

function createDateRange(start, end) {
  const dates = []
  const first = startOfDay(start).getTime()
  const last = startOfDay(end).getTime()
  for (let time = first; time <= last; time += DAY_MS) {
    dates.push(new Date(time))
  }
  return dates
}

function formatRangeLabel(view, focusDate, range) {
  if (view === 'day') {
    return formatDateLabel(focusDate, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }
  if (view === 'week') {
    const sameYear = range.start.getFullYear() === range.end.getFullYear()
    const startLabel = formatDateLabel(range.start, { month: 'short', day: 'numeric' })
    const endLabel = formatDateLabel(range.end, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return sameYear ? `${startLabel} – ${endLabel}` : `${startLabel} – ${endLabel}`
  }
  return formatDateLabel(focusDate, { month: 'long', year: 'numeric' })
}

function buildOccurrenceMap(chores, familyMembers, rangeStart, rangeEnd) {
  const map = new Map()
  const start = startOfDay(rangeStart).getTime()
  const end = startOfDay(rangeEnd).getTime()
  for (let time = start; time <= end; time += DAY_MS) {
    const key = getDateKey(new Date(time))
    map.set(key, [])
  }

  const rotationOrder = Array.isArray(familyMembers)
    ? familyMembers.map((member) => member.id).filter(Boolean)
    : []

  chores.forEach((chore) => {
    const anchor = startOfDay(chore?.schedule?.anchorDate ?? new Date())
    const recurrence = chore?.recurrence ?? 'none'
    const occurrenceDates = []

    for (let time = start; time <= end; time += DAY_MS) {
      const date = new Date(time)
      if (!occursOnDate(anchor, recurrence, date)) continue
      occurrenceDates.push(date)
    }

    if (occurrenceDates.length === 0) {
      return
    }

    const assignments = chore.rotateAssignment
      ? computeRotationAssignments({
          dates: occurrenceDates,
          currentAssignedId: chore.assignedTo ?? null,
          rotationOrder,
          anchorDate: anchor,
          recurrence,
        })
      : null

    occurrenceDates.forEach((date, index) => {
      const key = getDateKey(date)
      const existing = map.get(key)
      if (!existing) return
      const assignedTo = assignments ? assignments[index] : chore.assignedTo ?? null
      existing.push(createOccurrence(chore, date, assignedTo))
    })
  })

  Array.from(map.entries()).forEach(([key, events]) => {
    events.sort((a, b) => a.title.localeCompare(b.title))
    map.set(key, events)
  })

  return map
}

function computeRotationAssignments({
  dates,
  currentAssignedId,
  rotationOrder,
  anchorDate,
  recurrence,
}) {
  if (!Array.isArray(dates) || dates.length === 0) return []
  if (!Array.isArray(rotationOrder) || rotationOrder.length === 0) {
    return dates.map(() => null)
  }

  const normalizedAnchor = startOfDay(anchorDate ?? new Date())
  let currentIndex = rotationOrder.indexOf(currentAssignedId)
  if (currentIndex === -1) {
    currentIndex = 0
  }

  const today = startOfDay(new Date())
  let referenceDate = findOccurrenceOnOrBefore(normalizedAnchor, recurrence, today)
  if (!referenceDate) {
    referenceDate = findOccurrenceOnOrAfter(normalizedAnchor, recurrence, today)
  }
  if (!referenceDate) {
    referenceDate = dates[0]
  }

  return dates.map((date) => {
    const occurrenceDelta = countOccurrenceSteps(normalizedAnchor, recurrence, referenceDate, date)
    const memberIndex = wrapRotationIndex(currentIndex + occurrenceDelta, rotationOrder.length)
    return rotationOrder[memberIndex] ?? null
  })
}

function wrapRotationIndex(value, length) {
  if (length === 0) return 0
  const result = value % length
  return result < 0 ? result + length : result
}

function findOccurrenceOnOrBefore(anchor, recurrence, target) {
  const normalizedTarget = startOfDay(target)
  const minimum = startOfDay(anchor)
  const guardLimit = 366 * 10

  let cursor = normalizedTarget
  for (let steps = 0; steps <= guardLimit && cursor.getTime() >= minimum.getTime(); steps += 1) {
    if (occursOnDate(anchor, recurrence, cursor)) {
      return cursor
    }
    cursor = addDays(cursor, -1)
  }
  return null
}

function findOccurrenceOnOrAfter(anchor, recurrence, target) {
  const normalizedTarget = startOfDay(target)
  const guardLimit = 366 * 10

  let cursor = normalizedTarget
  for (let steps = 0; steps <= guardLimit; steps += 1) {
    if (occursOnDate(anchor, recurrence, cursor)) {
      return cursor
    }
    cursor = addDays(cursor, 1)
  }
  return null
}

function countOccurrenceSteps(anchor, recurrence, fromDate, toDate) {
  if (isSameDay(fromDate, toDate)) return 0

  const direction = toDate.getTime() > fromDate.getTime() ? 1 : -1
  let cursor = fromDate
  let steps = 0
  const guardLimit = 366 * 10

  for (let guard = 0; guard <= guardLimit; guard += 1) {
    cursor = addDays(cursor, direction)
    if (occursOnDate(anchor, recurrence, cursor)) {
      steps += direction
    }
    if (isSameDay(cursor, toDate)) {
      return steps
    }
  }

  return steps
}

function occursOnDate(anchor, recurrence, date) {
  const target = startOfDay(date)
  const diffDays = Math.floor((target.getTime() - anchor.getTime()) / DAY_MS)
  if (recurrence === 'none') {
    return diffDays === 0
  }
  if (diffDays < 0) {
    return false
  }
  switch (recurrence) {
    case 'daily':
      return diffDays >= 0
    case 'weekly':
      return diffDays % 7 === 0
    case 'weekdays':
      return !isWeekend(target)
    case 'weekends':
      return isWeekend(target)
    case 'monthly': {
      const monthsApart =
        (target.getFullYear() - anchor.getFullYear()) * 12 +
        (target.getMonth() - anchor.getMonth())
      if (monthsApart < 0) return false
      const candidate = addMonthsPreservingDay(anchor, monthsApart, anchor.getDate())
      return isSameDay(candidate, target)
    }
    default:
      return false
  }
}

function createOccurrence(chore, date, assignedTo) {
  const dateKey = getDateKey(date)
  const isToday = isSameDay(date, new Date())
  return {
    id: `${chore.id}-${dateKey}`,
    choreId: chore.id,
    title: chore.title,
    description: chore.description ?? '',
    date,
    dateKey,
    assignedTo: assignedTo ?? null,
    points: chore.points ?? 0,
    recurrence: chore.recurrence ?? 'none',
    isCompletedToday: Boolean(chore.completed && isToday),
    icsEvent: {
      uid: `${chore.id}-${dateKey}@famboard.local`,
      summary: chore.title,
      start: toStartOfDayISOString(date),
      allDay: true,
      recurrenceRule: mapRecurrenceToRRule(chore.recurrence),
      description: chore.description ?? '',
    },
  }
}

function mapRecurrenceToRRule(recurrence) {
  switch (recurrence) {
    case 'daily':
      return 'FREQ=DAILY'
    case 'weekly':
      return 'FREQ=WEEKLY'
    case 'weekdays':
      return 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR'
    case 'weekends':
      return 'FREQ=WEEKLY;BYDAY=SA,SU'
    case 'monthly':
      return 'FREQ=MONTHLY'
    default:
      return null
  }
}
