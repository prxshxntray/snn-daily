export type Mood = 'idle' | 'happy' | 'oops' | 'cheer'

export function Mascot({ mood = 'idle', className = 'h-16 w-20' }: { mood?: Mood; className?: string }) {
  const eye = mood === 'oops' ? 38 : 31
  const motion = mood === 'oops' ? 'mascot-shake' : mood === 'idle' ? 'mascot-bob' : 'mascot-pop'
  return (
    <svg viewBox="0 0 80 64" className={`${className} ${motion}`} aria-hidden="true">
      <path d="M6 26c8-8 16-4 22 4" fill="none" stroke="#c9d7a6" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 42c8 6 14 2 20-6" fill="none" stroke="#c9d7a6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="34" r="16" fill="#1c2418" stroke="#c9d7a6" strokeWidth="3" />
      <circle cx="34" cy={eye} r="2.1" fill="#f3efe4" />
      <circle cx="46" cy={eye} r="2.1" fill="#f3efe4" />
      {mood === 'happy' || mood === 'cheer' ? (
        <path d="M34 40c2 3 10 3 12 0" fill="none" stroke="#e3a48c" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <path d="M35 41h10" fill="none" stroke="#a8a292" strokeWidth="2" strokeLinecap="round" />
      )}
      <path
        d="M56 34h8l4-10 4 20 4-10h6"
        fill="none"
        stroke={mood === 'idle' ? '#343b2c' : '#e3a48c'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Flame({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 24 32" className="h-7 w-5" aria-hidden="true">
      <path
        d="M12 30c-6-4-7-12-3-16 0 4 3 5 3 1 3 4 2-2 6-6-1 8 6 8 4 16-2 3-7 4-10 5z"
        fill={lit ? '#e3a48c' : '#343b2c'}
      />
    </svg>
  )
}

export function GoalRing({ today, goal }: { today: number; goal: number }) {
  const progress = Math.max(0, Math.min(1, goal === 0 ? 0 : today / goal))
  const radius = 16
  const turn = 2 * Math.PI * radius
  return (
    <svg viewBox="0 0 40 40" className="size-11" aria-label={`${today} of ${goal} XP today`}>
      <circle cx="20" cy="20" r={radius} fill="none" stroke="#343b2c" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r={radius}
        fill="none"
        stroke="#c9d7a6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={turn}
        strokeDashoffset={turn * (1 - progress)}
        transform="rotate(-90 20 20)"
      />
      <text x="20" y="23" textAnchor="middle" fontSize="9" fill="#f3efe4">
        {today}
      </text>
    </svg>
  )
}

export function Hearts({ left, total = 3 }: { left: number; total?: number }) {
  return (
    <div className="flex gap-1" aria-label={`${left} hearts left`}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`inline-block h-3.5 w-3.5 rounded-full ${index < left ? 'bg-clay' : 'bg-panel-2'}`}
        />
      ))}
    </div>
  )
}
