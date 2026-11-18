import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'

export function BucketToy() {
  const [water, setWater] = useState(0)
  const [hole, setHole] = useState(2)
  const [brim, setBrim] = useState(10)
  const [note, setNote] = useState('Pour, or just wait.')
  const [tipped, setTipped] = useState(false)

  function wait() {
    setTipped(false)
    setWater((current) => {
      const next = Math.max(0, current - hole)
      setNote(hole === 0 ? 'The hole is closed. Nothing drains.' : `Waited. The hole took ${Math.min(hole, current)}.`)
      return next
    })
  }

  function pour() {
    const added = 4
    setWater((current) => {
      const leaked = Math.min(hole, current + added)
      let next = current + added - leaked
      if (next >= brim) {
        setTipped(true)
        setNote(`Poured ${added}. It reached ${brim} and tipped.`)
        return 0
      }
      setTipped(false)
      setNote(`Poured ${added}. The hole took ${leaked}. Now ${next}.`)
      return next
    })
  }

  const fill = Math.max(0, Math.min(1, water / brim))

  return (
    <div className="rounded-3xl border border-line bg-panel px-4 py-4">
      <div className="flex items-end justify-center gap-6">
        <div className="relative h-36 w-24">
          <div className="absolute inset-x-1 bottom-0 top-3 overflow-hidden rounded-b-2xl border-2 border-sage/80 bg-ink">
            <div
              className="absolute inset-x-0 bottom-0 bg-sage/80 transition-all duration-500"
              style={{ height: `${fill * 100}%` }}
            />
          </div>
          <div className="absolute inset-x-0 top-0 h-1 rounded-full bg-clay" />
          {tipped ? <span className="absolute -top-1 right-0 text-xs text-clay">tip</span> : null}
        </div>
        <div className="pb-2 text-left">
          <p className="font-serif text-4xl leading-none tabular-nums">{water}</p>
          <p className="text-sm text-mute">water</p>
          <p className="mt-2 text-sm text-mute">brim {brim}</p>
        </div>
      </div>
      <p className="mt-3 min-h-10 text-center text-sm leading-snug">{note}</p>
      <label className="mt-2 block text-sm text-mute">
        Hole {hole}
        <input
          className="mt-1 w-full accent-sage"
          type="range"
          min={0}
          max={4}
          step={1}
          value={hole}
          onChange={(event) => setHole(Number(event.target.value))}
        />
      </label>
      <label className="mt-2 block text-sm text-mute">
        Brim {brim}
        <input
          className="mt-1 w-full accent-clay"
          type="range"
          min={6}
          max={12}
          step={1}
          value={brim}
          onChange={(event) => setBrim(Number(event.target.value))}
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button type="button" variant="secondary" onClick={wait}>
          Wait
        </Button>
        <Button type="button" onClick={pour}>
          Pour 4
        </Button>
      </div>
    </div>
  )
}
