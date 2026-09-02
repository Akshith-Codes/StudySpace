export default function OccupancyBar({ occupied, total, percent, showLabel = true }) {
  const pct = percent !== undefined ? percent : total > 0 ? Math.round((occupied / total) * 100) : 0
  let color = 'bg-success-600'
  if (pct >= 90) color = 'bg-neutral-500'
  else if (pct >= 70) color = 'bg-error-600'
  else if (pct >= 40) color = 'bg-warning-600'

  // Segmented like a readout board rather than a smooth pill — ticks every 10%.
  const segments = Array.from({ length: 10 })

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-baseline justify-between text-xs text-neutral-500">
          <span className="num">{occupied}/{total} occupied</span>
          <span className="num font-semibold text-neutral-800">{pct}%</span>
        </div>
      )}
      <div className="flex h-2 w-full gap-0.5">
        {segments.map((_, i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-[1px] transition-colors duration-500 ${
              (i + 1) * 10 <= pct ? color : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}