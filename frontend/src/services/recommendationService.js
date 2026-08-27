// Recommendation engine — frontend weighted scoring algorithm.
// Modular and replaceable with an AI/ML backend later.

import { spaceService } from './spaceService'

const DEFAULT_WEIGHTS = {
  quietness: 30,
  availability: 25,
  facilities: 20,
  distance: 15,
  rating: 10,
}

const NOISE_SCORE = {
  Silent: 100,
  Quiet: 75,
  Moderate: 40,
}

const AVAILABILITY_SCORE = {
  Available: 100,
  Moderate: 70,
  Crowded: 30,
  Full: 0,
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (total === 0) return DEFAULT_WEIGHTS
  const normalized = {}
  for (const [key, val] of Object.entries(weights)) {
    normalized[key] = (val / total) * 100
  }
  return normalized
}

function scoreSpace(space, preferences, options = {}) {
  const weights = normalizeWeights(preferences || DEFAULT_WEIGHTS)
  let score = 0
  let breakdown = {}

  // Quietness score
  const quietnessScore = NOISE_SCORE[space.noiseLevel] || 50
  breakdown.quietness = quietnessScore
  score += (quietnessScore * weights.quietness) / 100

  // Availability score
  const availabilityScore = AVAILABILITY_SCORE[space.availability] || 50
  breakdown.availability = availabilityScore
  score += (availabilityScore * weights.availability) / 100

  // Facilities score
  const requestedFacilities = options.facilities || []
  let facilitiesScore = 50
  if (requestedFacilities.length > 0) {
    const matched = requestedFacilities.filter((f) => space.facilities.includes(f)).length
    facilitiesScore = (matched / requestedFacilities.length) * 100
  }
  breakdown.facilities = facilitiesScore
  score += (facilitiesScore * weights.facilities) / 100

  // Distance score (closer = higher score)
  const maxDistance = 1.0
  const distanceScore = Math.max(0, 100 - (space.distance / maxDistance) * 100)
  breakdown.distance = distanceScore
  score += (distanceScore * weights.distance) / 100

  // Rating score
  const ratingScore = (space.rating / 5) * 100
  breakdown.rating = ratingScore
  score += (ratingScore * weights.rating) / 100

  // Study style bonus
  if (options.studyStyle === 'Individual' && space.type === 'Individual Cabin') score += 3
  if (options.studyStyle === 'Group' && (space.type === 'Discussion Room' || space.facilities.includes('Group study'))) score += 3

  // Exam priority bonus
  if (options.hasUpcomingExam) score += 2

  // Year-based priority
  if (options.year === '4th Year') score += 1
  else if (options.year === '3rd Year') score += 0.5

  return {
    score: Math.min(99, Math.round(score)),
    breakdown,
  }
}

export const recommendationService = {
  async getRecommendations(preferences, options = {}) {
    await new Promise((r) => setTimeout(r, 400))
    const spaces = spaceService.getAllSync()
    const scored = spaces.map((space) => {
      const result = scoreSpace(space, preferences, options)
      return { ...space, matchScore: result.score, matchBreakdown: result.breakdown }
    })
    return scored.sort((a, b) => b.matchScore - a.matchScore)
  },

  scoreSpace,

  getDefaults() {
    return DEFAULT_WEIGHTS
  },
}
