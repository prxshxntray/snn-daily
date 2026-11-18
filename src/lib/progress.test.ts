import { describe, expect, it } from 'vitest'
import { applyGrade, clearLevel, computeStreak, emptyState, goalProgress, resetProgress } from './progress.ts'

describe('session progress', () => {
  it('records a miss for tomorrow and a fast hit as practice without a card due', () => {
    const missed = applyGrade(emptyState(), {
      concept: 'lif-bucket',
      levelId: '001',
      cardId: 'c5',
      pace: 'wrong',
      today: '2026-11-18',
    })
    expect(missed.concepts['lif-bucket']?.due).toBe('2026-11-19')
    expect(missed.activity['2026-11-18']?.attempted).toBe(1)

    const fast = applyGrade(emptyState(), {
      concept: 'lif-bucket',
      levelId: '001',
      cardId: 'c5',
      pace: 'fast',
      today: '2026-11-18',
    })
    expect(fast.concepts['lif-bucket']?.interval).toBe(0)
    expect(fast.concepts['lif-bucket']?.fast).toBe(1)
  })

  it('grants the daily goal once when a level is cleared, and not again', () => {
    const once = clearLevel(emptyState(), {
      levelId: '001',
      today: '2026-11-18',
      correct: 2,
      total: 2,
    })
    expect(once.xp).toBe(15)
    expect(goalProgress(once, '2026-11-18')).toBe(0.75)
    const twice = clearLevel(once, { levelId: '001', today: '2026-11-18', correct: 2, total: 2 })
    expect(twice.xp).toBe(15)
  })

  it('keeps a streak through yesterday', () => {
    const state = emptyState()
    state.activity = {
      '2026-11-16': { xp: 20, attempted: 1, correct: 1 },
      '2026-11-17': { xp: 20, attempted: 2, correct: 2 },
    }
    expect(computeStreak(state.activity, '2026-11-18')).toBe(2)
    expect(computeStreak(state.activity, '2026-11-19')).toBe(0)
  })

  it('resets play without moving the course or the mute switch', () => {
    const state = emptyState()
    state.courseId = 'snn'
    state.muted = true
    state.xp = 40
    const cleared = resetProgress(state)
    expect(cleared.xp).toBe(0)
    expect(cleared.muted).toBe(true)
    expect(cleared.courseId).toBe('snn')
  })
})
