import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isLevelOpen } from '@/lib/access.ts'
import { blocksFor, orderedLevels, type UnitBlock } from '@/lib/course.ts'
import { courseById, courses, levels as allLevels } from '@/lib/content.ts'
import { todayISO } from '@/lib/dates.ts'
import { isConceptDue, type Pace } from '@/lib/mastery.ts'
import {
  applyGrade,
  clearLevel,
  computeStreak,
  grantXp,
  markReadAhead,
  resetProgress,
  setResume,
  startDateOf,
  todayXp,
  type StudyState,
} from '@/lib/progress.ts'
import { progressFromCode } from '@/lib/seed.ts'
import { exportBackup, loadState, parseBackup, saveState } from '@/lib/storage.ts'
import type { Course, Level, Question } from '@/lib/types.ts'

export type DueReview = {
  concept: string
  level: Level
  cardId: string
  prompt: string
  question: Question
}

type Api = {
  state: StudyState
  courses: Course[]
  course: Course
  levels: Level[]
  blocks: UnitBlock[]
  today: string
  startDate: string
  due: DueReview[]
  streak: number
  goal: number
  earnedToday: number
  current: Level | null
  isOpen: (level: Level) => boolean
  grade: (input: { concept: string; levelId: string; cardId: string; pace: Pace }) => void
  finishLevel: (levelId: string, correct: number, total: number, xp: number) => void
  remember: (levelId: string, cardIndex: number) => void
  addXp: (amount: number) => void
  setMuted: (muted: boolean) => void
  setCourse: (courseId: string) => void
  setStartDate: (iso: string | null) => void
  readAhead: (levelId: string) => void
  importText: (raw: string) => { ok: true } | { ok: false; error: string }
  exportJson: () => string
  resetStudy: () => void
  dismissHint: () => void
}

const StudyContext = createContext<Api | null>(null)

function questionOn(level: Level, cardId: string, levels: Level[]): Question | null {
  if (cardId.startsWith('term:')) {
    const name = cardId.slice('term:'.length)
    const terms = levels.flatMap((item) => item.terms)
    const term = terms.find((item) => item.term === name)
    if (!term) return null
    const distractors = terms.filter((item) => item.term !== name).slice(0, 2)
    return {
      kind: 'choice',
      prompt: `The proper name for “${term.plain}” is…`,
      choices: [term.term, ...distractors.map((item) => item.term)],
      answer: 0,
      why: term.definition,
      simpler: `${term.plain} is called ${term.term}. ${term.definition}`,
    }
  }
  const card = level.cards.find((item) => item.id === cardId)
  if (card?.kind === 'ask') return card.question
  return null
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(() => loadState())
  const today = todayISO()

  useEffect(() => {
    saveState(state)
  }, [state])

  const course = courseById(state.courseId) ?? courses[0]!
  const levels = orderedLevels(course, allLevels)
  const blocks = blocksFor(course, allLevels)
  const startDate = startDateOf(state)

  const api = useMemo<Api>(() => {
    const frontier = levels.reduce(
      (max, level) => (state.levelClears[level.id] ? Math.max(max, level.order) : max),
      0,
    )
    const open = (level: Level) =>
      isLevelOpen({
        order: level.order,
        id: level.id,
        startDate,
        today,
        count: levels.length,
        readAheadAll: state.readAheadAll,
        readAheadIds: state.readAheadIds,
        cleared: Boolean(state.levelClears[level.id]),
        resumeId: state.resume?.levelId ?? null,
        frontier,
      })
    const due: DueReview[] = []
    for (const [concept, memory] of Object.entries(state.concepts)) {
      if (!isConceptDue(memory, today)) continue
      const level = levels.find((item) => item.id === memory.levelId)
      if (!level) continue
      const question = questionOn(level, memory.cardId, levels)
      if (!question) continue
      due.push({ concept, level, cardId: memory.cardId, prompt: question.prompt, question })
    }
    const current =
      (state.resume && levels.find((level) => level.id === state.resume?.levelId && open(level))) ||
      levels.find((level) => open(level) && !state.levelClears[level.id]) ||
      null
    return {
      state,
      courses,
      course,
      levels,
      blocks,
      today,
      startDate,
      due,
      streak: computeStreak(state.activity, today),
      goal: course.dailyGoalXp,
      earnedToday: todayXp(state, today),
      current,
      isOpen: open,
      grade: (input) => {
        setState((currentState) => applyGrade(currentState, { ...input, today: todayISO() }))
      },
      finishLevel: (levelId, correct, total, xp) => {
        setState((currentState) => {
          const cleared = clearLevel(currentState, { levelId, today: todayISO(), correct, total, xp })
          return setResume(cleared, cleared.resume?.levelId === levelId ? null : cleared.resume)
        })
      },
      remember: (levelId, cardIndex) => {
        setState((currentState) => setResume(currentState, { levelId, cardIndex }))
      },
      addXp: (amount) => {
        setState((currentState) => grantXp(currentState, todayISO(), amount))
      },
      setMuted: (muted) => setState((currentState) => ({ ...currentState, muted })),
      setCourse: (courseId) => setState((currentState) => ({ ...currentState, courseId })),
      setStartDate: (iso) => setState((currentState) => ({ ...currentState, startDateOverride: iso })),
      readAhead: (levelId) => setState((currentState) => markReadAhead(currentState, levelId)),
      importText: (raw) => {
        const coded = progressFromCode(raw)
        if (coded) {
          setState(coded)
          return { ok: true }
        }
        const parsed = parseBackup(raw)
        if (!parsed.ok) return parsed
        setState(parsed.state)
        return { ok: true }
      },
      exportJson: () => exportBackup(state),
      resetStudy: () => setState((currentState) => resetProgress(currentState)),
      dismissHint: () => setState((currentState) => ({ ...currentState, installHintDismissed: true })),
    }
  }, [state, course, levels, blocks, today, startDate])

  return <StudyContext.Provider value={api}>{children}</StudyContext.Provider>
}

export function useStudy(): Api {
  const value = useContext(StudyContext)
  if (!value) throw new Error('useStudy must be used inside StudyProvider')
  return value
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}
