import { heatmapWeeks } from '@/lib/dates.ts'

const LEVEL = [
  'bg-panel-2',
  'bg-sage/35',
  'bg-sage/60',
  'bg-sage',
]

export function Heatmap({
  today,
  activity,
}: {
  today: string
  activity: Record<string, { attempted: number }>
}) {
  const columns = heatmapWeeks(today, 16)
  return (
    <div>
      <div className="mb-2 flex justify-between text-[11px] tracking-[0.14em] text-mute uppercase">
        <span>Last 16 weeks</span>
        <span>Mon to Sun</span>
      </div>
      <div className="flex gap-[3px]" aria-hidden="true">
        {columns.map((column) => (
          <div key={column[0]} className="flex flex-col gap-[3px]">
            {column.map((date) => {
              const attempted = activity[date]?.attempted ?? 0
              const future = date > today
              const level = future ? 0 : attempted === 0 ? 0 : attempted < 3 ? 1 : attempted < 6 ? 2 : 3
              return (
                <span
                  key={date}
                  title={future ? date : `${date}: ${attempted} answers`}
                  className={`block size-[13px] rounded-[3px] ${future ? 'bg-transparent' : LEVEL[level]}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-mute">
        <span>Quiet</span>
        {LEVEL.map((tone) => (
          <span key={tone} className={`size-[13px] rounded-[3px] ${tone}`} />
        ))}
        <span>Busy</span>
      </div>
    </div>
  )
}
