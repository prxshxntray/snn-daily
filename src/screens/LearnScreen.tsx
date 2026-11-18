import { useState } from 'react'
import { Flame, GoalRing, Mascot } from '@/components/Mascot.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { formatMonthDay } from '@/lib/dates.ts'
import { lessonOpenDate } from '@/lib/unlock.ts'
import { go } from '@/lib/route.ts'
import type { Level } from '@/lib/types.ts'
import { useOnline, useStudy } from '@/state/StudyContext.tsx'

export function LearnScreen() {
  const study = useStudy()
  const online = useOnline()
  const [pending, setPending] = useState<Level | null>(null)
  const [hint, setHint] = useState(!study.state.installHintDismissed)

  return (
    <div className="screen-in px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-28">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Mascot className="h-12 w-14" />
          <div>
            <p className="text-[11px] tracking-[0.16em] text-sage uppercase">{study.course.title}</p>
            <p className="font-serif text-2xl leading-none">{study.state.xp} XP</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Flame lit={study.streak > 0} />
            <span className="font-serif text-xl tabular-nums">{study.streak}</span>
          </div>
          <GoalRing today={study.earnedToday} goal={study.goal} />
        </div>
      </header>
      {!online ? <p className="mt-3 text-sm text-mute">Offline. Levels already opened stay on this phone.</p> : null}
      {hint ? (
        <div className="mt-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm leading-relaxed">
          <p>Add First Spike to your Home Screen for the train. In Safari: Share, then Add to Home Screen.</p>
          <button
            type="button"
            className="mt-2 min-h-11 text-sage"
            onClick={() => {
              study.dismissHint()
              setHint(false)
            }}
          >
            Got it
          </button>
        </div>
      ) : null}
      {study.current ? (
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-between rounded-2xl bg-sage px-4 py-3 text-left text-ink"
          onClick={() => go(`/play/${study.current?.id}`)}
        >
          <span>
            <span className="block text-[11px] tracking-[0.14em] uppercase">
              {study.state.resume?.levelId === study.current.id ? 'Continue' : 'Play'}
            </span>
            <span className="font-serif text-2xl leading-tight">{study.current.title}</span>
          </span>
          <span className="text-sm">Go</span>
        </button>
      ) : null}
      <div className="mt-6 space-y-8">
        {study.blocks.map((block) => (
          <section key={block.id}>
            <div className="rounded-2xl border border-line bg-panel px-4 py-3">
              <p className="text-[11px] tracking-[0.16em] text-sage uppercase">
                {block.levels.filter((level) => study.state.levelClears[level.id]).length}/{block.levels.length}
              </p>
              <h2 className="font-serif text-3xl leading-none">{block.title}</h2>
              <p className="mt-1 text-sm text-mute">{block.blurb}</p>
            </div>
            <div className="relative mx-auto mt-2 max-w-sm">
              <div className="absolute top-2 bottom-2 left-1/2 w-px bg-line" />
              <ol className="relative space-y-3 py-3">
                {block.levels.map((level, index) => {
                  const done = Boolean(study.state.levelClears[level.id])
                  const open = study.isOpen(level)
                  const here = study.current?.id === level.id
                  const side = index % 2 === 0 ? 'mr-auto ml-6' : 'mr-6 ml-auto'
                  return (
                    <li key={level.id} className={`w-40 ${side}`}>
                      <button
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-full border px-3 py-2 text-left ${
                          here ? 'border-sage bg-ink' : done ? 'border-sage/50 bg-panel' : 'border-line bg-ink'
                        } ${open ? '' : 'opacity-45'}`}
                        onClick={() => {
                          if (open) go(`/play/${level.id}`)
                          else setPending(level)
                        }}
                      >
                        <span
                          className={`flex size-11 shrink-0 items-center justify-center rounded-full font-serif text-lg ${
                            done ? 'bg-sage text-ink' : here ? 'bg-sage/20 text-sage' : 'bg-panel-2 text-mute'
                          }`}
                        >
                          {done ? '✓' : level.order}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{level.title}</span>
                          {here ? <Mascot className="mt-1 h-6 w-8" /> : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>
        ))}
      </div>
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending?.title}</DialogTitle>
            <DialogDescription>
              This opens {pending ? formatMonthDay(lessonOpenDate(study.startDate, pending.order)) : ''}. You can play it early. Tomorrow’s new level still arrives on schedule.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (!pending) return
                study.readAhead(pending.id)
                const id = pending.id
                setPending(null)
                go(`/play/${id}`)
              }}
            >
              Play it early
            </Button>
            <Button type="button" variant="secondary" onClick={() => setPending(null)}>
              Wait
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
