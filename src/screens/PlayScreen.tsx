import { useState } from 'react'
import { BucketToy } from '@/components/BucketToy.tsx'
import { DeltaWalk } from '@/components/DeltaWalk.tsx'
import { Hearts, Mascot, type Mood } from '@/components/Mascot.tsx'
import { Button } from '@/components/ui/button.tsx'
import { BONUS_XP, LEVEL_XP, losesHeart, needsSimpler, offerSkip, paceOf, SHAKY_XP, type Pace } from '@/lib/mastery.ts'
import { go } from '@/lib/route.ts'
import { playAnswer, playClear } from '@/lib/sounds.ts'
import type { Card, Level, Question } from '@/lib/types.ts'
import { useStudy } from '@/state/StudyContext.tsx'

export function PlayScreen({ id }: { id: string }) {
  const study = useStudy()
  const level = study.levels.find((item) => item.id === id)
  if (!level || !study.isOpen(level)) {
    return (
      <div className="px-5 pt-16">
        <p>That level is not open yet.</p>
        <Button type="button" className="mt-4" variant="secondary" onClick={() => go('/learn')}>
          Back to the path
        </Button>
      </div>
    )
  }
  return <Deck key={level.id} level={level} />
}

function Deck({ level }: { level: Level }) {
  const study = useStudy()
  const startAt =
    study.state.resume?.levelId === level.id
      ? Math.min(study.state.resume.cardIndex, level.cards.length - 1)
      : 0
  const [index, setIndex] = useState(startAt)
  const [phase, setPhase] = useState<'play' | 'why' | 'simpler' | 'bonus' | 'done' | 'rest'>('play')
  const [hearts, setHearts] = useState(3)
  const [mood, setMood] = useState<Mood>('idle')
  const [correctCount, setCorrectCount] = useState(0)
  const [asked, setAsked] = useState(0)
  const [missed, setMissed] = useState(false)
  const [skip, setSkip] = useState(false)
  const [why, setWhy] = useState('')
  const [simpler, setSimpler] = useState('')
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [bonusRight, setBonusRight] = useState(false)
  const [lastPace, setLastPace] = useState<Pace>('ok')
  const [sawBonus, setSawBonus] = useState(false)

  const card = level.cards[index]
  const replay = Boolean(study.state.levelClears[level.id])

  function finish() {
    if (!replay) {
      const xp = missed ? SHAKY_XP : LEVEL_XP
      study.finishLevel(level.id, correctCount, asked, xp)
      if (bonusRight) study.addXp(BONUS_XP)
      playClear(study.state.muted)
    }
    setMood('cheer')
    setPhase('done')
  }

  function advance(skipNext: boolean) {
    const step = skipNext && level.cards[index + 1]?.kind === 'say' ? 2 : 1
    const next = index + step
    if (!replay) study.remember(level.id, Math.min(next, level.cards.length - 1))
    setSkip(false)
    setMood('idle')
    setStartedAt(Date.now())
    if (next >= level.cards.length) {
      if (!replay && level.bonus && !sawBonus && !missed && asked > 0 && correctCount === asked) {
        setSawBonus(true)
        setPhase('bonus')
        setStartedAt(Date.now())
        setMood('idle')
        return
      }
      finish()
      return
    }
    setPhase('play')
    setIndex(next)
  }

  function grade(question: Question, correct: boolean, cardId: string) {
    const pace = paceOf(correct, Date.now() - startedAt)
    setLastPace(pace)
    playAnswer(correct, study.state.muted)
    setMood(correct ? 'happy' : 'oops')
    setWhy(question.why)
    setSimpler(question.simpler)
    setAsked((value) => value + 1)
    if (correct) setCorrectCount((value) => value + 1)
    if (!correct) setMissed(true)
    const nextHearts = hearts - (losesHeart(pace) ? 1 : 0)
    if (losesHeart(pace)) setHearts(nextHearts)
    if (!replay) {
      study.grade({ concept: level.concept, levelId: level.id, cardId, pace })
    }
    setSkip(offerSkip(pace))
    setPhase(nextHearts <= 0 ? 'rest' : 'why')
  }

  if (phase === 'done') {
    return (
      <div className="screen-in flex min-h-dvh flex-col items-center overflow-y-auto px-6 pt-10 pb-8 text-center">
        <Mascot mood="cheer" className="h-24 w-28" />
        <p className="mt-4 text-[11px] tracking-[0.16em] text-sage uppercase">Level {level.order}</p>
        <h1 className="mt-2 font-serif text-5xl leading-none">That's the idea.</h1>
        <p className="mt-4 font-serif text-4xl text-sage">+{replay ? 0 : (missed ? SHAKY_XP : LEVEL_XP) + (bonusRight ? BONUS_XP : 0)}</p>
        <p className="text-sm text-mute">points</p>
        <section className="mt-6 w-full max-w-sm text-left">
          <h2 className="text-[11px] tracking-[0.16em] text-sage uppercase">New terms</h2>
          <ul className="mt-2 space-y-2">
            {level.terms.map((term) => (
              <li key={term.term} className="rounded-2xl border border-line bg-panel px-4 py-3">
                <p className="text-sm text-mute">{term.plain}</p>
                <p className="font-serif text-2xl leading-tight">{term.term}</p>
                <p className="mt-1 text-sm leading-snug">{term.definition}</p>
              </li>
            ))}
          </ul>
        </section>
        <Button type="button" className="mt-6 w-full max-w-sm" onClick={() => go('/learn')}>
          Back to the path
        </Button>
      </div>
    )
  }

  if (phase === 'rest') {
    return (
      <div className="screen-in flex min-h-dvh flex-col justify-center px-6">
        <Mascot mood="oops" />
        <h1 className="mt-4 font-serif text-4xl">Rest this one.</h1>
        <p className="mt-3 text-lg leading-relaxed text-mute">{why}</p>
        <p className="mt-3 leading-relaxed">{simpler}</p>
        <Button type="button" className="mt-8" onClick={() => go('/learn')}>
          Back to the path
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between">
        <button type="button" className="min-h-12 text-sm text-mute" onClick={() => go('/learn')}>
          Close
        </button>
        <Hearts left={hearts} />
        <p className="text-sm tabular-nums text-mute">
          {Math.min(index + 1, level.cards.length)}/{level.cards.length}
        </p>
      </div>
      <div className="mt-2 flex justify-center">
        <Mascot mood={mood} />
      </div>
      <div
        className="mt-2 flex flex-1 flex-col"
        onTouchStart={(event) => {
          const x = event.changedTouches[0]?.clientX ?? 0
          event.currentTarget.dataset.x = String(x)
        }}
        onTouchEnd={(event) => {
          if (phase !== 'play' || card?.kind === 'ask') return
          const start = Number(event.currentTarget.dataset.x ?? 0)
          const end = event.changedTouches[0]?.clientX ?? start
          if (start - end > 48) advance(false)
        }}
      >
        {phase === 'simpler' ? (
          <div className="flex flex-1 flex-col justify-center">
            <p className="font-serif text-3xl leading-snug">{simpler}</p>
          </div>
        ) : phase === 'bonus' && level.bonus ? (
          <QuestionView
            question={level.bonus}
            onAnswer={(correct) => {
              const pace = paceOf(correct, Date.now() - startedAt)
              playAnswer(correct, study.state.muted)
              setBonusRight(correct)
              setMood(correct ? 'happy' : 'oops')
              setWhy(level.bonus?.why ?? '')
              if (correct && !replay) study.addXp(0)
              setPhase('why')
              setSkip(false)
              if (!correct) setMissed(true)
              void pace
            }}
          />
        ) : card ? (
          phase === 'why' ? (
            <div className="flex flex-1 flex-col justify-center">
              <p className="font-serif text-3xl leading-snug">{why}</p>
              {skip ? <p className="mt-4 text-sm text-sage">That was quick. You can skip the next card.</p> : null}
            </div>
          ) : (
            <CardView card={card} onAnswer={(correct) => grade(card.kind === 'ask' ? card.question : level.bonus!, correct, card.id)} />
          )
        ) : null}
      </div>
      {phase !== 'play' || card?.kind !== 'ask' ? (
        <div className="mt-4 grid grid-cols-1 gap-2">
          {phase === 'why' && skip ? (
            <Button type="button" variant="secondary" onClick={() => advance(true)}>
              Skip ahead
            </Button>
          ) : null}
          {phase === 'why' ? (
            <Button
              type="button"
              onClick={() => {
                if (needsSimpler(lastPace)) {
                  setPhase('simpler')
                  return
                }
                advance(false)
              }}
            >
              Continue
            </Button>
          ) : phase === 'simpler' ? (
            <Button type="button" onClick={() => advance(false)}>
              Continue
            </Button>
          ) : phase === 'bonus' ? null : (
            <Button type="button" onClick={() => advance(false)}>
              {card?.kind === 'toy' ? 'Next' : 'Next'}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

function CardView({ card, onAnswer }: { card: Card; onAnswer: (correct: boolean) => void }) {
  if (card.kind === 'say') {
    return <p className="font-serif text-[1.85rem] leading-snug whitespace-pre-line">{card.text}</p>
  }
  if (card.kind === 'numbers') {
    return (
      <div>
        <p className="text-sm text-sage">{card.lead}</p>
        <ul className="mt-4 space-y-3">
          {card.lines.map((line) => (
            <li key={line} className="font-serif text-[1.55rem] leading-snug">
              {line}
            </li>
          ))}
        </ul>
      </div>
    )
  }
  if (card.kind === 'piece') {
    return (
      <div>
        <p className="font-serif text-[1.7rem] leading-snug">{card.plain}</p>
        <p className="mt-4 font-serif text-2xl">{card.numbers}</p>
        <p className="mt-6 text-sm text-mute">{card.name}</p>
        <p className="mt-1 font-serif text-5xl text-sage">{card.bit}</p>
      </div>
    )
  }
  if (card.kind === 'toy') {
    if (card.toy === 'leaky-bucket') return <BucketToy />
    return <p>This toy is not in the build yet.</p>
  }
  if (card.kind === 'steps') {
    return <DeltaWalk frames={card.frames} title={card.title} />
  }
  return <QuestionView question={card.question} onAnswer={onAnswer} />
}

function QuestionView({ question, onAnswer }: { question: Question; onAnswer: (correct: boolean) => void }) {
  const [slider, setSlider] = useState(question.kind === 'slider' ? question.min : 0)
  return (
    <div>
      <p className="font-serif text-[1.7rem] leading-snug">{question.prompt}</p>
      <div className="mt-5 grid gap-2">
        {question.kind === 'choice'
          ? question.choices.map((choice, index) => (
              <Button key={choice} type="button" variant="secondary" className="h-auto min-h-14 whitespace-normal rounded-2xl py-3 text-left" onClick={() => onAnswer(index === question.answer)}>
                {choice}
              </Button>
            ))
          : null}
        {question.kind === 'number'
          ? question.choices.map((choice) => (
              <Button key={choice} type="button" variant="secondary" className="font-serif text-2xl" onClick={() => onAnswer(choice === question.answer)}>
                {choice}
              </Button>
            ))
          : null}
        {question.kind === 'boolean' ? (
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={() => onAnswer(question.answer === true)}>
              Yes
            </Button>
            <Button type="button" variant="secondary" onClick={() => onAnswer(question.answer === false)}>
              No
            </Button>
          </div>
        ) : null}
        {question.kind === 'slider' ? (
          <div>
            <p className="font-serif text-5xl tabular-nums">{slider}</p>
            <input
              className="mt-3 w-full accent-sage"
              type="range"
              min={question.min}
              max={question.max}
              step={question.step}
              value={slider}
              onChange={(event) => setSlider(Number(event.target.value))}
            />
            <Button type="button" className="mt-4 w-full" onClick={() => onAnswer(slider === question.answer)}>
              Check
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
