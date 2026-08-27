const StudySpace = require('../models/StudySpace');
const Exam = require('../models/Exam');
const { getSpaceOccupancy } = require('./occupancyService');
const { calculatePriority } = require('../utils/priorityCalculator');

const DEFAULT_WEIGHTS = {
  quietness: 30,
  availability: 25,
  facilities: 20,
  distance: 15,
  rating: 10,
};

const NOISE_SCORE = { silent: 100, quiet: 75, moderate: 40 };
const AVAILABILITY_SCORE = { available: 100, moderate: 70, crowded: 30, full: 0 };

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (!total) return DEFAULT_WEIGHTS;
  const normalized = {};
  Object.entries(weights).forEach(([key, val]) => {
    normalized[key] = (val / total) * 100;
  });
  return normalized;
}

// Haversine distance in km between two lat/lng points.
function distanceKm(a, b) {
  if (!a || !b || a.latitude == null || b.latitude == null) return 0.5; // neutral default
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

function scoreSpace({ space, occupancy, weights, userLocation, requestedFacilities, priorityBonus }) {
  const normWeights = normalizeWeights(weights);
  const reasons = [];
  let score = 0;

  const quietnessScore = NOISE_SCORE[space.noiseLevel] ?? 50;
  score += (quietnessScore * normWeights.quietness) / 100;
  if (quietnessScore >= 75) reasons.push('Quiet environment');

  const availabilityScore = AVAILABILITY_SCORE[occupancy.status] ?? 50;
  score += (availabilityScore * normWeights.availability) / 100;
  if (availabilityScore >= 70) reasons.push('High current availability');

  let facilitiesScore = 50;
  if (requestedFacilities && requestedFacilities.length) {
    const matched = requestedFacilities.filter((f) => space.facilities.includes(f));
    facilitiesScore = (matched.length / requestedFacilities.length) * 100;
    matched.forEach((f) => reasons.push(`${f} available`));
  } else if (space.facilities.length) {
    facilitiesScore = Math.min(100, space.facilities.length * 20);
  }
  score += (facilitiesScore * normWeights.facilities) / 100;

  const dist = distanceKm(userLocation, space.location);
  const distanceScore = Math.max(0, 100 - dist * 20);
  score += (distanceScore * normWeights.distance) / 100;
  if (distanceScore >= 70) reasons.push('Close to your location');

  const ratingScore = (space.rating / 5) * 100;
  score += (ratingScore * normWeights.rating) / 100;
  if (space.rating >= 4) reasons.push('Highly rated by students');

  score += priorityBonus || 0;

  return { score: Math.min(99, Math.round(score)), reasons };
}

async function getRecommendations({ user, weights, requestedFacilities, userLocation } = {}) {
  const spaces = await StudySpace.find({ status: 'active' }).lean();

  const exams = user ? await Exam.find({ user: user._id, examDate: { $gte: new Date() } }).lean() : [];
  const priority = user ? calculatePriority({ user, exams }) : { total: 0 };

  const results = await Promise.all(
    spaces.map(async (space) => {
      const occupancy = await getSpaceOccupancy(space._id);
      const { score, reasons } = scoreSpace({
        space,
        occupancy,
        weights: weights || (user && user.preferences) || DEFAULT_WEIGHTS,
        userLocation,
        requestedFacilities,
        priorityBonus: priority.total ? Math.min(5, priority.total / 5) : 0,
      });
      return {
        space,
        occupancy,
        matchScore: score,
        reasons: reasons.slice(0, 5),
      };
    })
  );

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { getRecommendations, scoreSpace, DEFAULT_WEIGHTS };
