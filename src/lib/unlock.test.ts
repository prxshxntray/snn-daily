import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, heatmapWeeks, isISODate } from './dates.ts'
import {
  isLessonUnlocked,
  lessonOpenDate,
  resolveCurriculumDay,
  unlockedThroughDay,
} from './unlock.ts'

const start = '2026-11-18'

describe('day unlock', () => {
  it('opens day 1 on the start date and one new lesson each morning after', () => {
    expect(unlockedThroughDay(start, start, 34)).toBe(1)
    expect(unlockedThroughDay(start, '2026-11-19', 34)).toBe(2)
    expect(unlockedThroughDay(start, '2026-11-23', 34)).toBe(6)
    expect(lessonOpenDate(start, 1)).toBe(start)
    expect(lessonOpenDate(start, 6)).toBe('2026-11-23')
  })

  it('keeps every lesson locked before the start date', () => {
    expect(unlockedThroughDay(start, '2026-11-17', 34)).toBe(0)
    expect(daysBetween(start, '2026-11-17')).toBe(-1)
    expect(
      isLessonUnlocked({
        day: 1,
        lessonId: '001',
        startDate: start,
        today: '2026-11-17',
        readAheadAll: false,
        readAheadIds: [],
      }),
    ).toBe(false)
  })

  it('does not open tomorrow unless the reader opts in', () => {
    const locked = {
      day: 2,
      lessonId: '002',
      startDate: start,
      today: start,
      readAheadAll: false,
      readAheadIds: [] as string[],
    }
    expect(isLessonUnlocked(locked)).toBe(false)
    expect(isLessonUnlocked({ ...locked, readAheadIds: ['002'] })).toBe(true)
    expect(isLessonUnlocked({ ...locked, readAheadAll: true })).toBe(true)
  })

  it('stops the calendar at the last lesson', () => {
    expect(unlockedThroughDay(start, '2027-02-01', 34)).toBe(34)
  })

  it('resolves the widget day the same way the course does', () => {
    expect(resolveCurriculumDay(start, 34, '2026-11-17')).toEqual({
      status: 'before-start',
      day: 1,
      daysUntil: 1,
    })
    expect(resolveCurriculumDay(start, 34, start)).toEqual({ status: 'lesson', day: 1 })
    expect(resolveCurriculumDay(start, 34, '2026-12-21')).toEqual({ status: 'lesson', day: 34 })
    expect(resolveCurriculumDay(start, 34, '2026-12-22')).toEqual({ status: 'finished', reviewDay: 1 })
    expect(resolveCurriculumDay(start, 34, '2026-12-23')).toEqual({ status: 'finished', reviewDay: 2 })
    expect(resolveCurriculumDay(start, 3, '2026-11-23')).toEqual({ status: 'finished', reviewDay: 3 })
  })
})

describe('calendar arithmetic', () => {
  it('crosses month and leap-day boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
    expect(isISODate('2026-02-31')).toBe(false)
    expect(isISODate('2026-11-18')).toBe(true)
  })

  it('builds a Monday-first heatmap ending this week', () => {
    const columns = heatmapWeeks('2026-11-18', 16)
    expect(columns).toHaveLength(16)
    expect(columns[0]).toHaveLength(7)
    expect(columns[15]?.[2]).toBe('2026-11-18')
    expect(columns[15]?.[0]).toBe('2026-11-16')
  })
})
