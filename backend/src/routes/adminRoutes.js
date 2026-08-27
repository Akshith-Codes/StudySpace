const express = require('express');
const {
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
} = require('../controllers/adminController');
const {
  getSpaces,
  createSpace,
  updateSpace,
  deleteSpace,
} = require('../controllers/spaceController');
const {
  createSeat,
  updateSeat,
  deleteSeat,
} = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createSpaceSchema, updateSpaceSchema } = require('../validators/spaceValidators');
const { createSeatSchema, updateSeatSchema } = require('../validators/seatValidators');
const { updateIssueStatusSchema } = require('../validators/issueValidators');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// Spaces
router.get('/spaces', getSpaces);
router.post('/spaces', validate(createSpaceSchema), createSpace);
router.put('/spaces/:id', validate(updateSpaceSchema), updateSpace);
router.delete('/spaces/:id', deleteSpace);

// Seats
router.get('/seats', asyncSeatList);
router.post('/spaces/:spaceId/seats', validate(createSeatSchema), createSeat);
router.put('/seats/:id', validate(updateSeatSchema), updateSeat);
router.delete('/seats/:id', deleteSeat);

// Bookings
router.get('/bookings', getAllBookings);
router.put('/bookings/:id', updateBookingAdmin);
router.delete('/bookings/:id', deleteBookingAdmin);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserAdmin);

// Issues
router.get('/issues', getAllIssues);
router.put('/issues/:id', validate(updateIssueStatusSchema), updateIssueStatus);

// GET /api/admin/seats - flat list across all spaces (helper, not seat-scoped)
async function asyncSeatList(req, res, next) {
  try {
    const Seat = require('../models/Seat');
    const { success } = require('../utils/apiResponse');
    const seats = await Seat.find().populate('space', 'name building').sort({ createdAt: -1 });
    return success(res, 200, 'Seats fetched', { data: seats });
  } catch (err) {
    next(err);
  }
}

module.exports = router;
