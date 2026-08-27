const Issue = require('../models/Issue');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const createIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.create({ ...req.body, user: req.user._id });
  return success(res, 201, 'Issue reported', { issue });
});

const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ user: req.user._id })
    .populate('space', 'name building')
    .sort({ createdAt: -1 });
  return success(res, 200, 'Issues fetched', { data: issues });
});

const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id).populate('space', 'name building');
  if (!issue) throw new ApiError(404, 'Issue not found');
  if (req.user.role !== 'admin' && String(issue.user) !== String(req.user._id)) {
    throw new ApiError(403, 'You are not authorized to view this issue');
  }
  return success(res, 200, 'Issue fetched', { issue });
});

module.exports = { createIssue, getMyIssues, getIssueById };
