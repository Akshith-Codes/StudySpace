import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, SlidersHorizontal, BookOpen, Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { recommendationService } from '../services/recommendationService'
import { examService } from '../services/examService'
import StatusBadge from '../components/StatusBadge'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import { formatDate } from '../utils/helpers'

const PREF_LABELS = {
  quietness: 'Quietness',
  availability: 'Availability',
  facilities: 'Facilities',
  distance: 'Distance',
  rating: 'Rating',
}

export default function Recommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState(user.preferences)
  const [exams, setExams] = useState([])
  const [showPrefs, setShowPrefs] = useState(false)
  const [showAddExam, setShowAddExam] = useState(false)
  const [newExam, setNewExam] = useState({ subject: '', date: '' })

  const load = async () => {
    setLoading(true)
    const examData = await examService.getByStudent(user.id)
    setExams(examData)
    const hasUpcomingExam = examData.some((e) => new Date(e.date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    const recs = await recommendationService.getRecommendations(preferences, {
      facilities: user.favoriteFacilities,
      studyStyle: user.studyStyle,
      year: user.year,
      hasUpcomingExam,
    })
    setRecommendations(recs)
    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  const handlePrefChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: parseInt(value) }))
  }

  const applyPreferences = () => {
    setShowPrefs(false)
    load()
  }

  const handleAddExam = async () => {
    if (!newExam.subject || !newExam.date) return
    await examService.create({ studentId: user.id, ...newExam })
    setNewExam({ subject: '', date: '' })
    setShowAddExam(false)
    load()
  }

  const handleRemoveExam = async (id) => {
    await examService.remove(id)
    load()
  }

  const hasUpcomingExam = exams.some((e) => new Date(e.date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Recommended For You</h1>
          <p className="mt-1 text-sm text-neutral-500">Based on your preferences and study habits.</p>
        </div>
        <button onClick={() => setShowPrefs(true)} className="btn-secondary"><SlidersHorizontal size={16} /> Preferences</button>
      </div>

      {hasUpcomingExam && (
        <div className="flex items-center gap-2 rounded-lg bg-primary-50 border border-primary-200 px-4 py-2">
          <BookOpen size={16} className="text-primary-600" />
          <p className="text-sm text-primary-700">Exam Priority Active — Recommendations weighted toward focused study spaces.</p>
        </div>
      )}

      {/* Upcoming exams */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Upcoming Exams</h2>
          <button onClick={() => setShowAddExam(true)} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Plus size={12} /> Add Exam</button>
        </div>
        {exams.length === 0 ? (
          <p className="text-sm text-neutral-500">No exams added. Adding upcoming exams helps improve recommendations.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5">
                <span className="text-xs font-medium text-neutral-700">{exam.subject}</span>
                <span className="text-xs text-neutral-400">{formatDate(exam.date)}</span>
                <button onClick={() => handleRemoveExam(exam.id)} className="text-neutral-300 hover:text-error-600"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <LoadingState /> : (
        <div className="space-y-3">
          {recommendations.map((space, idx) => (
            <div key={space.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {idx === 0 && <span className="badge-primary">Best match</span>}
                    <span className="text-xs font-medium text-primary-600">{space.matchScore}% match</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-neutral-900">{space.name}</h3>
                  <p className="text-xs text-neutral-500">{space.building} · Floor {space.floor}</p>
                </div>
                <StatusBadge status={space.availability} />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {Object.entries(space.matchBreakdown).map(([key, score]) => (
                  <div key={key}>
                    <p className="text-2xs text-neutral-400">{PREF_LABELS[key] || key}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div className="h-full rounded-full bg-primary-400" style={{ width: `${score}%` }} />
                    </div>
                    <p className="mt-0.5 text-2xs text-neutral-500">{Math.round(score)}%</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {space.facilities.slice(0, 4).map((f) => <span key={f} className="badge-neutral">{f}</span>)}
                </div>
                <Link to={`/spaces/${space.id}`} className="btn-secondary">View Space</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preferences modal */}
      <Modal open={showPrefs} onClose={() => setShowPrefs(false)} title="Adjust Preferences">
        <p className="mb-4 text-sm text-neutral-500">Set the weight for each factor. Values should total 100%.</p>
        <div className="space-y-4">
          {Object.entries(preferences).map(([key, val]) => (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">{PREF_LABELS[key] || key}</label>
                <span className="text-xs text-neutral-500">{val}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={val} onChange={(e)=>handlePrefChange(key, e.target.value)} className="w-full accent-primary-600" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowPrefs(false)} className="btn-secondary">Cancel</button>
          <button onClick={applyPreferences} className="btn-primary">Apply</button>
        </div>
      </Modal>

      {/* Add exam modal */}
      <Modal open={showAddExam} onClose={() => setShowAddExam(false)} title="Add Upcoming Exam">
        <div className="space-y-4">
          <div>
            <label className="label">Subject</label>
            <input value={newExam.subject} onChange={(e)=>setNewExam({...newExam, subject: e.target.value})} className="input" placeholder="Data Structures" />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" value={newExam.date} onChange={(e)=>setNewExam({...newExam, date: e.target.value})} className="input" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowAddExam(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAddExam} className="btn-primary">Add Exam</button>
        </div>
      </Modal>
    </div>
  )
}
