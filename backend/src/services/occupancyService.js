const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const env = require('../config/env');

function statusFromPercentage(percentage) {
  if (percentage >= env.OCCUPANCY_FULL_THRESHOLD) return 'full';
  if (percentage >= env.OCCUPANCY_CROWDED_THRESHOLD) return 'crowded';
  if (percentage >= env.OCCUPANCY_MODERATE_THRESHOLD) return 'moderate';
  return 'available';
}

/**
 * Computes real-time occupancy for a single study space based on actual
 * seat status + currently active/upcoming (not-yet-started-checkin-window)
 * bookings, rather than a stored counter.
 */
async function getSpaceOccupancy(spaceId) {
  const totalSeats = await Seat.countDocuments({ space: spaceId });
  const disabledSeats = await Seat.countDocuments({ space: spaceId, status: 'disabled' });
  const capacity = totalSeats - disabledSeats;

  const now = new Date();

  const activeBookingsCount = await Booking.countDocuments({
    space: spaceId,
    status: 'active',
  });

  const reservedBookingsCount = await Booking.countDocuments({
    space: spaceId,
    status: 'upcoming',
    startTime: { $lte: new Date(now.getTime() + 60 * 60 * 1000) }, // reserved soon (next hour) counts as "reserved"
    endTime: { $gte: now },
  });

  const occupied = activeBookingsCount;
  const reserved = Math.max(0, reservedBookingsCount);
  const available = Math.max(0, capacity - occupied - reserved);
  const percentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;

  return {
    space: spaceId,
    occupied,
    reserved,
    available,
    capacity,
    percentage,
    status: statusFromPercentage(percentage),
  };
}

async function getAllOccupancy() {
  const StudySpace = require('../models/StudySpace');
  const spaces = await StudySpace.find().select('_id name').lean();
  const results = await Promise.all(
    spaces.map(async (s) => {
      const occ = await getSpaceOccupancy(s._id);
      return { spaceId: s._id, spaceName: s.name, ...occ };
    })
  );
  return results;
}

module.exports = { getSpaceOccupancy, getAllOccupancy, statusFromPercentage };
