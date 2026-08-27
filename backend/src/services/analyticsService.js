const Booking = require('../models/Booking');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');

async function getPeakHours() {
  const results = await Booking.aggregate([
    { $match: { status: { $in: ['active', 'completed', 'upcoming'] } } },
    { $group: { _id: { $hour: '$startTime' }, bookings: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({ hour: r._id, bookings: r.bookings }));
}

async function getPopularSpaces(limit = 5) {
  const results = await Booking.aggregate([
    { $group: { _id: '$space', bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'studyspaces',
        localField: '_id',
        foreignField: '_id',
        as: 'space',
      },
    },
    { $unwind: '$space' },
    { $project: { name: '$space.name', bookings: 1, occupancy: '$space.availableSeats' } },
  ]);
  return results;
}

async function getOccupancyTrend(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const results = await Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return results.map((r) => ({ date: r._id, occupancy: r.count }));
}

async function getNoShowRate() {
  const total = await Booking.countDocuments({});
  if (!total) return 0;
  const noShows = await Booking.countDocuments({ status: 'no-show' });
  return Math.round((noShows / total) * 1000) / 10; // one decimal
}

async function getSpaceUtilization() {
  const spaces = await StudySpace.find().lean();
  const results = await Promise.all(
    spaces.map(async (space) => {
      const totalSeats = await Seat.countDocuments({ space: space._id });
      const usedBookings = await Booking.countDocuments({
        space: space._id,
        status: { $in: ['active', 'completed'] },
      });
      const utilization = totalSeats > 0 ? Math.round((usedBookings / (totalSeats * 10)) * 100) : 0;
      return { name: space.name, utilization: Math.min(100, utilization) };
    })
  );
  return results;
}

async function getFullAnalytics() {
  const [peakHours, popularSpaces, occupancyTrend, noShowRate, spaceUtilization] = await Promise.all([
    getPeakHours(),
    getPopularSpaces(),
    getOccupancyTrend(),
    getNoShowRate(),
    getSpaceUtilization(),
  ]);

  return { peakHours, popularSpaces, occupancyTrend, noShowRate, spaceUtilization };
}

module.exports = {
  getPeakHours,
  getPopularSpaces,
  getOccupancyTrend,
  getNoShowRate,
  getSpaceUtilization,
  getFullAnalytics,
};
