import { useState, useEffect } from 'react'
import { spaceService } from '../../services/spaceService'
import Seat from '../../components/Seat'
import SeatLegend from '../../components/SeatLegend'
import { SEAT_TYPES } from '../../types/constants'
import LoadingState from '../../components/LoadingState'

export default function AdminSeats() {
  const [spaces, setSpaces] = useState([])
  const [selectedSpaceId, setSelectedSpaceId] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingSeat, setEditingSeat] = useState(null)

  const load = async () => {
    const data = await spaceService.getAll()
    setSpaces(data)
    if (data.length > 0 && !selectedSpaceId) setSelectedSpaceId(data[0].id)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const selectedSpace = spaces.find((s) => s.id === selectedSpaceId)

  const handleSeatStateChange = async (seatId, newState) => {
    await spaceService.updateSeatState(selectedSpaceId, seatId, newState)
    load()
  }

  const handleSeatTypeChange = async (seatId, newType) => {
    const space = spaces.find((s) => s.id === selectedSpaceId)
    const updatedSeats = space.seats.map((s) => s.id === seatId ? { ...s, type: newType } : s)
    await spaceService.updateSeats(selectedSpaceId, updatedSeats)
    load()
  }

  if (loading) return <LoadingState count={2} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Seat Management</h1>
        <p className="mt-1 text-sm text-neutral-500">Configure seating layouts and manage individual seats.</p>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-neutral-500">Space:</label>
        <select value={selectedSpaceId} onChange={(e)=>setSelectedSpaceId(e.target.value)} className="input max-w-xs">
          {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {selectedSpace && (
        <>
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">{selectedSpace.name}</h3>
              <div className="flex gap-3 text-xs">
                <span className="text-neutral-500">Total: {selectedSpace.seats.length}</span>
                <span className="text-success-600">Available: {selectedSpace.availableCount}</span>
                <span className="text-warning-600">Reserved: {selectedSpace.reservedCount}</span>
                <span className="text-neutral-700">Occupied: {selectedSpace.occupiedCount}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="mx-auto inline-block">
                <div className="mb-3 border-t border-dashed border-neutral-300 pt-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Window</div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedSpace.cols || 4}, minmax(0, 1fr))` }}>
                  {selectedSpace.seats.map((seat) => (
                    <div key={seat.id} className="space-y-1">
                      <Seat seat={seat} compact />
                      <select
                        value={seat.state}
                        onChange={(e) => handleSeatStateChange(seat.id, e.target.value)}
                        className="w-full rounded border border-neutral-200 px-1 py-0.5 text-2xs"
                      >
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="occupied">Occupied</option>
                        <option value="disabled">Disabled</option>
                      </select>
                      <select
                        value={seat.type}
                        onChange={(e) => handleSeatTypeChange(seat.id, e.target.value)}
                        className="w-full rounded border border-neutral-200 px-1 py-0.5 text-2xs"
                      >
                        {SEAT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-b border-dashed border-neutral-300 pb-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Entrance</div>
              </div>
            </div>
          </div>

          <div className="card p-5"><SeatLegend /></div>
        </>
      )}
    </div>
  )
}
