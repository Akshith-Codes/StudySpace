import { useState, useEffect } from 'react'
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { bookingService } from '../services/bookingService'
import { reviewService } from '../services/reviewService'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import Modal from '../components/Modal'
import { RATING_CATEGORIES } from '../types/constants'
import { formatDate } from '../utils/helpers'

export default function Reviews() {
  const { user } = useAuth()
  const { pushNotification } = useApp()
  const [completedBookings, setCompletedBookings] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReview, setShowReview] = useState(null)
  const [ratings, setRatings] = useState({})
  const [comment, setComment] = useState('')

  const load = async () => {
    const [bookings, allReviews] = await Promise.all([
      bookingService.getByStudent(user.id),
      reviewService.getAll(),
    ])
    setCompletedBookings(bookings.filter((b) => b.status === 'Completed'))
    setReviews(allReviews.filter((r) => r.studentId === user.id))
    setLoading(false)
  }

  useEffect(() => { load() }, [user.id])

  const openReview = (booking) => {
    const init = {}
    RATING_CATEGORIES.forEach((c) => { init[c] = 5 })
    setRatings(init)
    setComment('')
    setShowReview(booking)
  }

  const handleSubmit = async () => {
    await reviewService.create({
      spaceId: showReview.spaceId,
      studentId: user.id,
      studentName: user.name,
      ratings,
      comment,
    })
    await pushNotification('review_submitted', 'Review Submitted', `Thank you for reviewing ${showReview.spaceName}.`)
    setShowReview(null)
    load()
  }

  if (loading) return <LoadingState count={2} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reviews</h1>
        <p className="mt-1 text-sm text-neutral-500">Rate and review spaces you've used.</p>
      </div>

      {/* Pending reviews */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Pending Reviews</h2>
        {completedBookings.length === 0 ? (
          <div className="card p-5"><EmptyState icon={Star} title="No pending reviews" message="Complete a booking to leave a review." /></div>
        ) : (
          <div className="space-y-2">
            {completedBookings.map((b) => (
              <div key={b.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{b.spaceName}</p>
                  <p className="text-xs text-neutral-500">Seat {b.seat} · {formatDate(b.startTime)}</p>
                </div>
                <button onClick={() => openReview(b)} className="btn-primary">Review</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submitted reviews */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Your Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">You haven't submitted any reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">{review.spaceId}</p>
                  <span className="text-xs text-neutral-400">{formatDate(review.date)}</span>
                </div>
                <div className="mb-2 flex flex-wrap gap-3">
                  {RATING_CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center gap-1">
                      <span className="text-xs text-neutral-500">{cat}</span>
                      <span className="flex items-center gap-0.5">
                        {Array.from({length:5}).map((_,i) => (
                          <Star key={i} size={10} className={i < review.ratings[cat] ? 'fill-warning-400 text-warning-400' : 'text-neutral-200'} />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      <Modal open={!!showReview} onClose={() => setShowReview(null)} title={`Review ${showReview?.spaceName || ''}`} size="lg">
        <div className="space-y-4">
          {RATING_CATEGORIES.map((cat) => (
            <div key={cat}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">{cat}</label>
                <span className="text-xs text-neutral-500">{ratings[cat] || 0}/5</span>
              </div>
              <div className="flex gap-1">
                {Array.from({length:5}).map((_,i) => (
                  <button key={i} onClick={() => setRatings({...ratings, [cat]: i+1})}>
                    <Star size={20} className={i < (ratings[cat]||0) ? 'fill-warning-400 text-warning-400' : 'text-neutral-300 hover:text-neutral-400'} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <label className="label">Comment</label>
            <textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="input min-h-[80px]" placeholder="Share your experience..." />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowReview(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary">Submit Review</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
