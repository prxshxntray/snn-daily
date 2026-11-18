import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const courseDir = join(root, 'content/courses')
const courses = readdirSync(courseDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => JSON.parse(readFileSync(join(courseDir, entry.name, 'course.json'), 'utf8')))
const course = courses.find((item) => item.widget) ?? courses[0]
const levelDir = join(courseDir, course.id, 'levels')
const levels = readdirSync(levelDir)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(join(levelDir, name), 'utf8')))
  .sort((a, b) => a.order - b.order)

const configPath = join(root, 'content/config.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))

const payload = {
  version: 1,
  app: 'first-spike',
  course: course.id,
  startDate: config.startDate,
  lessonCount: levels.length,
  lessons: levels.map((level) => ({
    day: level.order,
    id: level.id,
    topic: course.units.find((unit) => unit.id === level.unit)?.title ?? level.unit,
    title: level.title,
    summary: level.summary,
    question: level.recall.question,
    answer: level.recall.answer,
  })),
}

mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public/today.json'), `${JSON.stringify(payload, null, 2)}\n`)
