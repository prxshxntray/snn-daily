import type { Card, Course, Level, Question } from './types.ts'

const HTTP = /^https:\/\/.+/

export function validateCourse(course: Course): string[] {
  const errors: string[] = []
  if (course.schemaVersion !== 2) errors.push(`${course.id}: schemaVersion must be 2`)
  if (!course.id?.trim() || !course.title?.trim()) errors.push('course needs id and title')
  if (!course.tagline?.trim()) errors.push(`${course.id}: tagline is required`)
  if (!Number.isFinite(course.dailyGoalXp) || course.dailyGoalXp < 1) {
    errors.push(`${course.id}: dailyGoalXp must be positive`)
  }
  if (!Array.isArray(course.units) || course.units.length < 1) {
    errors.push(`${course.id}: needs units`)
  } else if (course.units.some((unit) => !unit.id?.trim() || !unit.title?.trim() || !unit.blurb?.trim())) {
    errors.push(`${course.id}: every unit needs id, title, and blurb`)
  }
  return errors
}

export function validateLevel(level: Level, filename?: string): string[] {
  const errors: string[] = []
  const where = filename ?? level.id
  if (level.schemaVersion !== 2) errors.push(`${where}: schemaVersion must be 2`)
  if (!/^\d{3}$/.test(level.id)) errors.push(`${where}: id must be three digits`)
  if (filename && filename !== `${level.id}-${level.slug}.json`) {
    errors.push(`${where}: filename must be ${level.id}-${level.slug}.json`)
  }
  if (!level.course?.trim() || !level.unit?.trim() || !level.concept?.trim()) {
    errors.push(`${where}: course, unit, and concept are required`)
  }
  if (!Number.isInteger(level.order) || level.order < 1) errors.push(`${where}: order must be a positive integer`)
  if (Number(level.id) !== level.order) errors.push(`${where}: id and order must match`)
  if (!level.title?.trim() || !level.summary?.trim()) errors.push(`${where}: title and summary are required`)
  if (!Array.isArray(level.terms) || level.terms.length < 1) {
    errors.push(`${where}: needs at least one new term`)
  } else if (level.terms.some((term) => !term.plain?.trim() || !term.term?.trim() || !term.definition?.trim())) {
    errors.push(`${where}: each term needs a plain name, the proper term, and a definition`)
  }
  if (!level.recall?.question?.trim() || !level.recall?.answer?.trim()) {
    errors.push(`${where}: recall question and answer are required`)
  }
  if (!Array.isArray(level.cards) || level.cards.length < 3 || level.cards.length > 6) {
    errors.push(`${where}: a level is 3 to 6 cards`)
  } else {
    const ids = new Set<string>()
    let asks = 0
    for (const card of level.cards) {
      if (!card.id?.trim()) errors.push(`${where}: a card is missing an id`)
      if (ids.has(card.id)) errors.push(`${where}: duplicate card id ${card.id}`)
      ids.add(card.id)
      errors.push(...validateCard(where, card))
      if (card.kind === 'ask') asks += 1
    }
    if (asks < 1) errors.push(`${where}: needs at least one question card`)
  }
  if (level.bonus) errors.push(...validateQuestion(where, 'bonus', level.bonus))
  if (level.deeper) {
    const paper = level.deeper.paper
    if (!level.deeper.note?.trim()) errors.push(`${where}: deeper note is empty`)
    if (!paper?.title?.trim() || !paper.venue?.trim() || !paper.section?.trim()) {
      errors.push(`${where}: deeper paper needs title, venue, and section`)
    }
    if (!Array.isArray(paper?.authors) || paper.authors.length < 1) {
      errors.push(`${where}: deeper paper needs authors`)
    }
    if (!Number.isInteger(paper?.year) || paper.year < 1900 || paper.year > 2026) {
      errors.push(`${where}: deeper paper year looks wrong`)
    }
    if (paper?.link !== undefined && !HTTP.test(paper.link)) {
      errors.push(`${where}: paper link must be https or omitted`)
    }
  }
  return errors
}

function validateCard(where: string, card: Card): string[] {
  const errors: string[] = []
  const blob = JSON.stringify(card)
  if (/\\frac|\\tau|dV\/dt|\\sum/.test(blob)) {
    errors.push(`${where}: a card shows too much formula at once`)
  }
  if (card.kind === 'say' && !card.text?.trim()) errors.push(`${where}: empty say card`)
  if (card.kind === 'numbers') {
    if (!card.lead?.trim() || !Array.isArray(card.lines) || card.lines.length < 2) {
      errors.push(`${where}: numbers card needs a lead and at least two lines`)
    }
  }
  if (card.kind === 'piece') {
    if (!card.plain?.trim() || !card.numbers?.trim() || !card.name?.trim() || !card.bit?.trim()) {
      errors.push(`${where}: piece card needs plain words, numbers, a name, and one bit`)
    }
  }
  if (card.kind === 'toy' && !card.toy?.trim()) errors.push(`${where}: toy card needs a toy id`)
  if (card.kind === 'steps' && (!card.title?.trim() || !Array.isArray(card.frames) || card.frames.length < 2)) {
    errors.push(`${where}: steps card needs a title and at least two frames`)
  }
  if (card.kind === 'ask') errors.push(...validateQuestion(where, card.id, card.question))
  return errors
}

function validateQuestion(where: string, id: string, question: Question): string[] {
  const errors: string[] = []
  if (!question.prompt?.trim() || !question.why?.trim() || !question.simpler?.trim()) {
    errors.push(`${where}: ${id} needs a prompt, a one-line why, and a simpler line`)
  }
  if (question.kind === 'choice') {
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      errors.push(`${where}: ${id} needs choices`)
    } else if (question.answer < 0 || question.answer >= question.choices.length) {
      errors.push(`${where}: ${id} answer is out of range`)
    }
  } else if (question.kind === 'number') {
    if (!question.choices?.includes(question.answer)) {
      errors.push(`${where}: ${id} answer is not one of the numbers`)
    }
  } else if (question.kind === 'boolean') {
    if (typeof question.answer !== 'boolean') errors.push(`${where}: ${id} answer must be true or false`)
  } else if (question.kind === 'slider') {
    if (!(question.min < question.max) || question.step <= 0) {
      errors.push(`${where}: ${id} slider range is wrong`)
    }
    if (question.answer < question.min || question.answer > question.max) {
      errors.push(`${where}: ${id} slider answer is outside the range`)
    }
  } else {
    errors.push(`${where}: ${id} has an unknown question kind`)
  }
  return errors
}
