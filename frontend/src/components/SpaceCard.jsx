import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import StatusBadge from './StatusBadge'
import OccupancyBar from './OccupancyBar'
import Rating from './Rating'

export default function SpaceCard({ space, onBook }) {
  return (
    <div className="card p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">{space.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
            <MapPin size={12} />
            {space.building} · Floor {space.floor}
          </p>
        </div>
        <StatusBadge status={space.availability} />
      </div>

      <div className="mb-3">
        <OccupancyBar occupied={space.occupiedCount} total={space.capacity} percent={space.occupancyPercent} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {space.facilities.slice(0, 4).map((f) => (
          <span key={f} className="badge-neutral">{f}</span>
        ))}
        {space.facilities.length > 4 && (
          <span className="badge-neutral">+{space.facilities.length - 4}</span>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <Rating value={space.rating} count={space.reviewCount} />
        <span className="flex items-center gap-1 text-xs text-neutral-500">
          <Users size={12} />
          {space.noiseLevel}
        </span>
      </div>

      <div className="flex gap-2">
        <Link to={`/spaces/${space.id}`} className="btn-secondary flex-1">
          View Space
        </Link>
        <button
          onClick={() => onBook?.(space)}
          className="btn-primary flex-1"
          disabled={space.availability === 'Full'}
        >
          Book
        </button>
      </div>
    </div>
  )
}
