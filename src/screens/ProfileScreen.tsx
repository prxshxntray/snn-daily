import { useState } from 'react'
import { Flame, GoalRing } from '@/components/Mascot.tsx'
import { Heatmap } from '@/components/Heatmap.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { defaultStartDate } from '@/course.ts'
import { isISODate, todayISO } from '@/lib/dates.ts'
import { RESTORE_CODE } from '@/lib/seed.ts'
import { useStudy } from '@/state/StudyContext.tsx'

export function ProfileScreen() {
  const study = useStudy()
  const [code, setCode] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [dateDraft, setDateDraft] = useState(study.startDate)

  function download() {
    const blob = new Blob([study.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `first-spike-${study.today}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="screen-in px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-28">
      <p className="text-[11px] tracking-[0.16em] text-sage uppercase">Prashant</p>
      <h1 className="font-serif text-4xl leading-none">Profile</h1>
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame lit={study.streak > 0} />
          <div>
            <p className="font-serif text-3xl leading-none">{study.streak}</p>
            <p className="text-xs text-mute">day streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl leading-none">{study.state.xp}</p>
          <p className="text-xs text-mute">XP</p>
        </div>
        <GoalRing today={study.earnedToday} goal={study.goal} />
      </div>
      <p className="mt-3 text-sm text-mute">Daily goal is {study.goal} XP, about one level. Today’s ring starts over each morning.</p>

      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.16em] text-sage uppercase">Courses</h2>
        <ul className="mt-2 space-y-2">
          {study.courses.map((course) => (
            <li key={course.id}>
              <button
                type="button"
                className={`w-full rounded-2xl border px-4 py-3 text-left ${
                  course.id === study.course.id ? 'border-sage bg-panel' : 'border-line'
                }`}
                onClick={() => study.setCourse(course.id)}
              >
                <span className="block font-serif text-2xl">{course.title}</span>
                <span className="text-sm text-mute">{course.tagline}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          Another subject is a new folder in content/courses, with a course file and level files. The path is the same.
        </p>
      </section>

      <section className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base">Mute</h2>
          <p className="text-sm text-mute">Turns off the little sounds and the tap buzz.</p>
        </div>
        <Switch checked={study.state.muted} onCheckedChange={study.setMuted} aria-label="Mute sounds" />
      </section>

      <section className="mt-6">
        <Heatmap today={study.today} activity={study.state.activity} />
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.16em] text-sage uppercase">Restore</h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          A fresh phone loads the November 17 save on its own. The code {RESTORE_CODE} brings that same place back after a reset. You can also paste a JSON backup.
        </p>
        <div className="mt-3 flex gap-2">
          <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder={RESTORE_CODE} aria-label="Import code" />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const result = study.importText(code)
              setNote(result.ok ? 'Restored.' : result.error)
            }}
          >
            Import
          </Button>
        </div>
        {note ? <p className="mt-2 text-sm text-sage">{note}</p> : null}
        <Button type="button" variant="secondary" className="mt-3 w-full" onClick={download}>
          Export backup
        </Button>
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] tracking-[0.16em] text-sage uppercase">Start date</h2>
        <div className="mt-2 flex gap-2">
          <Input type="date" value={dateDraft} aria-label="Start date" onChange={(event) => setDateDraft(event.target.value)} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!isISODate(dateDraft)) return
              study.setStartDate(dateDraft === defaultStartDate ? null : dateDraft)
            }}
          >
            Save
          </Button>
        </div>
        <button
          type="button"
          className="mt-2 min-h-11 text-sm text-sage"
          onClick={() => {
            const today = todayISO()
            setDateDraft(today)
            study.setStartDate(today === defaultStartDate ? null : today)
          }}
        >
          Start today
        </button>
      </section>

      <section className="mt-6 text-sm leading-relaxed text-mute">
        <p>
          iPhone will not deliver web push without a server. This app has none. The Scriptable widget is the morning nudge. It shows the day’s level and hides the answer until you tap through.
        </p>
      </section>

      <Button type="button" variant="clay" className="mt-8 w-full" onClick={() => study.resetStudy()}>
        Reset progress
      </Button>
    </div>
  )
}
