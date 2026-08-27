import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, CalendarCheck, Map, QrCode, Clock, ChevronRight, TrendingUp, Users, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { spaceService } from '../services/spaceService'
import { bookingService } from '../services/bookingService'
import { recommendationService } from '../services/recommendationService'
import SpaceCard from '../components/SpaceCard'
import OccupancyBar from '../components/OccupancyBar'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import { formatDate, formatTime, timeUntil } from '../utils/helpers'

export default function Dashboard() {
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [bookings, setBookings] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const [s, b, recs] = await Promise.all([
        spaceService.getAll(),
        bookingService.getByStudent(user.id),
        recommendationService.getRecommendations(user.preferences, {
          facilities: user.favoriteFacilities,
          studyStyle: user.studyStyle,
          year: user.year,
        }),
      ])
      setSpaces(s)
      setBookings(b)
      setRecommendations(recs.slice(0, 4))
      setLoading(false)
    }
    loadData()
  }, [user])

  const upcomingBooking = bookings.find((b) => b.status === 'Upcoming' || b.status === 'Active')
  const totalSeats = spaces.reduce((sum, s) => sum + s.capacity, 0)
  const occupiedSeats = spaces.reduce((sum, s) => sum + s.occupiedCount, 0)
  const reservedSeats = spaces.reduce((sum, s) => sum + s.reservedCount, 0)
  const availableSeats = spaces.reduce((sum, s) => sum + s.availableCount, 0)
  const overallOccupancy = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0

  const popularSpaces = [...spaces].sort((a, b) => b.occupancyPercent - a.occupancyPercent).slice(0, 3)

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/spaces?q=${encodeURIComponent(search)}`)
  }

  const handleBook = (space) => {
    navigate(`/spaces/${space.id}`)
  }

  const handleCheckIn = async (booking) => {
    await bookingService.checkIn(booking.id)
    await pushNotification('check_in_successful', 'Check-in Successful', `You've checked in at ${booking.spaceName}, seat ${booking.seat}.`)
    setBookings(await bookingService.getByStudent(user.id))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return <div className="space-y-6"><div className="skeleton h-8 w-64" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:3}).map((_,i)=><div key={i} className="skeleton h-48" />)}</div></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">{greeting}, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-neutral-500">Find a place to study.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input value={search} onChange={(e)=>setSearch(e.target.value)} className="input pl-9" placeholder="Search study spaces..." />
      </form>

      {/* Upcoming Booking */}
      {upcomingBooking ? (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Upcoming Booking</h2>
            <StatusBadge status={upcomingBooking.status} />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-900">{upcomingBooking.spaceName}</p>
              <p className="text-xs text-neutral-500">{upcomingBooking.building} · Floor {upcomingBooking.floor} · Seat {upcomingBooking.seat}</p>
              <p className="text-xs text-neutral-500">{formatDate(upcomingBooking.startTime)} · {formatTime(upcomingBooking.startTime)} – {formatTime(upcomingBooking.endTime)}</p>
              {upcomingBooking.status === 'Upcoming' && (
                <p className="flex items-center gap-1 text-xs font-medium text-primary-600">
                  <Clock size={12} /> Starts in {timeUntil(upcomingBooking.startTime)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link to={`/bookings/${upcomingBooking.id}`} className="btn-secondary">View</Link>
              {upcomingBooking.status === 'Upcoming' && (
                <button onClick={()=>handleCheckIn(upcomingBooking)} className="btn-primary">Check In</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-5">
          <EmptyState
            icon={CalendarCheck}
            title="No upcoming bookings"
            message="Find a study space for your next session."
            action={<Link to="/spaces" className="btn-primary">Find a Space</Link>}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { to: '/spaces', label: 'Find a Space', icon: Search },
          { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
          { to: '/map', label: 'Campus Map', icon: Map },
          { to: '/check-in', label: 'Scan QR', icon: QrCode },
        ].map((a) => (
          <Link key={a.to} to={a.to} className="card flex flex-col items-center gap-2 p-4 transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <a.icon size={20} className="text-primary-600" />
            </div>
            <span className="text-xs font-medium text-neutral-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Campus Occupancy */}
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={16} className="text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Campus Occupancy</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500">Total Seats</p>
            <p className="text-lg font-semibold text-neutral-900">{totalSeats}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Occupied</p>
            <p className="text-lg font-semibold text-neutral-900">{occupiedSeats}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Reserved</p>
            <p className="text-lg font-semibold text-neutral-900">{reservedSeats}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Available</p>
            <p className="text-lg font-semibold text-success-600">{availableSeats}</p>
          </div>
        </div>
        <div className="mt-4">
          <OccupancyBar occupied={occupiedSeats} total={totalSeats} percent={overallOccupancy} />
        </div>
      </div>

      {/* Recommended */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recommended For You</h2>
          <Link to="/recommendations" className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((space) => (
            <div key={space.id} className="card p-4 transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <span className="badge-primary">{space.matchScore}% Match</span>
                <StatusBadge status={space.availability} />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">{space.name}</h3>
              <p className="mt-0.5 text-xs text-neutral-500">{space.building} · Floor {space.floor}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {space.facilities.slice(0, 3).map((f) => <span key={f} className="badge-neutral">{f}</span>)}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500">★ {space.rating} · {space.noiseLevel}</span>
                <Link to={`/spaces/${space.id}`} className="text-xs font-medium text-primary-600 hover:underline">View</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Spaces */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Popular Spaces</h2>
        </div>
        <div className="space-y-2">
          {popularSpaces.map((space) => (
            <Link key={space.id} to={`/spaces/${space.id}`} className="card flex items-center justify-between p-4 transition-shadow hover:shadow-md">
              <div>
                <p className="text-sm font-medium text-neutral-900">{space.name}</p>
                <p className="text-xs text-neutral-500">{space.building} · {space.availableCount} seats available</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24"><OccupancyBar occupied={space.occupiedCount} total={space.capacity} percent={space.occupancyPercent} showLabel={false} /></div>
                <StatusBadge status={space.availability} />
                <ChevronRight size={16} className="text-neutral-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
