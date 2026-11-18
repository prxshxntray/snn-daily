import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { resolveCurriculumDay } from './unlock.ts'

type Feed = {
  startDate: string
  lessons: { id: string; question: string }[]
}

type Resolved = {
  status: string
  day: number
  daysUntil?: number
  reviewDay?: number
  lesson: { id: string } | null
}

function widgetResolve(feed: Feed, today: string, override: string | null = null): Resolved {
  const source = readFileSync('widget/snn-widget.js', 'utf8')
  const sandbox: { __firstSpikeResolve?: (feed: Feed, today: string, override: string | null) => Resolved } = {}
  runInNewContext(source, sandbox, { filename: 'widget/snn-widget.js' })
  const resolve = sandbox.__firstSpikeResolve
  if (!resolve) throw new Error('Widget did not expose resolveToday')
  return resolve(feed, today, override)
}

describe('Scriptable day resolver', () => {
  const feed: Feed = {
    startDate: '2026-11-18',
    lessons: [
      { id: '001', question: 'a' },
      { id: '002', question: 'b' },
      { id: '003', question: 'c' },
    ],
  }

  it('picks the same lesson the course unlocks', () => {
    for (const today of ['2026-11-17', '2026-11-18', '2026-11-19', '2026-11-21', '2026-11-22']) {
      const course = resolveCurriculumDay(feed.startDate, feed.lessons.length, today)
      const widget = widgetResolve(feed, today)
      expect(widget.status).toBe(course.status)
      if (course.status === 'before-start') {
        expect(widget.daysUntil).toBe(course.daysUntil)
        expect(widget.lesson?.id).toBe('001')
      } else if (course.status === 'lesson') {
        expect(widget.day).toBe(course.day)
        expect(widget.lesson?.id).toBe(feed.lessons[course.day - 1]?.id)
      } else {
        expect(widget.reviewDay).toBe(course.reviewDay)
        expect(widget.lesson?.id).toBe(feed.lessons[course.reviewDay - 1]?.id)
      }
    }
  })

  it('lets the script override the shipped start date', () => {
    const widget = widgetResolve(feed, '2026-11-18', '2026-11-19')
    expect(widget.status).toBe('before-start')
    expect(widget.daysUntil).toBe(1)
  })
})
