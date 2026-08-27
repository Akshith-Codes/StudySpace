const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'department', 'year', 'preferences'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');

  return success(res, 200, 'Profile updated', { user: user.toSafeObject() });
});

const getProfile = asyncHandler(async (req, res) => {
  return success(res, 200, 'Profile fetched', { user: req.user.toSafeObject() });
});

module.exports = { updateProfile, getProfile };
