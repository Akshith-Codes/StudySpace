import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, MapPin, Armchair } from 'lucide-react'
import { spaceService } from '../services/spaceService'
import { bookingService } from '../services/bookingService'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Seat from '../components/Seat'
import SeatLegend from '../components/SeatLegend'
import StatusBadge from '../components/StatusBadge'
import QRCodeDisplay from '../components/QRCodeDisplay'
import { formatDate, formatTime } from '../utils/helpers'

const STEPS = ['Select Space', 'Date & Time', 'Select Seat', 'Confirm']

export default function BookingFlow() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [space, setSpace] = useState(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [duration, setDuration] = useState(120)
  const [selectedSeat, setSelectedSeat] = useState(null)
  const [confirmed, setConfirmed] = useState(null)

  useEffect(() => {
    const load = async () => {
      const s = await spaceService.getById(id)
      setSpace(s)
      const preselectedSeatId = searchParams.get('seat')
      if (preselectedSeatId) {
        const seat = s.seats.find((st) => st.id === preselectedSeatId)
        if (seat && seat.state === 'available') {
          setSelectedSeat(seat)
          setStep(2)
        }
      }
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDate(tomorrow.toISOString().slice(0, 10))
      setLoading(false)
    }
    load()
  }, [id])

  const getEndTime = () => {
    const [h, m] = startTime.split(':').map(Number)
    const endMins = h * 60 + m + duration
    const eh = Math.floor(endMins / 60) % 24
    const em = endMins % 60
    return `${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`
  }

  const handleConfirm = async () => {
    const startDate = new Date(`${date}T${startTime}:00`)
    const endDate = new Date(`${date}T${getEndTime()}:00`)
    const booking = await bookingService.create({
      studentId: user.id,
      spaceId: space.id,
      spaceName: space.name,
      building: space.building,
      floor: space.floor,
      seat: selectedSeat.label,
      seatId: selectedSeat.id,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      duration,
    })
    setConfirmed(booking)
    await pushNotification('booking_confirmed', 'Booking Confirmed', `Your seat ${selectedSeat.label} at ${space.name} has been reserved.`)
  }

  if (loading) return <div className="skeleton h-64" />
  if (!space) return <p className="text-sm text-neutral-500">Space not found.</p>

  if (confirmed) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50">
            <Check size={24} className="text-success-600" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Booking Confirmed</h1>
          <p className="mt-1 text-sm text-neutral-500">Your study space has been reserved.</p>
        </div>
        <div className="card p-5 text-left">
          <div className="space-y-2 text-sm">
            <Detail label="Space" value={space.name} />
            <Detail label="Building" value={`${space.building} · Floor ${space.floor}`} />
            <Detail label="Seat" value={confirmed.seat} />
            <Detail label="Date" value={formatDate(confirmed.startTime)} />
            <Detail label="Time" value={`${formatTime(confirmed.startTime)} – ${formatTime(confirmed.endTime)}`} />
            <Detail label="Booking ID" value={confirmed.id.slice(-8).toUpperCase()} />
          </div>
          <div className="mt-4 flex justify-center">
            <QRCodeDisplay value={JSON.stringify({ id: confirmed.id, space: space.name, seat: confirmed.seat, date: confirmed.startTime })} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/bookings" className="btn-secondary flex-1">View Bookings</Link>
          <button onClick={() => { bookingService.cancel(confirmed.id); navigate('/spaces') }} className="btn-ghost text-error-600">Cancel Booking</button>
        </div>
      </div>
    )
  }

  const canProceed = step === 0 || (step === 1 && date && startTime) || (step === 2 && selectedSeat) || step === 3

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to={`/spaces/${space.id}`} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={16} /> Back to space
      </Link>

      {/* Progress */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${i < step ? 'bg-success-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`ml-2 hidden text-xs sm:inline ${i <= step ? 'text-neutral-900 font-medium' : 'text-neutral-400'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className={`mx-2 h-px flex-1 ${i < step ? 'bg-success-400' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="card flex flex-wrap items-center gap-3 p-3 text-xs text-neutral-500">
        <span className="font-medium text-neutral-700">{space.name}</span>
        {date && <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(`${date}T${startTime}:00`)}</span>}
        {startTime && <span className="flex items-center gap-1"><Clock size={12} /> {startTime} – {getEndTime()}</span>}
        {selectedSeat && <span className="flex items-center gap-1"><Armchair size={12} /> {selectedSeat.label}</span>}
      </div>

      {/* Step content */}
      {step === 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Confirm Space</h2>
          <p className="mt-1 text-sm text-neutral-500">You're booking a seat at:</p>
          <div className="mt-3 rounded-lg border border-neutral-200 p-3">
            <p className="text-sm font-medium text-neutral-900">{space.name}</p>
            <p className="text-xs text-neutral-500">{space.building} · Floor {space.floor}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={space.availability} />
              <span className="text-xs text-neutral-500">{space.availableCount} seats available</span>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card space-y-4 p-5">
          <h2 className="text-sm font-semibold text-neutral-900">Select Date & Time</h2>
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} min={new Date().toISOString().slice(0,10)} className="input" />
          </div>
          <div>
            <label className="label">Start Time</label>
            <input type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Duration</label>
            <div className="flex flex-wrap gap-2">
              {[60, 120, 180, 240].map((d) => (
                <button key={d} onClick={()=>setDuration(d)} className={`rounded-lg border px-3 py-1.5 text-xs ${duration===d?'border-primary-500 bg-primary-50 text-primary-700':'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>
                  {d === 60 ? '1 hour' : `${d/60} hours`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Select a Seat</h2>
          <div className="overflow-x-auto">
            <div className="mx-auto inline-block">
              <div className="mb-3 border-t border-dashed border-neutral-300 pt-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Window</div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${space.cols || 4}, minmax(0, 1fr))` }}>
                {space.seats.map((seat) => (
                  <Seat key={seat.id} seat={seat.state === 'available' && selectedSeat?.id === seat.id ? { ...seat, state: 'selected' } : seat} onClick={(s)=>setSelectedSeat(s)} compact />
                ))}
              </div>
              <div className="mt-3 border-b border-dashed border-neutral-300 pb-1 text-center text-2xs uppercase tracking-widest text-neutral-400">Entrance</div>
            </div>
          </div>
          <div className="mt-5"><SeatLegend /></div>
          {selectedSeat && <p className="mt-3 text-xs text-neutral-600">Selected: <span className="font-medium text-primary-600">{selectedSeat.label} ({selectedSeat.type})</span></p>}
        </div>
      )}

      {step === 3 && (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Confirm Booking</h2>
          <div className="space-y-3 text-sm">
            <Detail label="Space" value={space.name} />
            <Detail label="Location" value={`${space.building} · Floor ${space.floor}`} />
            <Detail label="Seat" value={`${selectedSeat.label} (${selectedSeat.type})`} />
            <Detail label="Date" value={formatDate(`${date}T${startTime}:00`)} />
            <Detail label="Time" value={`${startTime} – ${getEndTime()}`} />
            <Detail label="Duration" value={duration === 60 ? '1 hour' : `${duration/60} hours`} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        {step > 0 ? (
          <button onClick={()=>setStep(step-1)} className="btn-secondary"><ArrowLeft size={16} /> Back</button>
        ) : <span />}
        {step < 3 ? (
          <button onClick={()=>canProceed && setStep(step+1)} disabled={!canProceed} className="btn-primary">Next <ArrowRight size={16} /></button>
        ) : (
          <button onClick={handleConfirm} className="btn-primary"><Check size={16} /> Confirm Booking</button>
        )}
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex justify-between border-b border-neutral-100 pb-2 last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  )
}
