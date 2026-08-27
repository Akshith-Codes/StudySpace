import { useState, useEffect } from 'react'
import { spaceService } from '../../services/spaceService'
import StatusBadge from '../../components/StatusBadge'
import OccupancyBar from '../../components/OccupancyBar'
import LoadingState from '../../components/LoadingState'

export default function AdminOccupancy() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await spaceService.getAll()
      setSpaces(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={3} />

  const totalSeats = spaces.reduce((sum, s) => sum + s.capacity, 0)
  const totalOccupied = spaces.reduce((sum, s) => sum + s.occupiedCount, 0)
  const totalReserved = spaces.reduce((sum, s) => sum + s.reservedCount, 0)
  const totalAvailable = spaces.reduce((sum, s) => sum + s.availableCount, 0)
  const overall = totalSeats > 0 ? Math.round((totalOccupied / totalSeats) * 100) : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Occupancy Overview</h1>
        <p className="mt-1 text-sm text-neutral-500">Real-time occupancy across all study spaces.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4"><p className="text-xs text-neutral-500">Total Seats</p><p className="text-xl font-semibold text-neutral-900">{totalSeats}</p></div>
        <div className="card p-4"><p className="text-xs text-neutral-500">Occupied</p><p className="text-xl font-semibold text-neutral-900">{totalOccupied}</p></div>
        <div className="card p-4"><p className="text-xs text-neutral-500">Reserved</p><p className="text-xl font-semibold text-neutral-900">{totalReserved}</p></div>
        <div className="card p-4"><p className="text-xs text-neutral-500">Available</p><p className="text-xl font-semibold text-success-600">{totalAvailable}</p></div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Overall Campus Occupancy</h3>
        <OccupancyBar occupied={totalOccupied} total={totalSeats} percent={overall} />
      </div>

      <div className="space-y-3">
        {spaces.map((space) => (
          <div key={space.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{space.name}</h3>
                <p className="text-xs text-neutral-500">{space.building} · Floor {space.floor}</p>
              </div>
              <StatusBadge status={space.availability} />
            </div>
            <OccupancyBar occupied={space.occupiedCount} total={space.capacity} percent={space.occupancyPercent} />
            <div className="mt-2 flex gap-4 text-xs text-neutral-500">
              <span>Available: {space.availableCount}</span>
              <span>Reserved: {space.reservedCount}</span>
              <span>Occupied: {space.occupiedCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
