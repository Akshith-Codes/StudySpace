require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyspace_ai',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NO_SHOW_CRON: process.env.NO_SHOW_CRON || '* * * * *',
  CHECKIN_WINDOW_MINUTES: Number(process.env.CHECKIN_WINDOW_MINUTES || 5),
  WAITLIST_CLAIM_WINDOW_MINUTES: Number(process.env.WAITLIST_CLAIM_WINDOW_MINUTES || 10),
  OCCUPANCY_MODERATE_THRESHOLD: Number(process.env.OCCUPANCY_MODERATE_THRESHOLD || 50),
  OCCUPANCY_CROWDED_THRESHOLD: Number(process.env.OCCUPANCY_CROWDED_THRESHOLD || 75),
  OCCUPANCY_FULL_THRESHOLD: Number(process.env.OCCUPANCY_FULL_THRESHOLD || 90),
};

module.exports = env;
