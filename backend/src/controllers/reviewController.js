const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const StudySpace = require('../models/StudySpace');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

async function recalculateSpaceRating(spaceId) {
  // NOTE: aggregate() does NOT auto-cast query values the way find() does,
  // so spaceId must be cast to an ObjectId or this $match never matches
  // anything and the space rating/reviewCount silently never update.
  const spaceObjectId =
    spaceId instanceof mongoose.Types.ObjectId ? spaceId : new mongoose.Types.ObjectId(String(spaceId));

  const stats = await Review.aggregate([
    { $match: { space: spaceObjectId } },
    { $group: { _id: '$space', avgRating: { $avg: '$overall' }, count: { $sum: 1 } } },
  ]);
  const rating = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const reviewCount = stats.length ? stats[0].count : 0;
  await StudySpace.findByIdAndUpdate(spaceId, { rating, reviewCount });
}

const createReview = asyncHandler(async (req, res) => {
  const { booking: bookingId, space, overall, cleanliness, noise, wifi, comfort, facilities, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only review your own bookings');
  }
  if (booking.status !== 'completed') {
    throw new ApiError(400, 'Only completed bookings can be reviewed');
  }
  if (String(booking.space) !== String(space)) {
    throw new ApiError(400, 'Booking does not belong to the specified study space');
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) throw new ApiError(409, 'This booking has already been reviewed');

  const review = await Review.create({
    user: req.user._id,
    space,
    booking: bookingId,
    overall,
    cleanliness,
    noise,
    wifi,
    comfort,
    facilities,
    comment,
  });

  await recalculateSpaceRating(space);

  return success(res, 201, 'Review submitted', { review });
});

const getReviewsForSpace = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ space: req.params.spaceId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  return success(res, 200, 'Reviews fetched', { data: reviews });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, 'Review not found');

  const allowed = ['overall', 'cleanliness', 'noise', 'wifi', 'comfort', 'facilities', 'comment'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) review[field] = req.body[field];
  });
  await review.save();
  await recalculateSpaceRating(review.space);

  return success(res, 200, 'Review updated', { review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw new ApiError(404, 'Review not found');
  await review.deleteOne();
  await recalculateSpaceRating(review.space);
  return success(res, 200, 'Review deleted', {});
});

module.exports = { createReview, getReviewsForSpace, updateReview, deleteReview };
