const express = require('express');
const { joinWaitlist, getMyWaitlist, leaveWaitlist, claimWaitlist } = require('../controllers/waitlistController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createWaitlistSchema } = require('../validators/waitlistValidators');

const router = express.Router();

router.use(protect);

router.post('/', validate(createWaitlistSchema), joinWaitlist);
router.get('/', getMyWaitlist);
router.delete('/:id', leaveWaitlist);
router.post('/:id/claim', claimWaitlist);

module.exports = router;
