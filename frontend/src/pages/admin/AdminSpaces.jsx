import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Ban, Check } from 'lucide-react'
import { spaceService } from '../../services/spaceService'
import StatusBadge from '../../components/StatusBadge'
import OccupancyBar from '../../components/OccupancyBar'
import LoadingState from '../../components/LoadingState'
import Modal from '../../components/Modal'
import { SPACE_TYPES, LOCATIONS, FACILITIES, NOISE_LEVELS } from '../../types/constants'
import { CAMPUS_CENTER } from '../../data/mockData'

export default function AdminSpaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '', building: 'Central Library', floor: 1, type: 'Library',
    capacity: 30, facilities: [], noiseLevel: 'Quiet', openHours: '8:00 AM – 10:00 PM', description: '',
  })

  const load = async () => {
    const data = await spaceService.getAll()
    setSpaces(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', building: 'Central Library', floor: 1, type: 'Library', capacity: 30, facilities: [], noiseLevel: 'Quiet', openHours: '8:00 AM – 10:00 PM', description: '' })
    setShowForm(true)
  }

  const openEdit = (space) => {
    setEditing(space)
    setForm({ name: space.name, building: space.building, floor: space.floor, type: space.type, capacity: space.capacity, facilities: space.facilities, noiseLevel: space.noiseLevel, openHours: space.openHours, description: space.description })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (editing) {
      await spaceService.update(editing.id, form)
    } else {
      const newSpace = await spaceService.create({ ...form, seats: [], rows: 3, cols: 4, occupiedCount: 0, reservedCount: 0, availableCount: form.capacity, occupancyPercent: 0, availability: 'Available', distance: 0.5, rating: 0, reviewCount: 0, location: CAMPUS_CENTER })
      // Generate seats for new space
      const seats = []
      for (let i = 0; i < form.capacity; i++) {
        const row = Math.floor(i / 4)
        const col = i % 4
        seats.push({ id: `seat_${Date.now()}_${i}`, label: String.fromCharCode(65+row)+String(col+1).padStart(2,'0'), type: 'Standard', state: 'available', row, col })
      }
      await spaceService.updateSeats(newSpace.id, seats)
    }
    setShowForm(false)
    load()
  }

  const handleDelete = async (id) => {
    await spaceService.remove(id)
    load()
  }

  const toggleFacility = (f) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f) ? prev.facilities.filter((x) => x !== f) : [...prev.facilities, f],
    }))
  }

  if (loading) return <LoadingState count={4} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Space Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Add, edit, and manage study spaces.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Space</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Building</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Capacity</th>
              <th className="py-2 pr-4 font-medium">Occupancy</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {spaces.map((space) => (
              <tr key={space.id} className="border-b border-neutral-100">
                <td className="py-3 pr-4 font-medium text-neutral-900">{space.name}</td>
                <td className="py-3 pr-4 text-neutral-600">{space.building} · F{space.floor}</td>
                <td className="py-3 pr-4 text-neutral-600">{space.type}</td>
                <td className="py-3 pr-4 text-neutral-600">{space.capacity}</td>
                <td className="py-3 pr-4 w-32"><OccupancyBar occupied={space.occupiedCount} total={space.capacity} percent={space.occupancyPercent} showLabel={false} /></td>
                <td className="py-3 pr-4"><StatusBadge status={space.availability} /></td>
                <td className="py-3 pr-4">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(space)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(space.id)} className="rounded-lg p-1.5 text-error-500 hover:bg-error-50"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Space' : 'Add Space'} size="lg">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="input" placeholder="Central Library — Reading Hall" />
          </div>
          <div>
            <label className="label">Building</label>
            <select value={form.building} onChange={(e)=>setForm({...form, building: e.target.value})} className="input">
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Floor</label>
            <input type="number" value={form.floor} onChange={(e)=>setForm({...form, floor: parseInt(e.target.value)})} className="input" />
          </div>
          <div>
            <label className="label">Type</label>
            <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="input">
              {SPACE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Capacity</label>
            <input type="number" value={form.capacity} onChange={(e)=>setForm({...form, capacity: parseInt(e.target.value)})} className="input" />
          </div>
          <div>
            <label className="label">Noise Level</label>
            <select value={form.noiseLevel} onChange={(e)=>setForm({...form, noiseLevel: e.target.value})} className="input">
              {NOISE_LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Opening Hours</label>
            <input value={form.openHours} onChange={(e)=>setForm({...form, openHours: e.target.value})} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {FACILITIES.map((f) => (
                <button key={f} onClick={() => toggleFacility(f)} className={`rounded-lg border px-3 py-1.5 text-xs ${form.facilities.includes(f)?'border-primary-500 bg-primary-50 text-primary-700':'border-neutral-300 text-neutral-600'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="input min-h-[60px]" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary" disabled={!form.name}>{editing ? 'Save' : 'Create'}</button>
        </div>
      </Modal>
    </div>
  )
}
