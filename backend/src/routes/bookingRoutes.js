const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking,
  getBookingQR,
  checkIn,
  checkOut,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createBookingSchema } = require('../validators/bookingValidators');

const router = express.Router();

router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getMyBookings);
router.post('/check-in', checkIn);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);
router.post('/:id/cancel', cancelBooking);
router.get('/:id/qr', getBookingQR);
router.post('/:id/check-out', checkOut);

module.exports = router;
