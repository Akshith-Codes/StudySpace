const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const { startScheduledJobs } = require('./services/schedulerService');

async function start() {
  await connectDB();
  startScheduledJobs();

  const server = app.listen(env.PORT, () => {
    console.log(`[server] StudySpace AI API running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
}

start();
