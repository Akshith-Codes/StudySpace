import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, Users, Star, Wifi, Wind, Plug, Volume2, Sun, ArrowLeft, Calendar } from 'lucide-react'
import { spaceService } from '../services/spaceService'
import { reviewService } from '../services/reviewService'
import { waitlistService } from '../services/waitlistService'
import { useAuth } from '../context/AuthContext'
import Seat from '../components/Seat'
import SeatLegend from '../components/SeatLegend'
import OccupancyBar from '../components/OccupancyBar'
import StatusBadge from '../components/StatusBadge'
import Rating from '../components/Rating'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import { formatDate } from '../utils/helpers'

const FACILITY_ICONS = {
  'Wi-Fi': Wifi,
  'AC': Wind,
  'Charging': Plug,
  'Power outlets': Plug,
  'Silent environment': Volume2,
  'Group study': Users,
  'Natural light': Sun,
}

export default function SpaceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [space, setSpace] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [showWaitlist, setShowWaitlist] = useState(false)

  const loadSpace = async () => {
    setLoading(true)
    setError(false)
    try {
      const [s, r] = await Promise.all([
        spaceService.getById(id),
        reviewService.getBySpace(id),
      ])
      if (!s) { setError(true); return }
      setSpace(s)
      setReviews(r)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSpace() }, [id])

  const handleSeatClick = (seat) => {
    if (seat.state === 'available') {
      setSelectedSeat(seat)
    }
  }

  const handleBookSeat = () => {
    if (!selectedSeat) return
    navigate(`/book/${space.id}?seat=${selectedSeat.id}`)
  }

  if (loading) return <LoadingState />
  if (error || !space) return <ErrorState message="Unable to load this study space." onRetry={loadSpace} />

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.ratings.Overall, 0) / reviews.length).toFixed(1) : space.rating

  return (
    <div className="space-y-6">
      <Link to="/spaces" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back to spaces
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{space.name}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin size={14} /> {space.building} · Floor {space.floor}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={space.availability} />
          <Rating value={parseFloat(avgRating)} count={space.reviewCount} />
        </div>
      </div>

      {/* Space info grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2 p-5">
          <p className="text-sm text-neutral-600">{space.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoItem icon={Users} label="Capacity" value={`${space.capacity} seats`} />
            <InfoItem icon={Clock} label="Hours" value={space.openHours} />
            <InfoItem icon={Volume2} label="Noise" value={space.noiseLevel} />
            <InfoItem icon={Star} label="Rating" value={`${avgRating} / 5`} />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Facilities</p>
            <div className="flex flex-wrap gap-2">
              {space.facilities.map((f) => {
                const Icon = FACILITY_ICONS[f] || CheckIcon
                return (
                  <span key={f} className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700">
                    <Icon size={14} className="text-neutral-400" /> {f}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live Occupancy */}
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Live Occupancy</h3>
          <div className="mb-3 text-center">
            <p className="text-3xl font-semibold text-neutral-900">{space.occupancyPercent}%</p>
            <p className="text-xs text-neutral-500">{space.occupiedCount} / {space.capacity} occupied</p>
          </div>
          <OccupancyBar occupied={space.occupiedCount} total={space.capacity} percent={space.occupancyPercent} showLabel={false} />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div><p className="text-xs text-neutral-500">Available</p><p className="text-sm font-medium text-success-600">{space.availableCount}</p></div>
            <div><p className="text-xs text-neutral-500">Reserved</p><p className="text-sm font-medium text-warning-600">{space.reservedCount}</p></div>
            <div><p className="text-xs text-neutral-500">Occupied</p><p className="text-sm font-medium text-neutral-700">{space.occupiedCount}</p></div>
          </div>
        </div>
      </div>

      {/* Seating Map */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900">Seating Layout</h3>
          {selectedSeat && (
            <span className="text-xs text-neutral-500">Selected: <span className="font-medium text-primary-600">{selectedSeat.label} ({selectedSeat.type})</span></span>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="mx-auto inline-block">
            {/* Window label */}
            <div className="mb-3 border-t border-dashed border-neutral-300 pt-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Window</div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${space.cols || 4}, minmax(0, 1fr))` }}>
              {space.seats.map((seat) => (
                <Seat key={seat.id} seat={seat} onClick={handleSeatClick} compact />
              ))}
            </div>
            <div className="mt-3 border-b border-dashed border-neutral-300 pb-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Entrance</div>
          </div>
        </div>

        <div className="mt-5">
          <SeatLegend />
        </div>

        <div className="mt-5 flex gap-2">
          {selectedSeat ? (
            <button onClick={handleBookSeat} className="btn-primary flex-1">Book Seat {selectedSeat.label}</button>
          ) : space.availability === 'Full' ? (
            <button onClick={() => setShowWaitlist(true)} className="btn-primary flex-1">Join Waitlist</button>
          ) : (
            <p className="text-xs text-neutral-500">Select an available seat to book it.</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet. Be the first to review this space.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">{review.studentName}</p>
                  <div className="flex items-center gap-2">
                    <Rating value={review.ratings.Overall} size={12} />
                    <span className="text-xs text-neutral-400">{formatDate(review.date)}</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <WaitlistModal open={showWaitlist} onClose={()=>setShowWaitlist(false)} space={space} />
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-neutral-500"><Icon size={12} /> {label}</p>
      <p className="mt-0.5 text-sm font-medium text-neutral-900">{value}</p>
    </div>
  )
}

function CheckIcon(props) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><polyline points="20 6 9 17 4 12" /></svg>
}

function WaitlistModal({ open, onClose, space }) {
  const { user } = useAuth()
  const [joined, setJoined] = useState(false)
  const [position, setPosition] = useState(null)

  const handleJoin = async () => {
    const entry = await waitlistService.join(space.id, space.name, user.id, user.name)
    setPosition(entry.position)
    setJoined(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Join Waitlist">
      {joined ? (
        <div className="text-center">
          <p className="text-sm text-neutral-600">You are <span className="font-semibold text-primary-600">#{position}</span> in the waitlist for {space.name}.</p>
          <p className="mt-2 text-xs text-neutral-500">You'll be notified when a seat becomes available.</p>
          <button onClick={onClose} className="btn-secondary mt-4">Done</button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-neutral-600">This space is currently full. Join the waitlist and we'll notify you when a seat becomes available.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleJoin} className="btn-primary flex-1">Join Waitlist</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
