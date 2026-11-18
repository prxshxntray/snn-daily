import { validateCourse, validateLevel } from './schema.ts'
import type { Course, Level } from './types.ts'

const courseFiles = import.meta.glob('../../content/courses/*/course.json', {
  eager: true,
  import: 'default',
}) as Record<string, Course>

const levelFiles = import.meta.glob('../../content/courses/*/levels/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Level>

function fileName(path: string): string {
  const parts = path.split('/')
  return parts[parts.length - 1] ?? path
}

export function loadContent(): { courses: Course[]; levels: Level[] } {
  const courses = Object.values(courseFiles)
  if (courses.length === 0) throw new Error('No courses in content/courses.')
  for (const course of courses) {
    const errors = validateCourse(course)
    if (errors.length > 0) throw new Error(errors.join('\n'))
  }
  const levels = Object.entries(levelFiles).map(([path, level]) => {
    const errors = validateLevel(level, fileName(path))
    if (errors.length > 0) throw new Error(errors.join('\n'))
    return level
  })
  courses.sort((a, b) => a.title.localeCompare(b.title))
  levels.sort((a, b) => a.course.localeCompare(b.course) || a.order - b.order)
  return { courses, levels }
}

export const { courses, levels } = loadContent()

export function courseById(id: string): Course | undefined {
  return courses.find((course) => course.id === id)
}

export function widgetCourse(): Course {
  return courses.find((course) => course.widget) ?? courses[0]!
}
