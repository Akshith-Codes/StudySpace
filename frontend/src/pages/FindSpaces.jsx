import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { spaceService } from '../services/spaceService'
import SpaceCard from '../components/SpaceCard'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { LOCATIONS, SPACE_TYPES, FACILITIES, AVAILABILITY_LEVELS, NOISE_LEVELS } from '../types/constants'

const SORT_OPTIONS = [
  { value: 'recommendation', label: 'Recommendation' },
  { value: 'availability', label: 'Availability' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
  { value: 'quietness', label: 'Quietness' },
]

const NOISE_RANK = { Silent: 1, Quiet: 2, Moderate: 3 }
const AVAIL_RANK = { Available: 1, Moderate: 2, Crowded: 3, Full: 4 }

export default function FindSpaces() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('recommendation')
  const [filters, setFilters] = useState({
    locations: [],
    types: [],
    facilities: [],
    availability: [],
    noise: [],
  })

  const loadSpaces = async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await spaceService.getAll()
      setSpaces(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSpaces() }, [])

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const list = prev[category]
      return {
        ...prev,
        [category]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      }
    })
  }

  const clearFilters = () => setFilters({ locations: [], types: [], facilities: [], availability: [], noise: [] })

  const activeFilterCount = Object.values(filters).flat().length

  const filtered = useMemo(() => {
    let result = spaces.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.building.toLowerCase().includes(search.toLowerCase())) return false
      if (filters.locations.length && !filters.locations.includes(s.building)) return false
      if (filters.types.length && !filters.types.includes(s.type)) return false
      if (filters.facilities.length && !filters.facilities.every((f) => s.facilities.includes(f))) return false
      if (filters.availability.length && !filters.availability.includes(s.availability)) return false
      if (filters.noise.length && !filters.noise.includes(s.noiseLevel)) return false
      return true
    })

    result.sort((a, b) => {
      switch (sort) {
        case 'availability': return AVAIL_RANK[a.availability] - AVAIL_RANK[b.availability]
        case 'rating': return b.rating - a.rating
        case 'distance': return a.distance - b.distance
        case 'quietness': return NOISE_RANK[a.noiseLevel] - NOISE_RANK[b.noiseLevel]
        default: return b.rating - a.rating
      }
    })
    return result
  }, [spaces, search, filters, sort])

  const handleBook = (space) => navigate(`/spaces/${space.id}`)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Find a Space</h1>
        <p className="mt-1 text-sm text-neutral-500">Search and filter study spaces across campus.</p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} className="input pl-9" placeholder="Search study spaces..." />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary relative">
          <SlidersHorizontal size={16} /> Filters
          {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-2xs text-white">{activeFilterCount}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">Filters</h3>
            <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">Clear all</button>
          </div>
          <div className="space-y-4">
            <FilterGroup label="Location" options={LOCATIONS} selected={filters.locations} onToggle={(v)=>toggleFilter('locations',v)} />
            <FilterGroup label="Space Type" options={SPACE_TYPES} selected={filters.types} onToggle={(v)=>toggleFilter('types',v)} />
            <FilterGroup label="Facilities" options={FACILITIES} selected={filters.facilities} onToggle={(v)=>toggleFilter('facilities',v)} />
            <FilterGroup label="Availability" options={AVAILABILITY_LEVELS} selected={filters.availability} onToggle={(v)=>toggleFilter('availability',v)} />
            <FilterGroup label="Noise" options={NOISE_LEVELS} selected={filters.noise} onToggle={(v)=>toggleFilter('noise',v)} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">{filtered.length} spaces found</p>
        <select value={sort} onChange={(e)=>setSort(e.target.value)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700">
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingState /> :
       error ? <ErrorState message="Unable to load study spaces." onRetry={loadSpaces} /> :
       filtered.length === 0 ? (
         <div className="card p-5">
           <EmptyState icon={Search} title="No spaces found" message="Try adjusting your filters or search query." action={<button onClick={clearFilters} className="btn-secondary">Clear Filters</button>} />
         </div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {filtered.map((space) => <SpaceCard key={space.id} space={space} onBook={handleBook} />)}
         </div>
       )}
    </div>
  )
}

function FilterGroup({ label, options, selected, onToggle }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              selected.includes(opt)
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
