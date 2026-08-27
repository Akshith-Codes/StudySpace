import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Clock, Armchair, Check, X, Timer, AlertCircle } from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import QRCodeDisplay from '../components/QRCodeDisplay'
import { formatDate, formatTime, formatDuration } from '../utils/helpers'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState('')
  const intervalRef = useRef(null)

  const loadBooking = async () => {
    const b = await bookingService.getById(id)
    setBooking(b)
    setLoading(false)
  }

  useEffect(() => { loadBooking() }, [id])

  // 5-minute no-show countdown
  useEffect(() => {
    if (!booking || booking.status !== 'Upcoming') return
    const startTime = new Date(booking.startTime).getTime()

    const updateCountdown = () => {
      const now = Date.now()
      if (now < startTime) {
        setCountdown('')
        return
      }
      const elapsed = now - startTime
      const remaining = 5 * 60 * 1000 - elapsed
      if (remaining <= 0) {
        setCountdown('expired')
        bookingService.markNoShow(booking.id)
        pushNotification('no_show_cancellation', 'Booking Released', 'Your booking was released because check-in was not completed within 5 minutes.')
        loadBooking()
      } else {
        const mins = Math.floor(remaining / 60000)
        const secs = Math.floor((remaining % 60000) / 1000)
        setCountdown(`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`)
      }
    }

    intervalRef.current = setInterval(updateCountdown, 1000)
    updateCountdown()
    return () => clearInterval(intervalRef.current)
  }, [booking?.id, booking?.status])

  const handleCheckIn = async () => {
    await bookingService.checkIn(booking.id)
    await pushNotification('check_in_successful', 'Check-in Successful', `You've checked in at ${booking.spaceName}, seat ${booking.seat}.`)
    loadBooking()
  }

  const handleCheckOut = async () => {
    await bookingService.checkOut(booking.id)
    await pushNotification('check_out_successful', 'Check-out Successful', `Your study session at ${booking.spaceName} is complete.`)
    loadBooking()
  }

  const handleCancel = async () => {
    await bookingService.cancel(booking.id)
    await pushNotification('booking_cancelled', 'Booking Cancelled', `Your booking at ${booking.spaceName} has been cancelled.`)
    navigate('/bookings')
  }

  if (loading) return <div className="skeleton h-64" />
  if (!booking) return <p className="text-sm text-neutral-500">Booking not found.</p>

  const showCountdown = booking.status === 'Upcoming' && countdown && countdown !== 'expired'
  const showNoShow = countdown === 'expired' || booking.status === 'No-show'

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link to="/bookings" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back to bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Booking Details</h1>
        <StatusBadge status={booking.status} />
      </div>

      {showCountdown && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-50 border border-warning-200 px-4 py-3">
          <Timer size={16} className="text-warning-600" />
          <div>
            <p className="text-sm font-medium text-warning-700">Check-in required</p>
            <p className="text-xs text-warning-600">Time remaining: {countdown}</p>
          </div>
        </div>
      )}

      {showNoShow && (
        <div className="flex items-center gap-2 rounded-lg bg-error-50 border border-error-200 px-4 py-3">
          <AlertCircle size={16} className="text-error-600" />
          <p className="text-sm text-error-700">Your booking was released because check-in was not completed within 5 minutes.</p>
        </div>
      )}

      <div className="card p-5">
        <div className="space-y-3 text-sm">
          <Detail icon={MapPin} label="Space" value={booking.spaceName} />
          <Detail icon={MapPin} label="Location" value={`${booking.building} · Floor ${booking.floor}`} />
          <Detail icon={Armchair} label="Seat" value={booking.seat} />
          <Detail icon={Calendar} label="Date" value={formatDate(booking.startTime)} />
          <Detail icon={Clock} label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
          <Detail icon={Clock} label="Duration" value={formatDuration(booking.duration)} />
          <Detail label="Booking ID" value={booking.id.slice(-8).toUpperCase()} />
        </div>
      </div>

      {booking.status !== 'Cancelled' && booking.status !== 'No-show' && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">QR Code for Check-in</h3>
          <div className="flex justify-center">
            <QRCodeDisplay value={JSON.stringify({ id: booking.id, space: booking.spaceName, seat: booking.seat })} />
          </div>
        </div>
      )}

      {booking.status === 'Active' && booking.checkInTime && (
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Active Session</h3>
          <div className="space-y-2 text-sm">
            <Detail label="Started at" value={formatTime(booking.checkInTime)} />
            <Detail label="Space" value={booking.spaceName} />
            <Detail label="Seat" value={booking.seat} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {booking.status === 'Upcoming' && (
          <button onClick={handleCheckIn} className="btn-primary flex-1">Check In</button>
        )}
        {booking.status === 'Active' && (
          <button onClick={handleCheckOut} className="btn-primary flex-1">Check Out</button>
        )}
        {(booking.status === 'Upcoming' || booking.status === 'Active') && (
          <button onClick={handleCancel} className="btn-ghost text-error-600 hover:bg-error-50">Cancel Booking</button>
        )}
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0">
      <span className="flex items-center gap-1.5 text-neutral-500">
        {Icon && <Icon size={14} />} {label}
      </span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  )
}
