const Waitlist = require('../models/Waitlist');
const env = require('../config/env');
const { createNotification } = require('./notificationService');

/**
 * Finds the next eligible waitlist entry for a space/date/time window,
 * notifies the student, opens a configurable claim window, and returns
 * the updated entry (or null if nobody was waiting).
 */
async function notifyNextInLine({ spaceId, seatId, requestedDate, startTime, endTime }) {
  const next = await Waitlist.findOne({
    space: spaceId,
    requestedDate,
    status: 'waiting',
    ...(seatId ? { $or: [{ seat: seatId }, { seat: null }] } : {}),
  })
    .sort({ position: 1 })
    .populate('user', 'name email');

  if (!next) return null;

  const expiresAt = new Date(Date.now() + env.WAITLIST_CLAIM_WINDOW_MINUTES * 60 * 1000);
  next.status = 'notified';
  next.expiresAt = expiresAt;
  await next.save();

  await createNotification({
    user: next.user._id,
    type: 'waitlist',
    title: 'A seat is available!',
    message: `A seat you were waitlisted for is now available. Claim it within ${env.WAITLIST_CLAIM_WINDOW_MINUTES} minutes.`,
    metadata: { waitlistId: next._id, space: spaceId, seat: seatId },
  });

  return next;
}

/**
 * Expires waitlist entries whose claim window has passed without being
 * claimed, and cascades to notify the next person in line.
 */
async function processExpiredWaitlistEntries() {
  const now = new Date();
  const expiredEntries = await Waitlist.find({
    status: 'notified',
    expiresAt: { $lte: now },
  });

  for (const entry of expiredEntries) {
    entry.status = 'expired';
    await entry.save();
    await notifyNextInLine({
      spaceId: entry.space,
      seatId: entry.seat,
      requestedDate: entry.requestedDate,
      startTime: entry.startTime,
      endTime: entry.endTime,
    });
  }

  return expiredEntries.length;
}

/**
 * Recalculates sequential positions (1..n) for the waiting queue of a
 * given space/date after removals/claims.
 */
async function recalculatePositions(spaceId, requestedDate) {
  const waiting = await Waitlist.find({ space: spaceId, requestedDate, status: 'waiting' }).sort({
    position: 1,
  });
  await Promise.all(
    waiting.map((entry, idx) => {
      entry.position = idx + 1;
      return entry.save();
    })
  );
}

module.exports = { notifyNextInLine, processExpiredWaitlistEntries, recalculatePositions };
