import { reviewCard, newCard, type Card } from './scheduler.ts'

/** A fast tap. Slower than this, but still correct, is a normal answer. */
export const FAST_MS = 4000
/** Correct, but slow enough that the idea should be shown again more simply. */
export const SLOW_MS = 9000

export const LEVEL_XP = 15
export const SHAKY_XP = 10
export const BONUS_XP = 5
export const REVIEW_XP = 5
export const DAILY_GOAL_XP = 20

export type Pace = 'wrong' | 'slow' | 'ok' | 'fast'

export type ConceptMemory = Card & {
  levelId: string
  cardId: string
  correct: number
  total: number
  fast: number
}

export function paceOf(correct: boolean, elapsedMs: number): Pace {
  if (!correct) return 'wrong'
  if (elapsedMs >= SLOW_MS) return 'slow'
  if (elapsedMs <= FAST_MS) return 'fast'
  return 'ok'
}

export function qualityForPace(pace: Pace): number {
  if (pace === 'wrong') return 1
  if (pace === 'slow') return 3
  if (pace === 'fast') return 5
  return 4
}

export function losesHeart(pace: Pace): boolean {
  return pace === 'wrong'
}

export function needsSimpler(pace: Pace): boolean {
  return pace === 'wrong' || pace === 'slow'
}

export function offerSkip(pace: Pace): boolean {
  return pace === 'fast'
}

/** Misses and slow hits always come back. A card already in the box stays there. */
export function shouldSchedule(pace: Pace, alreadyTracked: boolean): boolean {
  if (pace === 'wrong' || pace === 'slow') return true
  return alreadyTracked
}

/** A concept is waiting for review only after it has been scheduled (interval set). */
export function isConceptDue(memory: ConceptMemory, today: string): boolean {
  return memory.interval > 0 && memory.due <= today
}

export function freshConcept(levelId: string, cardId: string, today: string): ConceptMemory {
  return { ...newCard(today), levelId, cardId, correct: 0, total: 0, fast: 0 }
}

export function gradeConcept(
  previous: ConceptMemory | undefined,
  input: { levelId: string; cardId: string; pace: Pace; today: string },
): ConceptMemory {
  const base = previous ?? freshConcept(input.levelId, input.cardId, input.today)
  const correct = input.pace !== 'wrong'
  const next: ConceptMemory = {
    ...base,
    levelId: input.levelId,
    cardId: input.cardId,
    correct: base.correct + (correct ? 1 : 0),
    total: base.total + 1,
    fast: base.fast + (input.pace === 'fast' ? 1 : 0),
  }
  if (!shouldSchedule(input.pace, Boolean(previous))) return next
  const reviewed = reviewCard(base, qualityForPace(input.pace), input.today)
  return { ...next, ...reviewed, levelId: input.levelId, cardId: input.cardId }
}
