const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, department, year, preferences } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    studentId,
    department,
    year,
    preferences,
    role: 'student',
  });

  const token = generateToken(user._id, user.role);
  return success(res, 201, 'Registration successful', { token, user: user.toSafeObject() });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const token = generateToken(user._id, user.role);
  return success(res, 200, 'Login successful', {
    token,
    user: user.toSafeObject(),
    role: user.role,
  });
});

const getMe = asyncHandler(async (req, res) => {
  return success(res, 200, 'Current user fetched', { user: req.user.toSafeObject() });
});

const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: logout is handled client-side by discarding the token.
  return success(res, 200, 'Logged out successfully', {});
});

module.exports = { register, login, getMe, logout };
