import { useState, useEffect } from 'react'
import { reviewService } from '../../services/reviewService'
import Rating from '../../components/Rating'
import LoadingState from '../../components/LoadingState'
import { RATING_CATEGORIES } from '../../types/constants'
import { formatDate } from '../../utils/helpers'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await reviewService.getAll()
      setReviews(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={3} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Reviews</h1>
        <p className="mt-1 text-sm text-neutral-500">All student reviews across study spaces.</p>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-900">{review.studentName}</p>
                <p className="text-xs text-neutral-400">{formatDate(review.date)}</p>
              </div>
              <Rating value={review.ratings.Overall} size={14} />
            </div>
            <div className="mb-2 flex flex-wrap gap-3">
              {RATING_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500">{cat}</span>
                  <span className="text-xs font-medium text-neutral-700">{review.ratings[cat]}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
