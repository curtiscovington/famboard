export function getAssignedMemberIds(chore) {
  if (!chore) return []
  const value = chore.assignedTo
  if (Array.isArray(value)) {
    return Array.from(new Set(value.filter(Boolean)))
  }
  if (value) {
    return [value]
  }
  return []
}

export function isMemberAssignedToChore(chore, memberId) {
  if (!memberId) return false
  return getAssignedMemberIds(chore).includes(memberId)
}

export function formatMemberNameList(names) {
  if (!Array.isArray(names) || names.length === 0) {
    return ''
  }
  if (names.length === 1) {
    return names[0]
  }
  if (names.length === 2) {
    return `${names[0]} & ${names[1]}`
  }
  const leading = names.slice(0, -1).join(', ')
  const last = names[names.length - 1]
  return `${leading}, & ${last}`
}
