// Configurable priority scoring used by recommendations/booking context.
// Keeping this isolated means new priority rules can be added without
// touching controllers.

const YEAR_WEIGHTS = {
  '4th Year': 10,
  '3rd Year': 7,
  '2nd Year': 4,
  '1st Year': 2,
};

const EXAM_PROXIMITY_BRACKETS = [
  { withinDays: 1, score: 25 },
  { withinDays: 3, score: 18 },
  { withinDays: 7, score: 12 },
  { withinDays: 14, score: 6 },
];

/**
 * Calculates an exam-proximity score based on the closest upcoming exam.
 * @param {Array<{examDate: Date}>} exams
 * @param {Date} now
 */
function examProximityScore(exams = [], now = new Date()) {
  if (!exams.length) return 0;
  const upcoming = exams
    .map((e) => new Date(e.examDate))
    .filter((d) => d.getTime() >= now.getTime())
    .sort((a, b) => a - b);
  if (!upcoming.length) return 0;
  const diffDays = (upcoming[0] - now) / (1000 * 60 * 60 * 24);
  for (const bracket of EXAM_PROXIMITY_BRACKETS) {
    if (diffDays <= bracket.withinDays) return bracket.score;
  }
  return 2; // exam exists but far away
}

/**
 * Calculates a year-based score using the authenticated user's stored year.
 * @param {string} year
 */
function yearScore(year) {
  return YEAR_WEIGHTS[year] ?? 0;
}

/**
 * Combined priority score. Higher = more priority.
 * @param {{ user: object, exams: Array }} ctx
 */
function calculatePriority({ user, exams = [], now = new Date() } = {}) {
  const examScore = examProximityScore(exams, now);
  const yScore = yearScore(user?.year);
  const total = examScore + yScore;
  return {
    total,
    breakdown: {
      examProximityScore: examScore,
      yearScore: yScore,
    },
  };
}

module.exports = { calculatePriority, examProximityScore, yearScore };
