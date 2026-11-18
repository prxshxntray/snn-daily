import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'

export type DeltaFrame = {
  caption: string
  sent: number
  reading: number
  previous: number
  send: boolean
}

export function DeltaWalk({ frames, title }: { frames: DeltaFrame[]; title?: string }) {
  const [step, setStep] = useState(0)
  const frame = frames[Math.min(step, frames.length - 1)]!
  const fromSent = frame.reading - frame.sent
  const fromPrevious = frame.reading - frame.previous
  return (
    <div className="rounded-3xl border border-line bg-panel px-4 py-4">
      {title ? <p className="text-sm text-sage">{title}</p> : null}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[11px] tracking-wide text-mute uppercase">Last sent</p>
          <p className="font-serif text-3xl">{frame.sent}</p>
        </div>
        <div>
          <p className="text-[11px] tracking-wide text-mute uppercase">Reading</p>
          <p className="font-serif text-3xl">{frame.reading}</p>
        </div>
        <div>
          <p className="text-[11px] tracking-wide text-mute uppercase">Previous</p>
          <p className="font-serif text-3xl text-mute">{frame.previous}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <p className="rounded-2xl bg-sage/15 px-3 py-2">From last sent: {fromSent}</p>
        <p className="rounded-2xl bg-panel-2 px-3 py-2 text-mute">From previous reading: {fromPrevious}</p>
      </div>
      <p className="mt-3 min-h-16 text-base leading-snug">{frame.caption}</p>
      <p className={`mt-2 text-sm ${frame.send ? 'text-sage' : 'text-mute'}`}>
        {frame.send ? 'Send. The memory moves.' : 'Stay quiet. The memory stays.'}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-mute">
          Step {step + 1} / {frames.length}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setStep((value) => (value + 1) % frames.length)}
        >
          Next step
        </Button>
      </div>
    </div>
  )
}
