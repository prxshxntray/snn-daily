import { useState } from 'react'
import { DeltaWalk } from '@/components/DeltaWalk.tsx'
import { Mascot } from '@/components/Mascot.tsx'
import { Button } from '@/components/ui/button.tsx'
import { REVIEW_XP, paceOf } from '@/lib/mastery.ts'
import { playAnswer } from '@/lib/sounds.ts'
import type { Question } from '@/lib/types.ts'
import { useStudy, type DueReview } from '@/state/StudyContext.tsx'

export function ReviewScreen() {
  const study = useStudy()
  const [active, setActive] = useState<DueReview | null>(null)
  const [why, setWhy] = useState<string | null>(null)

  function answer(review: DueReview, question: Question, correct: boolean) {
    const pace = paceOf(correct, 5000)
    playAnswer(correct, study.state.muted)
    study.grade({ concept: review.concept, levelId: review.level.id, cardId: review.cardId, pace })
    if (correct) study.addXp(REVIEW_XP)
    setWhy(question.why)
  }

  return (
    <div className="screen-in px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-28">
      <div className="flex items-center gap-3">
        <Mascot mood={why ? 'happy' : 'idle'} className="h-14 w-16" />
        <div>
          <p className="text-[11px] tracking-[0.16em] text-sage uppercase">Comebacks</p>
          <h1 className="font-serif text-4xl leading-none">Review</h1>
        </div>
      </div>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        {study.due.length > 0
          ? 'One idea from earlier is due. A miss comes back. A clean tap waits longer.'
          : 'Nothing is due. Misses land here on a later morning.'}
      </p>
      <ul className="mt-5 space-y-3">
        {study.due.map((review) => (
          <li key={review.concept}>
            <button
              type="button"
              className="w-full rounded-2xl border border-line bg-panel px-4 py-3 text-left"
              onClick={() => {
                setActive(review)
                setWhy(null)
              }}
            >
              <p className="text-xs text-mute">Level {review.level.order} · {review.level.title}</p>
              <p className="mt-1 leading-snug">{review.prompt}</p>
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <div className="mt-5">
          {active.concept === 'delta'
            ? active.level.cards
                .filter((card) => card.kind === 'steps')
                .map((card) =>
                  card.kind === 'steps' ? (
                    <div key={card.id} className="mb-4">
                      <DeltaWalk frames={card.frames} title={card.title} />
                    </div>
                  ) : null,
                )
            : null}
          <p className="font-serif text-2xl leading-snug">{active.prompt}</p>
          <div className="mt-4 grid gap-2">
            {active.question.kind === 'choice'
              ? active.question.choices.map((choice, index) => (
                  <Button key={choice} type="button" variant="secondary" className="h-auto whitespace-normal rounded-2xl py-3" onClick={() => answer(active, active.question, index === active.question.answer)}>
                    {choice}
                  </Button>
                ))
              : null}
            {active.question.kind === 'boolean' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" onClick={() => answer(active, active.question, active.question.kind === 'boolean' && active.question.answer)}>
                  Yes
                </Button>
                <Button type="button" variant="secondary" onClick={() => answer(active, active.question, active.question.kind === 'boolean' && !active.question.answer)}>
                  No
                </Button>
              </div>
            ) : null}
          </div>
          {why ? <p className="mt-4 text-lg leading-snug">{why}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
