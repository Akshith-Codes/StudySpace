const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { getSpaceOccupancy } = require('../services/occupancyService');

// GET /api/spaces  (search, filter, sort, paginate)
const getSpaces = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    type,
    facilities,
    noiseLevel,
    minRating,
    availability,
    sort,
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (location) query.building = location;
  if (type) query.type = type;
  if (noiseLevel) query.noiseLevel = noiseLevel;
  if (minRating) query.rating = { $gte: Number(minRating) };
  if (facilities) {
    const facilityList = Array.isArray(facilities) ? facilities : facilities.split(',');
    query.facilities = { $all: facilityList };
  }

  const sortMap = {
    rating: { rating: -1 },
    name: { name: 1 },
    newest: { createdAt: -1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));

  const [spaces, total] = await Promise.all([
    StudySpace.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    StudySpace.countDocuments(query),
  ]);

  let enriched = spaces;
  if (availability) {
    const occupancies = await Promise.all(spaces.map((s) => getSpaceOccupancy(s._id)));
    enriched = spaces
      .map((s, i) => ({ ...s, occupancy: occupancies[i] }))
      .filter((s) => s.occupancy.status === availability);
  } else {
    const occupancies = await Promise.all(spaces.map((s) => getSpaceOccupancy(s._id)));
    enriched = spaces.map((s, i) => ({ ...s, occupancy: occupancies[i] }));
  }

  return success(res, 200, 'Study spaces fetched', {
    data: enriched,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

const getSpaceById = asyncHandler(async (req, res) => {
  const space = await StudySpace.findById(req.params.id).lean();
  if (!space) throw new ApiError(404, 'Study space not found');
  const occupancy = await getSpaceOccupancy(space._id);
  return success(res, 200, 'Study space fetched', { space: { ...space, occupancy } });
});

const createSpace = asyncHandler(async (req, res) => {
  const space = await StudySpace.create(req.body);
  return success(res, 201, 'Study space created', { space });
});

const updateSpace = asyncHandler(async (req, res) => {
  const space = await StudySpace.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!space) throw new ApiError(404, 'Study space not found');
  return success(res, 200, 'Study space updated', { space });
});

const deleteSpace = asyncHandler(async (req, res) => {
  const space = await StudySpace.findByIdAndDelete(req.params.id);
  if (!space) throw new ApiError(404, 'Study space not found');
  await Seat.deleteMany({ space: space._id });
  return success(res, 200, 'Study space deleted', {});
});

// GET /api/spaces/map — lightweight data for map markers
const getSpacesMap = asyncHandler(async (req, res) => {
  const spaces = await StudySpace.find({ status: 'active' })
    .select('name location rating')
    .lean();

  const results = await Promise.all(
    spaces.map(async (s) => {
      const occupancy = await getSpaceOccupancy(s._id);
      return {
        id: s._id,
        name: s.name,
        latitude: s.location?.latitude,
        longitude: s.location?.longitude,
        availability: occupancy.status,
        occupancy: occupancy.percentage,
        rating: s.rating,
      };
    })
  );

  return success(res, 200, 'Map data fetched', { data: results });
});

module.exports = {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpacesMap,
};
