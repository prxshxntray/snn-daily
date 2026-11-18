import { describe, expect, it } from 'vitest'
import {
  entersReview,
  isDue,
  newCard,
  qualityFor,
  reviewCard,
} from './scheduler.ts'

describe('SM-2 reviewCard', () => {
  it('schedules the first successful recall for the next day', () => {
    const card = reviewCard(newCard('2026-11-18'), 5, '2026-11-18')
    expect(card.repetitions).toBe(1)
    expect(card.interval).toBe(1)
    expect(card.due).toBe('2026-11-19')
    expect(card.ease).toBeCloseTo(2.6, 5)
    expect(card.lapses).toBe(0)
    expect(isDue(card, '2026-11-18')).toBe(false)
    expect(isDue(card, '2026-11-19')).toBe(true)
  })

  it('uses the 1-day then 6-day then ease-scaled intervals', () => {
    let card = reviewCard(newCard('2026-11-18'), 5, '2026-11-18')
    card = reviewCard(card, 5, card.due)
    expect(card.repetitions).toBe(2)
    expect(card.interval).toBe(6)
    expect(card.ease).toBeCloseTo(2.7, 5)
    expect(card.due).toBe('2026-11-25')

    card = reviewCard(card, 5, card.due)
    expect(card.repetitions).toBe(3)
    expect(card.ease).toBeCloseTo(2.8, 5)
    expect(card.interval).toBe(Math.round(6 * 2.8))
    expect(card.due).toBe('2026-12-12')
  })

  it('does not change ease on a solid (quality 4) recall', () => {
    const card = reviewCard(newCard('2026-11-18'), 4, '2026-11-18')
    expect(card.ease).toBeCloseTo(2.5, 5)
    expect(card.interval).toBe(1)
  })

  it('resets a lapse to tomorrow and lowers ease', () => {
    let card = reviewCard(newCard('2026-11-18'), 5, '2026-11-18')
    card = reviewCard(card, 5, card.due)
    expect(card.interval).toBe(6)
    card = reviewCard(card, 1, card.due)
    expect(card.repetitions).toBe(0)
    expect(card.interval).toBe(1)
    expect(card.lapses).toBe(1)
    expect(card.ease).toBeLessThan(2.7)
    expect(card.due).toBe('2026-11-26')
  })

  it('never lets ease fall below 1.3', () => {
    let card = newCard('2026-11-18')
    for (let i = 0; i < 12; i += 1) {
      card = reviewCard(card, 0, card.due)
    }
    expect(card.ease).toBe(1.3)
    expect(card.interval).toBe(1)
  })

  it('clamps out-of-range grades', () => {
    const high = reviewCard(newCard('2026-11-18'), 9, '2026-11-18')
    const capped = reviewCard(newCard('2026-11-18'), 5, '2026-11-18')
    expect(high).toEqual(capped)
  })

  it('puts a miss or a shaky hit into review, and leaves a solid first try alone', () => {
    expect(qualityFor(false, 'solid')).toBe(1)
    expect(qualityFor(true, 'low')).toBe(3)
    expect(qualityFor(true, 'solid')).toBe(4)
    expect(qualityFor(true, 'easy')).toBe(5)
    expect(entersReview(false, 'easy', false)).toBe(true)
    expect(entersReview(true, 'low', false)).toBe(true)
    expect(entersReview(true, 'solid', false)).toBe(false)
    expect(entersReview(true, 'easy', false)).toBe(false)
    expect(entersReview(true, 'easy', true)).toBe(true)
  })
})
