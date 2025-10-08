const DAY_IN_MS = 24 * 60 * 60 * 1000

export function startOfDay(value = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return startOfDay(new Date())
  }
  date.setHours(0, 0, 0, 0)
  return date
}

export function endOfDay(value = new Date()) {
  const date = startOfDay(value)
  date.setHours(23, 59, 59, 999)
  return date
}

export function addDays(value, amount) {
  const date = new Date(value)
  date.setDate(date.getDate() + amount)
  return date
}

export function startOfWeek(value = new Date()) {
  const date = startOfDay(value)
  const day = date.getDay()
  return addDays(date, -day)
}

export function endOfWeek(value = new Date()) {
  const date = startOfWeek(value)
  return addDays(date, 6)
}

export function startOfMonth(value = new Date()) {
  const date = startOfDay(value)
  date.setDate(1)
  return date
}

export function endOfMonth(value = new Date()) {
  const date = startOfMonth(value)
  date.setMonth(date.getMonth() + 1)
  date.setDate(0)
  return endOfDay(date)
}

export function toStartOfDayISOString(value = new Date()) {
  return startOfDay(value).toISOString()
}

export function formatDateForInput(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseInputDateToISO(value, fallback) {
  if (!value) {
    return fallback ? toStartOfDayISOString(fallback) : toStartOfDayISOString(new Date())
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return fallback ? toStartOfDayISOString(fallback) : toStartOfDayISOString(new Date())
  }
  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) {
    return fallback ? toStartOfDayISOString(fallback) : toStartOfDayISOString(new Date())
  }
  return toStartOfDayISOString(date)
}

export function formatDateLabel(value, options) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

export function getDateKey(value) {
  return formatDateForInput(startOfDay(value).toISOString())
}

export function isWeekend(value) {
  const date = new Date(value)
  const day = date.getDay()
  return day === 0 || day === 6
}

export function addMonthsPreservingDay(value, amount, anchorDay) {
  const date = startOfDay(value)
  const targetDay = anchorDay ?? date.getDate()
  date.setMonth(date.getMonth() + amount)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  date.setDate(Math.min(targetDay, lastDay))
  return date
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  const first = startOfDay(a)
  const second = startOfDay(b)
  return first.getTime() === second.getTime()
}

export const DAY_MS = DAY_IN_MS
