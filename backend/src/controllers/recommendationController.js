const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { getRecommendations } = require('../services/recommendationService');

const getMyRecommendations = asyncHandler(async (req, res) => {
  const { facilities, lat, lng } = req.query;
  const requestedFacilities = facilities ? facilities.split(',') : undefined;
  const userLocation = lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : undefined;

  const recommendations = await getRecommendations({
    user: req.user,
    requestedFacilities,
    userLocation,
  });

  return success(res, 200, 'Recommendations generated', {
    data: recommendations.map((r) => ({
      space: r.space,
      matchScore: r.matchScore,
      reasons: r.reasons,
      occupancy: r.occupancy,
    })),
  });
});

module.exports = { getMyRecommendations };
