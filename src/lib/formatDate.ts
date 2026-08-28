const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** 1st, 2nd, 3rd, 4th … 11th, 12th, 13th, 21st. */
function ordinal(day: number): string {
  if (day > 3 && day < 21) return `${day}th`
  switch (day % 10) {
    case 1: return `${day}st`
    case 2: return `${day}nd`
    case 3: return `${day}rd`
    default: return `${day}th`
  }
}

function parse(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `Mon, 12th Jan 2024` */
export function formatDate(value: Date | string | null | undefined): string {
  const date = parse(value)
  if (!date) return '—'
  return `${WEEKDAYS[date.getDay()]}, ${ordinal(date.getDate())} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** `12:05 pm` */
export function formatTime(value: Date | string | null | undefined): string {
  const date = parse(value)
  if (!date) return '—'
  const hours = date.getHours()
  const suffix = hours < 12 ? 'am' : 'pm'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(date.getMinutes()).padStart(2, '0')} ${suffix}`
}

/** `Mon, 12th Jan 2024 12:05 pm` */
export function formatDateTime(value: Date | string | null | undefined): string {
  const date = parse(value)
  if (!date) return '—'
  return `${formatDate(date)} ${formatTime(date)}`
}
