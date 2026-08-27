import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { X } from 'lucide-react'
import { spaceService } from '../services/spaceService'
import { CAMPUS_CENTER } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import OccupancyBar from '../components/OccupancyBar'
import Rating from '../components/Rating'
import LoadingState from '../components/LoadingState'

const MARKER_COLORS = {
  Available: '#10b981',
  Moderate: '#f59e0b',
  Crowded: '#ef4444',
  Full: '#737373',
}

function createIcon(color) {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export default function CampusMap() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      const data = await spaceService.getAll()
      setSpaces(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={1} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Campus Map</h1>
        <p className="mt-1 text-sm text-neutral-500">View study spaces and their current availability across campus.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(MARKER_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
            <span className="text-xs text-neutral-600">{status}</span>
          </div>
        ))}
      </div>

      <div className="relative h-[500px] overflow-hidden rounded-xl border border-neutral-200">
        <MapContainer center={CAMPUS_CENTER} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {spaces.map((space) => (
            <Marker
              key={space.id}
              position={space.location}
              icon={createIcon(MARKER_COLORS[space.availability])}
              eventHandlers={{ click: () => setSelected(space) }}
            >
              <Popup>
                <div style={{ minWidth: '180px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px', margin: '0 0 4px 0' }}>{space.name}</p>
                  <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>{space.building} · Floor {space.floor}</p>
                  <p style={{ fontSize: '11px', margin: '0 0 4px 0' }}>{space.occupiedCount}/{space.capacity} seats · {space.occupancyPercent}%</p>
                  <p style={{ fontSize: '11px', margin: '0 0 8px 0' }}>★ {space.rating} · {space.noiseLevel}</p>
                  <Link to={`/spaces/${space.id}`} style={{ color: '#1a4cff', fontSize: '12px', fontWeight: 500 }}>View Space →</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Info panel overlay */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] sm:right-auto sm:w-80">
            <div className="card p-4 shadow-lg">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{selected.name}</h3>
                  <p className="text-xs text-neutral-500">{selected.building} · Floor {selected.floor}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-600"><X size={16} /></button>
              </div>
              <div className="mb-3"><OccupancyBar occupied={selected.occupiedCount} total={selected.capacity} percent={selected.occupancyPercent} /></div>
              <div className="mb-3 flex items-center justify-between">
                <Rating value={selected.rating} count={selected.reviewCount} size={12} />
                <StatusBadge status={selected.availability} />
              </div>
              <div className="flex flex-wrap gap-1">
                {selected.facilities.slice(0, 4).map((f) => <span key={f} className="badge-neutral">{f}</span>)}
              </div>
              <Link to={`/spaces/${selected.id}`} className="btn-primary mt-3 w-full">View Space</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
