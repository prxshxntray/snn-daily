import { addDays, daysBetween } from './dates.ts'

export type CurriculumResolution =
  | { status: 'before-start'; day: 1; daysUntil: number }
  | { status: 'lesson'; day: number }
  | { status: 'finished'; reviewDay: number }

/**
 * Day 1 opens on startDate. Each later calendar day unlocks one more lesson.
 * After the last lesson, reviewDay cycles through the curriculum so a widget
 * still has a morning question.
 */
export function resolveCurriculumDay(
  startDate: string,
  lessonCount: number,
  today: string,
): CurriculumResolution {
  const diff = daysBetween(startDate, today)
  if (lessonCount <= 0) return { status: 'before-start', day: 1, daysUntil: Math.max(-diff, 0) }
  if (diff < 0) return { status: 'before-start', day: 1, daysUntil: -diff }
  if (diff < lessonCount) return { status: 'lesson', day: diff + 1 }
  const reviewDay = ((diff - lessonCount) % lessonCount) + 1
  return { status: 'finished', reviewDay }
}

export function lessonOpenDate(startDate: string, day: number): string {
  return addDays(startDate, day - 1)
}

export function isLessonUnlocked(args: {
  day: number
  lessonId: string
  startDate: string
  today: string
  readAheadAll: boolean
  readAheadIds: readonly string[]
}): boolean {
  if (args.readAheadAll) return true
  if (args.readAheadIds.includes(args.lessonId)) return true
  return daysBetween(args.startDate, args.today) >= args.day - 1
}

/** Highest lesson day that is open from the calendar alone (0 if the course has not started). */
export function unlockedThroughDay(startDate: string, today: string, lessonCount: number): number {
  const diff = daysBetween(startDate, today)
  if (diff < 0) return 0
  return Math.min(lessonCount, diff + 1)
}
