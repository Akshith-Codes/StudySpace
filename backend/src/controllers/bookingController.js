const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const bookingService = require('../services/bookingService');
const generateQRCode = require('../utils/generateQRCode');

const createBooking = asyncHandler(async (req, res) => {
  const { space, seat, date, startTime, endTime } = req.body;
  const booking = await bookingService.createBooking({
    userId: req.user._id,
    spaceId: space,
    seatId: seat,
    date,
    startTime,
    endTime,
  });
  return success(res, 201, 'Booking created successfully', { booking });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const bookings = await Booking.find(query)
    .populate('space', 'name building type')
    .populate('seat', 'seatNumber type')
    .sort({ startTime: -1 });

  return success(res, 200, 'Bookings fetched', { data: bookings });
});

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('space', 'name building type')
    .populate('seat', 'seatNumber type');
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to view this booking');
  }

  return success(res, 200, 'Booking fetched', { booking });
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to modify this booking');
  }
  if (!['upcoming'].includes(booking.status)) {
    throw new ApiError(400, 'Only upcoming bookings can be edited');
  }

  const allowed = ['date', 'startTime', 'endTime'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) booking[field] = req.body[field];
  });

  if (booking.startTime >= booking.endTime) {
    throw new ApiError(400, 'startTime must be before endTime');
  }
  const conflict = await bookingService.hasConflict(booking.seat, booking.startTime, booking.endTime, booking._id);
  if (conflict) throw new ApiError(409, 'This seat is already booked for the selected time.');

  await booking.save();
  return success(res, 200, 'Booking updated', { booking });
});

const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to delete this booking');
  }
  await booking.deleteOne();
  return success(res, 200, 'Booking deleted', {});
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user._id, req.user.role === 'admin');
  return success(res, 200, 'Booking cancelled successfully', { booking });
});

const getBookingQR = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role !== 'admin' && String(booking.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to view this QR code');
  }
  const qrDataUrl = await generateQRCode(booking.qrToken);
  return success(res, 200, 'QR code generated', { qrCode: qrDataUrl, qrToken: booking.qrToken });
});

const checkIn = asyncHandler(async (req, res) => {
  const { qrToken, bookingId } = req.body;
  if (!qrToken && !bookingId) throw new ApiError(400, 'qrToken or bookingId is required');
  const booking = await bookingService.checkIn({ qrToken, bookingId, userId: req.user._id });
  return success(res, 200, 'Checked in successfully', { booking });
});

const checkOut = asyncHandler(async (req, res) => {
  const { booking, durationMs } = await bookingService.checkOut(req.params.id, req.user._id);
  return success(res, 200, 'Checked out successfully', {
    booking,
    duration: durationMs,
    checkedInAt: booking.checkedInAt,
    checkedOutAt: booking.checkedOutAt,
    status: booking.status,
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getBookingQR,
  checkIn,
  checkOut,
};
