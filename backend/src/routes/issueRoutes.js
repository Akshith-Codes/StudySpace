const express = require('express');
const { createIssue, getMyIssues, getIssueById } = require('../controllers/issueController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createIssueSchema } = require('../validators/issueValidators');

const router = express.Router();

router.use(protect);

router.post('/', validate(createIssueSchema), createIssue);
router.get('/my', getMyIssues);
router.get('/:id', getIssueById);

module.exports = router;
