const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

// GET /api/spaces/:spaceId/seats — includes computed real-time booking status
const getSeatsForSpace = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const { date } = req.query;

  const space = await StudySpace.findById(spaceId);
  if (!space) throw new ApiError(404, 'Study space not found');

  const seats = await Seat.find({ space: spaceId }).sort({ row: 1, column: 1 }).lean();

  let bookingsForDate = [];
  if (date) {
    bookingsForDate = await Booking.find({
      space: spaceId,
      date,
      status: { $in: ['upcoming', 'active'] },
    }).lean();
  }

  const enriched = seats.map((seat) => {
    if (seat.status === 'disabled') return { ...seat, bookingStatus: 'disabled' };
    const seatBookings = bookingsForDate.filter((b) => String(b.seat) === String(seat._id));
    const isOccupied = seatBookings.some((b) => b.status === 'active');
    const isReserved = seatBookings.some((b) => b.status === 'upcoming');
    let bookingStatus = 'available';
    if (isOccupied) bookingStatus = 'occupied';
    else if (isReserved) bookingStatus = 'reserved';
    return { ...seat, bookingStatus, bookingsToday: seatBookings };
  });

  return success(res, 200, 'Seats fetched', { data: enriched });
});

const getSeatById = asyncHandler(async (req, res) => {
  const seat = await Seat.findById(req.params.id).populate('space', 'name building');
  if (!seat) throw new ApiError(404, 'Seat not found');
  return success(res, 200, 'Seat fetched', { seat });
});

const createSeat = asyncHandler(async (req, res) => {
  const { spaceId } = req.params;
  const space = await StudySpace.findById(spaceId);
  if (!space) throw new ApiError(404, 'Study space not found');

  const seat = await Seat.create({ ...req.body, space: spaceId });

  space.totalSeats = await Seat.countDocuments({ space: spaceId });
  await space.save();

  return success(res, 201, 'Seat created', { seat });
});

const updateSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!seat) throw new ApiError(404, 'Seat not found');
  return success(res, 200, 'Seat updated', { seat });
});

const deleteSeat = asyncHandler(async (req, res) => {
  const seat = await Seat.findByIdAndDelete(req.params.id);
  if (!seat) throw new ApiError(404, 'Seat not found');

  const space = await StudySpace.findById(seat.space);
  if (space) {
    space.totalSeats = await Seat.countDocuments({ space: seat.space });
    await space.save();
  }

  return success(res, 200, 'Seat deleted', {});
});

module.exports = { getSeatsForSpace, getSeatById, createSeat, updateSeat, deleteSeat };
