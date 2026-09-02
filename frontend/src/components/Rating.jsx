import { Star } from 'lucide-react'

export default function Rating({ value, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={size} className="fill-warning-400 text-warning-400" />
      <span className="num text-sm font-medium text-neutral-700">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-neutral-400">({count})</span>}
    </div>
  )
}