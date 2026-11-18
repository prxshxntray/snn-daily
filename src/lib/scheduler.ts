import { addDays } from './dates.ts'

/**
 * Classic SuperMemo SM-2, in whole days.
 * A miss is due the next morning, which matches a commute rather than a
 * ten-minute Anki learning step. Ease updates on every grade, including lapses.
 */
export type Card = {
  ease: number
  interval: number
  repetitions: number
  due: string
  lapses: number
}

export type Confidence = 'low' | 'solid' | 'easy'

export function newCard(due: string): Card {
  return { ease: 2.5, interval: 0, repetitions: 0, due, lapses: 0 }
}

export function reviewCard(card: Card, quality: number, today: string): Card {
  const q = Math.max(0, Math.min(5, Math.round(quality)))
  let ease = card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  if (ease < 1.3) ease = 1.3

  let interval: number
  let repetitions: number
  let lapses = card.lapses
  if (q < 3) {
    repetitions = 0
    interval = 1
    lapses += 1
  } else if (card.repetitions <= 0) {
    interval = 1
    repetitions = 1
  } else if (card.repetitions === 1) {
    interval = 6
    repetitions = 2
  } else {
    interval = Math.max(1, Math.round(card.interval * ease))
    repetitions = card.repetitions + 1
  }

  return {
    ease,
    interval,
    repetitions,
    lapses,
    due: addDays(today, interval),
  }
}

export function isDue(card: Card, today: string): boolean {
  return card.due <= today
}

export function qualityFor(correct: boolean, confidence: Confidence): number {
  if (!correct) return 1
  if (confidence === 'low') return 3
  if (confidence === 'easy') return 5
  return 4
}

/** Misses and low-confidence hits enter review. A card already in the box stays there. */
export function entersReview(
  correct: boolean,
  confidence: Confidence,
  alreadyTracked: boolean,
): boolean {
  if (!correct || confidence === 'low') return true
  return alreadyTracked
}

export function cardKey(lessonId: string, questionId: string): string {
  return `${lessonId}:${questionId}`
}
