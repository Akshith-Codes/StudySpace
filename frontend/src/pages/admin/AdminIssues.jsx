import { useState, useEffect } from 'react'
import { issueService } from '../../services/issueService'
import StatusBadge from '../../components/StatusBadge'
import LoadingState from '../../components/LoadingState'
import { ISSUE_STATUSES } from '../../types/constants'
import { formatDate } from '../../utils/helpers'

export default function AdminIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const data = await issueService.getAll()
    setIssues(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id, status) => {
    await issueService.updateStatus(id, status)
    load()
  }

  if (loading) return <LoadingState count={3} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Issue Management</h1>
        <p className="mt-1 text-sm text-neutral-500">Review and resolve reported issues.</p>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">{issue.type}</h3>
                <p className="mt-0.5 text-xs text-neutral-500">{issue.spaceName} · Seat {issue.seat || 'N/A'}</p>
                <p className="mt-1 text-xs text-neutral-500">Reported by {issue.studentName} on {formatDate(issue.createdAt)}</p>
              </div>
              <StatusBadge status={issue.status} />
            </div>
            <p className="mt-2 text-sm text-neutral-600">{issue.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-neutral-500">Update status:</span>
              {ISSUE_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(issue.id, status)}
                  className={`rounded-lg border px-3 py-1 text-xs ${issue.status===status?'border-primary-500 bg-primary-50 text-primary-700':'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
