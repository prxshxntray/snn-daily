import { describe, expect, it } from 'vitest'
import { blocksFor, orderedLevels } from './course.ts'
import type { Course, Level } from './types.ts'

const course: Course = {
  schemaVersion: 2,
  id: 'robots',
  title: 'Robot learning',
  tagline: 'A later course.',
  dailyGoalXp: 20,
  widget: false,
  units: [
    { id: 'arms', title: 'Arms', blurb: 'Reach.' },
    { id: 'maps', title: 'Maps', blurb: 'Where.' },
  ],
}

function level(order: number, unit: string): Level {
  return {
    schemaVersion: 2,
    id: String(order).padStart(3, '0'),
    slug: `r-${order}`,
    course: 'robots',
    unit,
    order,
    title: `Step ${order}`,
    concept: `c-${order}`,
    summary: 'A step.',
    terms: [{ plain: 'arm', term: 'reach', definition: 'How far it goes.' }],
    cards: [
      { id: 'a', kind: 'say', text: 'One idea.' },
      { id: 'b', kind: 'say', text: 'Another.' },
      { id: 'c', kind: 'ask', question: { kind: 'boolean', prompt: 'Yes?', answer: true, why: 'Yes.', simpler: 'It is yes.' } },
    ],
    recall: { question: 'Q', answer: 'A' },
    deeper: null,
    bonus: null,
  }
}

describe('course blocks', () => {
  it('lays any subject out as units on one path', () => {
    const levels = [level(2, 'maps'), level(1, 'arms'), level(3, 'maps')]
    const blocks = blocksFor(course, levels)
    expect(blocks.map((block) => block.title)).toEqual(['Arms', 'Maps'])
    expect(blocks[0]?.levels.map((item) => item.order)).toEqual([1])
    expect(blocks[1]?.levels.map((item) => item.order)).toEqual([2, 3])
    expect(orderedLevels(course, levels).map((item) => item.order)).toEqual([1, 2, 3])
  })
})
