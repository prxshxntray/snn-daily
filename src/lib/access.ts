import { isLessonUnlocked } from './unlock.ts'

export function isLevelOpen(args: {
  order: number
  id: string
  startDate: string
  today: string
  count: number
  readAheadAll: boolean
  readAheadIds: readonly string[]
  cleared: boolean
  resumeId: string | null
  frontier: number
}): boolean {
  if (args.cleared || args.resumeId === args.id || args.order <= args.frontier + 1) return true
  return isLessonUnlocked({
    day: args.order,
    lessonId: args.id,
    startDate: args.startDate,
    today: args.today,
    readAheadAll: args.readAheadAll,
    readAheadIds: args.readAheadIds,
  }) && args.order <= args.count
}
