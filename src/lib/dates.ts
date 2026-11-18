const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isISODate(value: string): boolean {
  const match = ISO_DATE.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const utc = new Date(Date.UTC(year, month - 1, day))
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  )
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function formatISODate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Calendar day on the device clock, not UTC. */
export function todayISO(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return formatISODate(date)
}

/** Whole calendar days from `from` to `to`. Negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const ms = parseISODate(to).getTime() - parseISODate(from).getTime()
  return Math.round(ms / 86_400_000)
}

export function weekdayIndexMonday(iso: string): number {
  const sunday0 = parseISODate(iso).getUTCDay()
  return (sunday0 + 6) % 7
}

export function formatWeekday(iso: string): string {
  return WEEKDAYS[parseISODate(iso).getUTCDay()]
}

export function formatMonthDay(iso: string): string {
  const date = parseISODate(iso)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

export function formatFullDate(iso: string): string {
  return `${formatWeekday(iso)}, ${formatMonthDay(iso)}`
}

/** Columns are weeks, Monday on top, ending in the week that contains `today`. */
export function heatmapWeeks(today: string, weeks = 16): string[][] {
  const monday = addDays(today, -weekdayIndexMonday(today))
  const start = addDays(monday, -(weeks - 1) * 7)
  const columns: string[][] = []
  for (let week = 0; week < weeks; week += 1) {
    const column: string[] = []
    for (let day = 0; day < 7; day += 1) {
      column.push(addDays(start, week * 7 + day))
    }
    columns.push(column)
  }
  return columns
}
