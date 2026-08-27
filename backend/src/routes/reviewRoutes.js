const express = require('express');
const { createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createReviewSchema } = require('../validators/reviewValidators');

const router = express.Router();

router.post('/', protect, validate(createReviewSchema), createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
