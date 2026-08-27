import { SeatIcon } from './SeatIcon'

const STATE_STYLES = {
  available: 'bg-white border-neutral-300 text-neutral-600 hover:border-primary-500 hover:bg-primary-50 cursor-pointer',
  selected: 'bg-primary-600 border-primary-600 text-white cursor-pointer',
  reserved: 'bg-neutral-200 border-neutral-300 text-neutral-400 cursor-not-allowed',
  occupied: 'bg-neutral-700 border-neutral-700 text-neutral-300 cursor-not-allowed',
  disabled: 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed opacity-50',
}

export default function Seat({ seat, onClick, compact = false }) {
  const style = STATE_STYLES[seat.state] || STATE_STYLES.available
  const clickable = seat.state === 'available' || seat.state === 'selected'

  return (
    <button
      onClick={() => clickable && onClick?.(seat)}
      disabled={!clickable}
      title={`${seat.label} — ${seat.type} (${seat.state})`}
      className={`relative flex flex-col items-center justify-center rounded-lg border-2 transition-all ${style} ${
        compact ? 'h-10 w-12' : 'h-14 w-16'
      }`}
    >
      <SeatIcon type={seat.type} size={compact ? 12 : 14} />
      <span className={`mt-0.5 font-medium ${compact ? 'text-2xs' : 'text-xs'}`}>{seat.label}</span>
    </button>
  )
}
