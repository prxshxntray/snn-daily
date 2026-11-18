import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { playAnswer } from '@/lib/sounds.ts'
import { paceOf } from '@/lib/mastery.ts'
import type { Level, Term } from '@/lib/types.ts'
import { useStudy } from '@/state/StudyContext.tsx'

type Entry = { level: Level; term: Term }

export function GlossaryScreen() {
  const study = useStudy()
  const entries: Entry[] = study.levels
    .filter((level) => study.state.levelClears[level.id])
    .flatMap((level) => level.terms.map((term) => ({ level, term })))
  const [open, setOpen] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Entry | null>(null)
  const [why, setWhy] = useState<string | null>(null)

  function choicesFor(entry: Entry): string[] {
    const others = entries
      .map((item) => item.term.term)
      .filter((term) => term !== entry.term.term)
      .slice(0, 2)
    return [entry.term.term, ...others]
  }

  return (
    <div className="screen-in px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-28">
      <p className="text-[11px] tracking-[0.16em] text-sage uppercase">Proper names</p>
      <h1 className="font-serif text-4xl leading-none">Glossary</h1>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        Words from levels you have finished. Tap a card. A miss is sent to Review.
      </p>
      {entries.length === 0 ? <p className="mt-6 text-lg">Finish a level to unlock its words.</p> : null}
      <ul className="mt-4 space-y-2">
        {entries.map((entry) => {
          const key = `${entry.level.id}:${entry.term.term}`
          const shown = open === key
          return (
            <li key={key}>
              <button
                type="button"
                className="w-full rounded-2xl border border-line bg-panel px-4 py-3 text-left"
                onClick={() => {
                  setOpen(shown ? null : key)
                  setQuiz(null)
                  setWhy(null)
                }}
              >
                <p className="text-sm text-mute">{entry.term.plain}</p>
                <p className="font-serif text-2xl leading-tight">{shown ? entry.term.term : 'Show the term'}</p>
                {shown ? <p className="mt-1 text-sm leading-snug">{entry.term.definition}</p> : null}
              </button>
              {shown ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setQuiz(entry)
                    setWhy(null)
                  }}
                >
                  Quiz this word
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
      {quiz ? (
        <div className="mt-5">
          <p className="font-serif text-2xl leading-snug">The proper name for “{quiz.term.plain}” is…</p>
          <div className="mt-3 grid gap-2">
            {choicesFor(quiz).map((choice, index) => (
              <Button
                key={choice}
                type="button"
                variant="secondary"
                className="h-auto whitespace-normal rounded-2xl py-3"
                onClick={() => {
                  const correct = index === 0
                  playAnswer(correct, study.state.muted)
                  if (!correct) {
                    study.grade({
                      concept: `term:${quiz.term.term}`,
                      levelId: quiz.level.id,
                      cardId: `term:${quiz.term.term}`,
                      pace: paceOf(false, 1000),
                    })
                  }
                  setWhy(correct ? quiz.term.definition : `Not yet. ${quiz.term.plain} is called ${quiz.term.term}.`)
                }}
              >
                {choice}
              </Button>
            ))}
          </div>
          {why ? <p className="mt-3 leading-snug">{why}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
