import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { bookingService } from '../services/bookingService'
import BookingCard from '../components/BookingCard'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import { BOOKING_STATUSES } from '../types/constants'

export default function Bookings() {
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const loadBookings = async () => {
    setLoading(true)
    const data = await bookingService.getByStudent(user.id)
    setBookings(data)
    setLoading(false)
  }

  useEffect(() => { loadBookings() }, [user.id])

  const handleCancel = async (booking) => {
    await bookingService.cancel(booking.id)
    await pushNotification('booking_cancelled', 'Booking Cancelled', `Your booking at ${booking.spaceName} has been cancelled.`)
    loadBookings()
  }

  const handleCheckIn = async (booking) => {
    await bookingService.checkIn(booking.id)
    await pushNotification('check_in_successful', 'Check-in Successful', `You've checked in at ${booking.spaceName}, seat ${booking.seat}.`)
    loadBookings()
  }

  const handleCheckOut = async (booking) => {
    await bookingService.checkOut(booking.id)
    await pushNotification('check_out_successful', 'Check-out Successful', `Your study session at ${booking.spaceName} is complete.`)
    loadBookings()
  }

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">My Bookings</h1>
        <p className="mt-1 text-sm text-neutral-500">View and manage your study space reservations.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', ...BOOKING_STATUSES].map((s) => (
          <button key={s} onClick={()=>setFilter(s)} className={`rounded-lg border px-3 py-1.5 text-xs ${filter===s?'border-primary-500 bg-primary-50 text-primary-700':'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? <LoadingState /> :
       filtered.length === 0 ? (
         <div className="card p-5">
           <EmptyState icon={CalendarCheck} title="No bookings found" message={filter==='All'?"You haven't made any bookings yet.":`No ${filter.toLowerCase()} bookings.`} action={filter==='All'?<Link to="/spaces" className="btn-primary">Find a Space</Link>:null} />
         </div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {filtered.map((b) => (
             <BookingCard key={b.id} booking={b} onCancel={handleCancel} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} onView />
           ))}
         </div>
       )}
    </div>
  )
}
