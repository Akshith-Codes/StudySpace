const User = require('../models/User');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Issue = require('../models/Issue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { getAllOccupancy } = require('../services/occupancyService');
const { getFullAnalytics, getNoShowRate } = require('../services/analyticsService');

const getDashboard = asyncHandler(async (req, res) => {
  const [totalStudents, totalSpaces, totalSeats, activeBookings, issuesOpen] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    StudySpace.countDocuments(),
    Seat.countDocuments(),
    Booking.countDocuments({ status: 'active' }),
    Issue.countDocuments({ status: { $ne: 'resolved' } }),
  ]);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysBookings = await Booking.countDocuments({
    startTime: { $gte: startOfDay, $lte: endOfDay },
  });

  const occupancyOverview = await getAllOccupancy();
  const totalCapacity = occupancyOverview.reduce((sum, o) => sum + o.capacity, 0);
  const totalOccupied = occupancyOverview.reduce((sum, o) => sum + o.occupied, 0);
  const currentOccupancy = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const noShowRate = await getNoShowRate();

  return success(res, 200, 'Dashboard data fetched', {
    totalStudents,
    totalSpaces,
    totalSeats,
    activeBookings,
    todaysBookings,
    currentOccupancy,
    noShowRate,
    openIssues: issuesOpen,
  });
});

// Admin bookings management
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, spaceId } = req.query;
  const query = {};
  if (status) query.status = status;
  if (spaceId) query.space = spaceId;

  const bookings = await Booking.find(query)
    .populate('user', 'name email studentId')
    .populate('space', 'name building')
    .populate('seat', 'seatNumber')
    .sort({ createdAt: -1 });

  return success(res, 200, 'Bookings fetched', { data: bookings });
});

const updateBookingAdmin = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!booking) throw new ApiError(404, 'Booking not found');
  return success(res, 200, 'Booking updated', { booking });
});

const deleteBookingAdmin = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  return success(res, 200, 'Booking deleted', {});
});

// Admin users management
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const query = {};
  if (role) query.role = role;
  const users = await User.find(query).sort({ createdAt: -1 });
  return success(res, 200, 'Users fetched', { data: users.map((u) => u.toSafeObject()) });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  return success(res, 200, 'User fetched', { user: user.toSafeObject() });
});

const updateUserAdmin = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'department', 'year', 'role', 'isActive'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');
  return success(res, 200, 'User updated', { user: user.toSafeObject() });
});

// Admin issues management
const getAllIssues = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;
  const issues = await Issue.find(query)
    .populate('user', 'name email')
    .populate('space', 'name building')
    .sort({ createdAt: -1 });
  return success(res, 200, 'Issues fetched', { data: issues });
});

const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const issue = await Issue.findById(req.params.id);
  if (!issue) throw new ApiError(404, 'Issue not found');
  issue.status = status;
  if (status === 'resolved') issue.resolvedAt = new Date();
  await issue.save();
  return success(res, 200, 'Issue status updated', { issue });
});

// Analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getFullAnalytics();
  return success(res, 200, 'Analytics fetched', analytics);
});

module.exports = {
  getDashboard,
  getAllBookings,
  updateBookingAdmin,
  deleteBookingAdmin,
  getAllUsers,
  getUserById,
  updateUserAdmin,
  getAllIssues,
  updateIssueStatus,
  getAnalytics,
};
