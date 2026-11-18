export type ChoiceQuestion = {
  kind: 'choice'
  prompt: string
  choices: string[]
  answer: number
  why: string
  simpler: string
}

export type NumberQuestion = {
  kind: 'number'
  prompt: string
  choices: number[]
  answer: number
  why: string
  simpler: string
}

export type BooleanQuestion = {
  kind: 'boolean'
  prompt: string
  answer: boolean
  why: string
  simpler: string
}

export type SliderQuestion = {
  kind: 'slider'
  prompt: string
  min: number
  max: number
  step: number
  answer: number
  why: string
  simpler: string
}

export type Question = ChoiceQuestion | NumberQuestion | BooleanQuestion | SliderQuestion

export type SayCard = { id: string; kind: 'say'; text: string }
export type NumbersCard = { id: string; kind: 'numbers'; lead: string; lines: string[] }
export type PieceCard = {
  id: string
  kind: 'piece'
  plain: string
  numbers: string
  name: string
  bit: string
}
export type ToyCard = { id: string; kind: 'toy'; toy: string }
export type AskCard = { id: string; kind: 'ask'; question: Question }
export type StepsCard = {
  id: string
  kind: 'steps'
  title: string
  frames: { caption: string; sent: number; reading: number; previous: number; send: boolean }[]
}

export type Card = SayCard | NumbersCard | PieceCard | ToyCard | AskCard | StepsCard

export type Term = {
  plain: string
  term: string
  definition: string
}

export type Paper = {
  title: string
  authors: string[]
  year: number
  venue: string
  section: string
  link?: string
}

export type Deeper = {
  note: string
  paper: Paper
}

export type Level = {
  schemaVersion: 2
  id: string
  slug: string
  course: string
  unit: string
  order: number
  title: string
  concept: string
  summary: string
  terms: Term[]
  cards: Card[]
  recall: { question: string; answer: string }
  deeper: Deeper | null
  bonus: Question | null
}

export type Unit = {
  id: string
  title: string
  blurb: string
}

export type Course = {
  schemaVersion: 2
  id: string
  title: string
  tagline: string
  dailyGoalXp: number
  widget: boolean
  units: Unit[]
}
