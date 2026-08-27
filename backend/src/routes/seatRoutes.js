const express = require('express');
const { getSeatById, updateSeat, deleteSeat } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { updateSeatSchema } = require('../validators/seatValidators');

const router = express.Router();

router.get('/:id', getSeatById);
router.put('/:id', protect, adminOnly, validate(updateSeatSchema), updateSeat);
router.delete('/:id', protect, adminOnly, deleteSeat);

module.exports = router;
