import { defaultStartDate } from '../course.ts'
import { addDays } from './dates.ts'
import { DAILY_GOAL_XP, LEVEL_XP, gradeConcept, type ConceptMemory, type Pace } from './mastery.ts'

export type LevelClear = {
  on: string
  correct: number
  total: number
}

export type DayActivity = {
  xp: number
  attempted: number
  correct: number
}

export type StudyState = {
  version: 2
  courseId: string
  startDateOverride: string | null
  readAheadAll: boolean
  readAheadIds: string[]
  muted: boolean
  xp: number
  concepts: Record<string, ConceptMemory>
  levelClears: Record<string, LevelClear>
  activity: Record<string, DayActivity>
  installHintDismissed: boolean
  resume: { levelId: string; cardIndex: number } | null
}

export function emptyState(): StudyState {
  return {
    version: 2,
    courseId: 'snn',
    startDateOverride: null,
    readAheadAll: false,
    readAheadIds: [],
    muted: false,
    xp: 0,
    concepts: {},
    levelClears: {},
    activity: {},
    installHintDismissed: false,
    resume: null,
  }
}

export function startDateOf(state: StudyState): string {
  return state.startDateOverride ?? defaultStartDate
}

export function applyGrade(
  state: StudyState,
  input: { concept: string; levelId: string; cardId: string; pace: Pace; today: string },
): StudyState {
  const concept = gradeConcept(state.concepts[input.concept], {
    levelId: input.levelId,
    cardId: input.cardId,
    pace: input.pace,
    today: input.today,
  })
  const day = state.activity[input.today] ?? { xp: 0, attempted: 0, correct: 0 }
  return {
    ...state,
    concepts: { ...state.concepts, [input.concept]: concept },
    activity: {
      ...state.activity,
      [input.today]: {
        xp: day.xp,
        attempted: day.attempted + 1,
        correct: day.correct + (input.pace === 'wrong' ? 0 : 1),
      },
    },
  }
}

export function setResume(
  state: StudyState,
  resume: { levelId: string; cardIndex: number } | null,
): StudyState {
  return { ...state, resume }
}

export function clearLevel(
  state: StudyState,
  input: { levelId: string; today: string; correct: number; total: number; xp?: number },
): StudyState {
  if (state.levelClears[input.levelId]) return state
  const gain = input.xp ?? LEVEL_XP
  const day = state.activity[input.today] ?? { xp: 0, attempted: 0, correct: 0 }
  return {
    ...state,
    xp: state.xp + gain,
    levelClears: {
      ...state.levelClears,
      [input.levelId]: { on: input.today, correct: input.correct, total: input.total },
    },
    activity: {
      ...state.activity,
      [input.today]: { ...day, xp: day.xp + gain },
    },
  }
}

export function grantXp(state: StudyState, today: string, amount: number): StudyState {
  if (amount <= 0) return state
  const day = state.activity[today] ?? { xp: 0, attempted: 0, correct: 0 }
  return {
    ...state,
    xp: state.xp + amount,
    activity: { ...state.activity, [today]: { ...day, xp: day.xp + amount } },
  }
}

export function todayXp(state: StudyState, today: string): number {
  return state.activity[today]?.xp ?? 0
}

export function goalProgress(state: StudyState, today: string, goal = DAILY_GOAL_XP): number {
  return Math.max(0, Math.min(1, todayXp(state, today) / goal))
}

export function computeStreak(activity: StudyState['activity'], today: string): number {
  const active = new Set(
    Object.entries(activity)
      .filter(([, value]) => value.attempted > 0 || value.xp > 0)
      .map(([date]) => date),
  )
  let cursor = today
  if (!active.has(cursor)) {
    const yesterday = addDays(today, -1)
    if (!active.has(yesterday)) return 0
    cursor = yesterday
  }
  let streak = 0
  while (active.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function markReadAhead(state: StudyState, levelId: string): StudyState {
  if (state.readAheadIds.includes(levelId)) return state
  return { ...state, readAheadIds: [...state.readAheadIds, levelId] }
}

export function resetProgress(state: StudyState): StudyState {
  return {
    ...emptyState(),
    courseId: state.courseId,
    startDateOverride: state.startDateOverride,
    readAheadAll: state.readAheadAll,
    muted: state.muted,
    installHintDismissed: state.installHintDismissed,
  }
}

export { DAILY_GOAL_XP }
