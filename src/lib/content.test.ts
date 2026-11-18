import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isConceptDue } from './mastery.ts'
import { computeStreak } from './progress.ts'
import { validateCourse, validateLevel } from './schema.ts'
import { seededProgress } from './seed.ts'
import type { Course, Level } from './types.ts'

function loadLevels(): { file: string; level: Level }[] {
  const files = readdirSync('content/courses/snn/levels').filter((name) => name.endsWith('.json')).sort()
  return files.map((file) => ({
    file,
    level: JSON.parse(readFileSync(`content/courses/snn/levels/${file}`, 'utf8')) as Level,
  }))
}

describe('course files', () => {
  const loaded = loadLevels()
  const levels = loaded.map((entry) => entry.level)
  const course = JSON.parse(readFileSync('content/courses/snn/course.json', 'utf8')) as Course
  const blob = JSON.stringify(levels).toLowerCase()

  it('is a pure spiking-network course of small levels with a term on every one', () => {
    expect(validateCourse(course)).toEqual([])
    expect(loaded.length).toBeGreaterThanOrEqual(34)
    expect(loaded.flatMap(({ file, level }) => validateLevel(level, file))).toEqual([])
    expect(levels.map((level) => level.order)).toEqual(levels.map((_, index) => index + 1))
    expect(blob).not.toContain('false alarm')
    expect(blob).not.toContain('lead time')
    expect(blob).not.toContain('wattr')
    expect(blob).not.toContain('sentinel')
    expect(blob).not.toContain('data centre')
    expect(blob).not.toContain('data center')
  })

  it('opens with leak, rest, rate, delta, SynOps, break-even, the window, no slope, then surrogates', () => {
    expect(levels.slice(0, 9).map((level) => level.slug)).toEqual([
      'leaky-bucket',
      'resting-level',
      'spike-rate',
      'delta',
      'weights-synops',
      'energy-break-even',
      'time-window',
      'no-slope',
      'surrogate',
    ])
    expect(levels[0]?.cards.some((card) => card.kind === 'toy')).toBe(true)
    expect(levels[3]?.cards.some((card) => card.kind === 'steps')).toBe(true)
    expect(levels[3]?.terms.some((term) => /sigma-delta/i.test(term.term))).toBe(true)
    expect(levels[4]?.terms.some((term) => term.term === 'SynOp')).toBe(true)
    expect(levels.slice(9, 16).map((level) => level.slug)).toEqual([
      'two-layers',
      'refractory',
      'rate-coding',
      'temporal-coding',
      'stdp-basics',
      'stdp-window',
      'reward-stdp',
    ])
    expect(levels[10]?.terms.map((term) => term.term)).toEqual([
      'refractory period',
      'maximum firing rate',
      'saturation',
    ])
    expect(levels.some((level) => /false-alarm|lead-time/.test(level.slug))).toBe(false)
  })
})

describe('November 17 save', () => {
  it('restores 220 XP, fifteen clears, a delta review, and reward-modulated STDP in progress', () => {
    expect(seededProgress.xp).toBe(220)
    for (let n = 1; n <= 15; n += 1) {
      const id = String(n).padStart(3, '0')
      expect(seededProgress.levelClears[id]?.on).toBe('2026-11-17')
    }
    expect(seededProgress.levelClears['016']).toBeUndefined()
    expect(seededProgress.resume).toEqual({ levelId: '016', cardIndex: 2 })
    expect(computeStreak(seededProgress.activity, '2026-11-18')).toBe(1)
    const delta = seededProgress.concepts.delta
    expect(delta?.levelId).toBe('004')
    expect(delta?.cardId).toBe('c4')
    expect(isConceptDue(delta!, '2026-11-18')).toBe(true)
  })
})
