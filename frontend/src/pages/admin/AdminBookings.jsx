import { useState, useEffect } from 'react'
import { bookingService } from '../../services/bookingService'
import StatusBadge from '../../components/StatusBadge'
import LoadingState from '../../components/LoadingState'
import { BOOKING_STATUSES } from '../../types/constants'
import { formatDate, formatTime } from '../../utils/helpers'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  const load = async () => {
    const data = await bookingService.getAll()
    setBookings(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    await bookingService.cancel(id)
    load()
  }

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter)

  if (loading) return <LoadingState count={4} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Booking Management</h1>
        <p className="mt-1 text-sm text-neutral-500">View and manage all student bookings.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', ...BOOKING_STATUSES].map((s) => (
          <button key={s} onClick={()=>setFilter(s)} className={`rounded-lg border px-3 py-1.5 text-xs ${filter===s?'border-primary-500 bg-primary-50 text-primary-700':'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>{s}</button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-4 font-medium">Student</th>
              <th className="py-2 pr-4 font-medium">Space</th>
              <th className="py-2 pr-4 font-medium">Seat</th>
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Time</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-b border-neutral-100">
                <td className="py-3 pr-4 text-neutral-700">{b.studentId === 'usr_student' ? 'Aarav Sharma' : b.studentId === 'usr_student2' ? 'Priya Patel' : 'Rohan Gupta'}</td>
                <td className="py-3 pr-4 text-neutral-600">{b.spaceName}</td>
                <td className="py-3 pr-4 text-neutral-600">{b.seat}</td>
                <td className="py-3 pr-4 text-neutral-600">{formatDate(b.startTime)}</td>
                <td className="py-3 pr-4 text-neutral-600">{formatTime(b.startTime)}</td>
                <td className="py-3 pr-4"><StatusBadge status={b.status} /></td>
                <td className="py-3 pr-4">
                  {(b.status === 'Upcoming' || b.status === 'Active') && (
                    <button onClick={() => handleCancel(b.id)} className="text-xs text-error-600 hover:underline">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
