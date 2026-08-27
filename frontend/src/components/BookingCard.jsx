import { Link } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { formatDate, formatTime, formatDuration } from '../utils/helpers'

export default function BookingCard({ booking, onCancel, onCheckIn, onCheckOut, onView }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{booking.spaceName}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {booking.building} · Floor {booking.floor} · Seat {booking.seat}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Calendar size={12} />
          {formatDate(booking.startTime)}
        </div>
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Clock size={12} />
          {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
        </div>
        <div className="flex items-center gap-1.5 text-neutral-600">
          <Clock size={12} />
          {formatDuration(booking.duration)}
        </div>
        <div className="text-neutral-400">
          ID: {booking.id.slice(-8)}
        </div>
      </div>

      <div className="flex gap-2">
        {onView && (
          <Link to={`/bookings/${booking.id}`} className="btn-secondary flex-1">
            View
          </Link>
        )}
        {onCheckIn && booking.status === 'Upcoming' && (
          <button onClick={() => onCheckIn(booking)} className="btn-primary flex-1">
            Check In
          </button>
        )}
        {onCheckOut && booking.status === 'Active' && (
          <button onClick={() => onCheckOut(booking)} className="btn-primary flex-1">
            Check Out
          </button>
        )}
        {onCancel && (booking.status === 'Upcoming' || booking.status === 'Active') && (
          <button onClick={() => onCancel(booking)} className="btn-ghost text-error-600 hover:bg-error-50">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
