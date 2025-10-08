export const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'weekdays', label: 'Every weekday (Mon–Fri)' },
  { value: 'weekends', label: 'Every weekend (Sat & Sun)' },
  { value: 'monthly', label: 'Monthly' },
]

export function getRecurrenceLabel(value) {
  const match = RECURRENCE_OPTIONS.find((option) => option.value === value)
  return match ? match.label : 'Does not repeat'
}

export function calculateNextResetTimestamp(completedAt, recurrence) {
  if (!completedAt || !recurrence || recurrence === 'none') {
    return null
  }

  const base = new Date(completedAt)
  if (Number.isNaN(base.getTime())) {
    return null
  }

  switch (recurrence) {
    case 'daily': {
      base.setDate(base.getDate() + 1)
      break
    }
    case 'weekly': {
      base.setDate(base.getDate() + 7)
      break
    }
    case 'monthly': {
      const date = base.getDate()
      base.setMonth(base.getMonth() + 1)
      const lastDayOfMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
      base.setDate(Math.min(date, lastDayOfMonth))
      break
    }
    case 'weekdays': {
      do {
        base.setDate(base.getDate() + 1)
      } while (isWeekend(base))
      break
    }
    case 'weekends': {
      do {
        base.setDate(base.getDate() + 1)
      } while (!isWeekend(base))
      break
    }
    default:
      return null
  }

  return base.getTime()
}

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getNextRotationAssignee(familyMembers, currentAssignedId) {
  if (!familyMembers || familyMembers.length === 0) {
    return null
  }

  if (!currentAssignedId) {
    return familyMembers[0].id
  }

  const currentIndex = familyMembers.findIndex((member) => member.id === currentAssignedId)
  if (currentIndex === -1) {
    return familyMembers[0].id
  }

  const nextIndex = (currentIndex + 1) % familyMembers.length
  return familyMembers[nextIndex].id
}
