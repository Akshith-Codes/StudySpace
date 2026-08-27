import { SeatIcon } from './SeatIcon'

const LEGEND = [
  { state: 'available', label: 'Available', className: 'bg-white border-neutral-300' },
  { state: 'selected', label: 'Selected', className: 'bg-primary-600 border-primary-600' },
  { state: 'reserved', label: 'Reserved', className: 'bg-neutral-200 border-neutral-300' },
  { state: 'occupied', label: 'Occupied', className: 'bg-neutral-700 border-neutral-700' },
  { state: 'disabled', label: 'Disabled', className: 'bg-neutral-100 border-neutral-200 opacity-50' },
]

const TYPES = [
  { type: 'Standard', label: 'Standard' },
  { type: 'Window', label: 'Window' },
  { type: 'Charging', label: 'Charging' },
  { type: 'Silent', label: 'Silent' },
  { type: 'Accessible', label: 'Accessible' },
  { type: 'Cabin', label: 'Cabin' },
]

export default function SeatLegend() {
  return (
    <div className="space-y-3">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Seat States</h4>
        <div className="flex flex-wrap gap-3">
          {LEGEND.map((item) => (
            <div key={item.state} className="flex items-center gap-1.5">
              <div className={`h-4 w-4 rounded border-2 ${item.className}`} />
              <span className="text-xs text-neutral-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Seat Types</h4>
        <div className="flex flex-wrap gap-3">
          {TYPES.map((item) => (
            <div key={item.type} className="flex items-center gap-1.5">
              <SeatIcon type={item.type} size={14} />
              <span className="text-xs text-neutral-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
