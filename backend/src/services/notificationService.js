const Notification = require('../models/Notification');

async function createNotification({ user, type, title, message, metadata = {} }) {
  return Notification.create({ user, type, title, message, metadata });
}

module.exports = { createNotification };
