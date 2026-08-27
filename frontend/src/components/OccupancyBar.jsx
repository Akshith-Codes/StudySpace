export default function OccupancyBar({ occupied, total, percent, showLabel = true }) {
  const pct = percent !== undefined ? percent : total > 0 ? Math.round((occupied / total) * 100) : 0
  let color = 'bg-success-500'
  if (pct >= 90) color = 'bg-neutral-400'
  else if (pct >= 70) color = 'bg-error-500'
  else if (pct >= 40) color = 'bg-warning-500'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs text-neutral-500">
          <span>{occupied} / {total} occupied</span>
          <span className="font-medium text-neutral-700">{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
