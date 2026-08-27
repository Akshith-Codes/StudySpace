import { mockReviews } from '../data/mockData'

const REVIEWS_KEY = 'studyspace_reviews'

function getReviews() {
  const stored = localStorage.getItem(REVIEWS_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(mockReviews))
  return mockReviews
}

function saveReviews(reviews) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews))
}

export const reviewService = {
  async getBySpace(spaceId) {
    await new Promise((r) => setTimeout(r, 200))
    return getReviews().filter((r) => r.spaceId === spaceId)
  },

  async getAll() {
    await new Promise((r) => setTimeout(r, 200))
    return getReviews()
  },

  async create(data) {
    const reviews = getReviews()
    const review = {
      id: `rev_${Date.now()}`,
      date: new Date().toISOString(),
      ...data,
    }
    reviews.push(review)
    saveReviews(reviews)
    return review
  },
}
