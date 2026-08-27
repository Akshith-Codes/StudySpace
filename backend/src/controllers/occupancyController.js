const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { getAllOccupancy, getSpaceOccupancy } = require('../services/occupancyService');
const StudySpace = require('../models/StudySpace');

const getOccupancyOverview = asyncHandler(async (req, res) => {
  const data = await getAllOccupancy();
  return success(res, 200, 'Occupancy overview fetched', { data });
});

const getOccupancyForSpace = asyncHandler(async (req, res) => {
  const space = await StudySpace.findById(req.params.spaceId);
  if (!space) throw new ApiError(404, 'Study space not found');
  const occupancy = await getSpaceOccupancy(space._id);
  return success(res, 200, 'Occupancy fetched', occupancy);
});

module.exports = { getOccupancyOverview, getOccupancyForSpace };
