const express = require('express');
const {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getSpacesMap,
} = require('../controllers/spaceController');
const { getSeatsForSpace, createSeat } = require('../controllers/seatController');
const { getReviewsForSpace } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createSpaceSchema, updateSpaceSchema } = require('../validators/spaceValidators');
const { createSeatSchema } = require('../validators/seatValidators');

const router = express.Router();

router.get('/map', getSpacesMap);
router.get('/', getSpaces);
router.get('/:id', getSpaceById);
router.get('/:spaceId/seats', getSeatsForSpace);
router.get('/:spaceId/reviews', getReviewsForSpace);

router.post('/', protect, adminOnly, validate(createSpaceSchema), createSpace);
router.put('/:id', protect, adminOnly, validate(updateSpaceSchema), updateSpace);
router.delete('/:id', protect, adminOnly, deleteSpace);
router.post('/:spaceId/seats', protect, adminOnly, validate(createSeatSchema), createSeat);

module.exports = router;
