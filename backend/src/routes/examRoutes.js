const express = require('express');
const { createExam, getMyExams, updateExam, deleteExam } = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createExamSchema, updateExamSchema } = require('../validators/examValidators');

const router = express.Router();

router.use(protect);

router.post('/', validate(createExamSchema), createExam);
router.get('/', getMyExams);
router.put('/:id', validate(updateExamSchema), updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
