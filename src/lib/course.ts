import type { Course, Level } from './types.ts'

export type UnitBlock = {
  id: string
  title: string
  blurb: string
  levels: Level[]
}

/** Group a course's levels under its units, in file order. Subject-agnostic. */
export function blocksFor(course: Course, levels: readonly Level[]): UnitBlock[] {
  const mine = levels
    .filter((level) => level.course === course.id)
    .slice()
    .sort((a, b) => a.order - b.order)
  return course.units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    blurb: unit.blurb,
    levels: mine.filter((level) => level.unit === unit.id),
  }))
}

export function orderedLevels(course: Course, levels: readonly Level[]): Level[] {
  return blocksFor(course, levels).flatMap((block) => block.levels)
}
