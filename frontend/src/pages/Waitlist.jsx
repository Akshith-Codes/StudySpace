import { useState, useEffect } from 'react'
import { Clock, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { waitlistService } from '../services/waitlistService'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'

export default function Waitlist() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await waitlistService.getByStudent(user.id)
    setEntries(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  const handleLeave = async (id) => {
    await waitlistService.leave(id)
    load()
  }

  if (loading) return <LoadingState count={2} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Waitlist</h1>
        <p className="mt-1 text-sm text-neutral-500">Spaces you're waiting for.</p>
      </div>

      {entries.length === 0 ? (
        <div className="card p-5">
          <EmptyState icon={Clock} title="Not on any waitlists" message="When a space is full, you can join its waitlist to be notified when a seat opens up." />
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{entry.spaceName}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                    <Users size={12} /> You are #{entry.position} in the waitlist
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Estimated availability: ~{entry.position * 15} minutes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status === 'notified' ? 'notified' : 'waiting'} label={entry.status === 'notified' ? 'Seat Available' : 'Waiting'} />
                  <button onClick={() => handleLeave(entry.id)} className="text-neutral-400 hover:text-error-600"><X size={16} /></button>
                </div>
              </div>
              {entry.status === 'notified' && (
                <div className="mt-3 rounded-lg bg-success-50 border border-success-200 px-3 py-2">
                  <p className="text-xs text-success-700">A seat is available. You have 10 minutes to claim it.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
