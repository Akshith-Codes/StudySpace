const Waitlist = require('../models/Waitlist');
const StudySpace = require('../models/StudySpace');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { recalculatePositions } = require('../services/waitlistService');

const joinWaitlist = asyncHandler(async (req, res) => {
  const { space, seat, requestedDate, startTime, endTime } = req.body;

  const spaceDoc = await StudySpace.findById(space);
  if (!spaceDoc) throw new ApiError(404, 'Study space not found');

  const existing = await Waitlist.findOne({
    user: req.user._id,
    space,
    requestedDate,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    status: 'waiting',
  });
  if (existing) throw new ApiError(409, 'You are already on the waitlist for this request');

  const currentCount = await Waitlist.countDocuments({ space, requestedDate, status: 'waiting' });

  const entry = await Waitlist.create({
    user: req.user._id,
    space,
    seat: seat || null,
    requestedDate,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    position: currentCount + 1,
    status: 'waiting',
  });

  return success(res, 201, 'Added to waitlist', { waitlist: entry });
});

const getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await Waitlist.find({ user: req.user._id })
    .populate('space', 'name building')
    .sort({ createdAt: -1 });
  return success(res, 200, 'Waitlist entries fetched', { data: entries });
});

const leaveWaitlist = asyncHandler(async (req, res) => {
  const entry = await Waitlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!entry) throw new ApiError(404, 'Waitlist entry not found');
  entry.status = 'cancelled';
  await entry.save();
  await recalculatePositions(entry.space, entry.requestedDate);
  return success(res, 200, 'Removed from waitlist', {});
});

const claimWaitlist = asyncHandler(async (req, res) => {
  const entry = await Waitlist.findOne({ _id: req.params.id, user: req.user._id });
  if (!entry) throw new ApiError(404, 'Waitlist entry not found');
  if (entry.status !== 'notified') {
    throw new ApiError(400, 'This waitlist entry is not currently claimable');
  }
  if (entry.expiresAt && entry.expiresAt < new Date()) {
    entry.status = 'expired';
    await entry.save();
    throw new ApiError(400, 'The claim window for this waitlist entry has expired');
  }
  entry.status = 'claimed';
  await entry.save();
  return success(res, 200, 'Waitlist spot claimed. Please complete your booking now.', { waitlist: entry });
});

module.exports = { joinWaitlist, getMyWaitlist, leaveWaitlist, claimWaitlist };
