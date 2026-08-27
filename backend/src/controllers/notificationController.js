const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  return success(res, 200, 'Notifications fetched', { data: notifications });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!notification) throw new ApiError(404, 'Notification not found');
  notification.read = true;
  await notification.save();
  return success(res, 200, 'Notification marked as read', { notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  return success(res, 200, 'All notifications marked as read', {});
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
