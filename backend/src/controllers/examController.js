const Exam = require('../models/Exam');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const createExam = asyncHandler(async (req, res) => {
  const exam = await Exam.create({ ...req.body, user: req.user._id });
  return success(res, 201, 'Exam added', { exam });
});

const getMyExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ user: req.user._id }).sort({ examDate: 1 });
  return success(res, 200, 'Exams fetched', { data: exams });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
  if (!exam) throw new ApiError(404, 'Exam not found');
  Object.assign(exam, req.body);
  await exam.save();
  return success(res, 200, 'Exam updated', { exam });
});

const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!exam) throw new ApiError(404, 'Exam not found');
  return success(res, 200, 'Exam deleted', {});
});

module.exports = { createExam, getMyExams, updateExam, deleteExam };
