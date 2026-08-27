import { useState, useEffect } from 'react'
import { QrCode, Upload, Camera, Check, Clock, MapPin, Armchair, Activity } from 'lucide-react'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { formatTime, formatDuration } from '../utils/helpers'

export default function CheckIn() {
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [scanned, setScanned] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const [completed, setCompleted] = useState(null)

  const loadBookings = async () => {
    const data = await bookingService.getByStudent(user.id)
    setBookings(data)
    const active = data.find((b) => b.status === 'Active')
    if (active) setActiveSession(active)
    setLoading(false)
  }

  useEffect(() => { loadBookings() }, [user.id])

  const upcomingBookings = bookings.filter((b) => b.status === 'Upcoming')

  const handleMockScan = async () => {
    setScanned(true)
    setTimeout(() => setScanned(false), 2000)
    if (upcomingBookings.length > 0) {
      const booking = upcomingBookings[0]
      await bookingService.checkIn(booking.id)
      await pushNotification('check_in_successful', 'Check-in Successful', `You've checked in at ${booking.spaceName}, seat ${booking.seat}.`)
      loadBookings()
    }
  }

  const handleCheckOut = async () => {
    if (!activeSession) return
    await bookingService.checkOut(activeSession.id)
    await pushNotification('check_out_successful', 'Study Session Completed', `Your session at ${activeSession.spaceName} lasted ${formatDuration(activeSession.duration)}.`)
    setCompleted(activeSession)
    setActiveSession(null)
    loadBookings()
  }

  if (loading) return <div className="skeleton h-64" />

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Check In / Check Out</h1>
        <p className="mt-1 text-sm text-neutral-500">Scan a QR code or select a booking to check in.</p>
      </div>

      {completed && (
        <div className="card p-5 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
              <Check size={24} className="text-success-600" />
            </div>
          </div>
          <h2 className="text-sm font-semibold text-neutral-900">Study session completed</h2>
          <p className="mt-1 text-sm text-neutral-500">Session duration: {formatDuration(completed.duration)}</p>
          <button onClick={()=>setCompleted(null)} className="btn-secondary mt-4">Done</button>
        </div>
      )}

      {activeSession && !completed && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Active Session</h2>
            <StatusBadge status="Active" />
          </div>
          <div className="space-y-2 text-sm">
            <Row icon={MapPin} label="Space" value={activeSession.spaceName} />
            <Row icon={Armchair} label="Seat" value={activeSession.seat} />
            <Row icon={Clock} label="Started" value={formatTime(activeSession.checkInTime)} />
            <Row icon={Activity} label="Duration" value={formatDuration(activeSession.duration)} />
          </div>
          <button onClick={handleCheckOut} className="btn-primary mt-4 w-full">Check Out</button>
        </div>
      )}

      {!activeSession && !completed && (
        <>
          {/* QR Scanner UI */}
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Scan QR Code</h2>
            <div className={`relative mx-auto flex h-48 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed ${scanned ? 'border-success-400 bg-success-50' : 'border-neutral-300 bg-neutral-50'}`}>
              {scanned ? (
                <div className="text-center">
                  <Check size={32} className="mx-auto text-success-600" />
                  <p className="mt-2 text-sm text-success-600">Check-in successful</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera size={32} className="mx-auto text-neutral-400" />
                  <p className="mt-2 text-xs text-neutral-500">Camera preview will appear here</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleMockScan} className="btn-primary flex-1">
                <QrCode size={16} /> Mock Scan
              </button>
              <button className="btn-secondary flex-1">
                <Upload size={16} /> Upload QR
              </button>
            </div>
          </div>

          {/* Upcoming bookings for manual check-in */}
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Or check in manually</h2>
            {upcomingBookings.length === 0 ? (
              <EmptyState icon={Clock} title="No upcoming bookings" message="Book a space first to check in." />
            ) : (
              <div className="space-y-2">
                {upcomingBookings.map((b) => (
                  <button key={b.id} onClick={handleMockScan} className="flex w-full items-center justify-between rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{b.spaceName}</p>
                      <p className="text-xs text-neutral-500">Seat {b.seat} · {formatTime(b.startTime)}</p>
                    </div>
                    <span className="text-xs font-medium text-primary-600">Check In</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0">
      <span className="flex items-center gap-1.5 text-neutral-500"><Icon size={14} /> {label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  )
}
