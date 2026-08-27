const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { createNotification } = require('./notificationService');
const { notifyNextInLine } = require('./waitlistService');

/**
 * Checks whether a candidate [startTime, endTime) window overlaps any
 * existing upcoming/active booking for the same seat.
 * Overlap rule: existing.start < candidate.end AND existing.end > candidate.start
 */
async function hasConflict(seatId, startTime, endTime, excludeBookingId = null) {
  const query = {
    seat: seatId,
    status: { $in: ['upcoming', 'active'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const conflict = await Booking.findOne(query);
  return Boolean(conflict);
}

async function createBooking({ userId, spaceId, seatId, date, startTime, endTime }) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError(400, 'Invalid startTime or endTime');
  }
  if (start >= end) {
    throw new ApiError(400, 'startTime must be before endTime');
  }
  if (start < new Date(Date.now() - 60 * 1000)) {
    throw new ApiError(400, 'Cannot create a booking in the past');
  }

  const space = await StudySpace.findById(spaceId);
  if (!space) throw new ApiError(404, 'Study space not found');
  if (space.status !== 'active') throw new ApiError(400, 'This study space is not currently open for booking');

  const seat = await Seat.findById(seatId);
  if (!seat) throw new ApiError(404, 'Seat not found');
  if (String(seat.space) !== String(spaceId)) {
    throw new ApiError(400, 'Seat does not belong to the specified study space');
  }
  if (seat.status === 'disabled') {
    throw new ApiError(400, 'This seat is disabled and cannot be booked');
  }

  const conflict = await hasConflict(seatId, start, end);
  if (conflict) {
    throw new ApiError(409, 'This seat is already booked for the selected time.');
  }

  const booking = await Booking.create({
    user: userId,
    space: spaceId,
    seat: seatId,
    date,
    startTime: start,
    endTime: end,
    status: 'upcoming',
  });

  await createNotification({
    user: userId,
    type: 'booking-confirmed',
    title: 'Booking confirmed',
    message: `Your seat ${seat.seatNumber} at ${space.name} is booked for ${date}.`,
    metadata: { bookingId: booking._id },
  });

  return booking;
}

async function cancelBooking(bookingId, userId, isAdmin = false) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (!isAdmin && String(booking.user) !== String(userId)) {
    throw new ApiError(403, 'You are not authorized to cancel this booking');
  }
  if (!['upcoming', 'active'].includes(booking.status)) {
    throw new ApiError(400, `Booking cannot be cancelled because it is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();

  await createNotification({
    user: booking.user,
    type: 'booking-cancelled',
    title: 'Booking cancelled',
    message: 'Your booking has been cancelled and the seat has been released.',
    metadata: { bookingId: booking._id },
  });

  // Release seat -> offer to next eligible waitlist entry
  await notifyNextInLine({
    spaceId: booking.space,
    seatId: booking.seat,
    requestedDate: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });

  return booking;
}

async function checkIn({ qrToken, bookingId, userId }) {
  const query = qrToken ? { qrToken } : { _id: bookingId };
  const booking = await Booking.findOne(query);
  if (!booking) throw new ApiError(404, 'Booking not found or invalid QR token');

  if (String(booking.user) !== String(userId)) {
    throw new ApiError(403, 'Only the booking owner can check in');
  }
  if (booking.status === 'cancelled') throw new ApiError(400, 'This booking has been cancelled');
  if (booking.status === 'completed') throw new ApiError(400, 'This booking has already been completed');
  if (booking.status === 'no-show') throw new ApiError(400, 'This booking was marked as a no-show');
  if (booking.status === 'active') throw new ApiError(400, 'This booking is already checked in');

  const now = new Date();
  const checkinWindowEnd = new Date(booking.startTime.getTime() + env.CHECKIN_WINDOW_MINUTES * 60 * 1000);

  if (now < new Date(booking.startTime.getTime() - 15 * 60 * 1000)) {
    throw new ApiError(400, 'Check-in is not open yet for this booking');
  }
  if (now > checkinWindowEnd) {
    throw new ApiError(400, 'Check-in window has expired for this booking');
  }

  booking.status = 'active';
  booking.checkedInAt = now;
  await booking.save();

  await createNotification({
    user: booking.user,
    type: 'check-in',
    title: 'Checked in',
    message: 'You have successfully checked in to your study space.',
    metadata: { bookingId: booking._id },
  });

  return booking;
}

async function checkOut(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (String(booking.user) !== String(userId)) {
    throw new ApiError(403, 'Only the booking owner can check out');
  }
  if (booking.status !== 'active') {
    throw new ApiError(400, 'Booking must be checked in (active) before it can be checked out');
  }

  const now = new Date();
  booking.status = 'completed';
  booking.checkedOutAt = now;
  await booking.save();

  const durationMs = booking.checkedOutAt - booking.checkedInAt;

  await createNotification({
    user: booking.user,
    type: 'check-out',
    title: 'Checked out',
    message: 'Your study session has ended. Thanks for using StudySpace AI!',
    metadata: { bookingId: booking._id },
  });

  return { booking, durationMs };
}

/**
 * Scans for bookings whose 5-minute check-in window has elapsed without a
 * check-in and marks them as no-show, releasing the seat and cascading to
 * the waitlist. Designed to be called by a scheduled cron job.
 */
async function processNoShowBookings() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - env.CHECKIN_WINDOW_MINUTES * 60 * 1000);

  const overdueBookings = await Booking.find({
    status: 'upcoming',
    startTime: { $lte: cutoff },
  });

  let processed = 0;
  for (const booking of overdueBookings) {
    booking.status = 'no-show';
    booking.noShowAt = now;
    await booking.save();
    processed += 1;

    await createNotification({
      user: booking.user,
      type: 'no-show',
      title: 'Marked as no-show',
      message: 'You did not check in within 5 minutes of your booking start time, so it was cancelled.',
      metadata: { bookingId: booking._id },
    });

    await notifyNextInLine({
      spaceId: booking.space,
      seatId: booking.seat,
      requestedDate: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
  }

  return processed;
}

module.exports = {
  hasConflict,
  createBooking,
  cancelBooking,
  checkIn,
  checkOut,
  processNoShowBookings,
};
