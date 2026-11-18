import { describe, expect, it } from 'vitest'
import {
  FAST_MS,
  SLOW_MS,
  gradeConcept,
  losesHeart,
  needsSimpler,
  offerSkip,
  paceOf,
  shouldSchedule,
} from './mastery.ts'

describe('pace', () => {
  it('sorts a tap into wrong, slow, ok, or fast', () => {
    expect(paceOf(false, 500)).toBe('wrong')
    expect(paceOf(true, SLOW_MS)).toBe('slow')
    expect(paceOf(true, SLOW_MS - 1)).toBe('ok')
    expect(paceOf(true, FAST_MS)).toBe('fast')
    expect(paceOf(true, FAST_MS + 1)).toBe('ok')
  })

  it('spends a heart only on a miss, and simplifies a miss or a slow hit', () => {
    expect(losesHeart('wrong')).toBe(true)
    expect(losesHeart('slow')).toBe(false)
    expect(needsSimpler('wrong')).toBe(true)
    expect(needsSimpler('slow')).toBe(true)
    expect(needsSimpler('fast')).toBe(false)
    expect(offerSkip('fast')).toBe(true)
    expect(offerSkip('ok')).toBe(false)
  })

  it('schedules misses and slow answers, and leaves a fast first try alone', () => {
    expect(shouldSchedule('wrong', false)).toBe(true)
    expect(shouldSchedule('slow', false)).toBe(true)
    expect(shouldSchedule('fast', false)).toBe(false)
    expect(shouldSchedule('ok', false)).toBe(false)
    expect(shouldSchedule('fast', true)).toBe(true)
  })

  it('puts a miss on tomorrow and keeps a fast answer unscheduled', () => {
    const missed = gradeConcept(undefined, {
      levelId: '001',
      cardId: 'c1',
      pace: 'wrong',
      today: '2026-11-18',
    })
    expect(missed.due).toBe('2026-11-19')
    expect(missed.lapses).toBe(1)
    expect(missed.correct).toBe(0)

    const fast = gradeConcept(undefined, {
      levelId: '001',
      cardId: 'c1',
      pace: 'fast',
      today: '2026-11-18',
    })
    expect(fast.interval).toBe(0)
    expect(fast.fast).toBe(1)
    expect(fast.correct).toBe(1)
  })
})
