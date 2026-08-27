import { useState, useEffect } from 'react'
import { AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { issueService } from '../services/issueService'
import { spaceService } from '../services/spaceService'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import { ISSUE_TYPES } from '../types/constants'
import { formatDate } from '../utils/helpers'

export default function Issues() {
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [issues, setIssues] = useState([])
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: ISSUE_TYPES[0], description: '', spaceId: '', seat: '' })

  const load = async () => {
    const [issueData, spaceData] = await Promise.all([
      issueService.getByStudent(user.id),
      spaceService.getAll(),
    ])
    setIssues(issueData)
    setSpaces(spaceData)
    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  const handleSubmit = async () => {
    if (!form.description || !form.spaceId) return
    const space = spaces.find((s) => s.id === form.spaceId)
    await issueService.create({
      ...form,
      studentId: user.id,
      studentName: user.name,
      spaceName: space.name,
    })
    await pushNotification('issue_submitted', 'Issue Submitted', `Your ${form.type} report for ${space.name} has been submitted.`)
    setShowForm(false)
    setForm({ type: ISSUE_TYPES[0], description: '', spaceId: '', seat: '' })
    load()
  }

  if (loading) return <LoadingState count={2} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Issues</h1>
          <p className="mt-1 text-sm text-neutral-500">Report and track problems with study spaces.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16} /> Report Issue</button>
      </div>

      {issues.length === 0 ? (
        <div className="card p-5"><EmptyState icon={AlertCircle} title="No issues reported" message="Report a problem with a study space and track its status here." /></div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{issue.type}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500">{issue.spaceName} · Seat {issue.seat || 'N/A'}</p>
                </div>
                <StatusBadge status={issue.status} />
              </div>
              <p className="mt-2 text-sm text-neutral-600">{issue.description}</p>
              <p className="mt-2 text-xs text-neutral-400">Reported on {formatDate(issue.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Report an Issue">
        <div className="space-y-4">
          <div>
            <label className="label">Issue Type</label>
            <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="input">
              {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Space</label>
            <select value={form.spaceId} onChange={(e)=>setForm({...form, spaceId: e.target.value})} className="input">
              <option value="">Select a space</option>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Seat (optional)</label>
            <input value={form.seat} onChange={(e)=>setForm({...form, seat: e.target.value})} className="input" placeholder="A05" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="input min-h-[80px]" placeholder="Describe the issue..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary" disabled={!form.description || !form.spaceId}>Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
