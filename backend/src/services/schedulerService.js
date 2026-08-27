const cron = require('node-cron');
const env = require('../config/env');
const { processNoShowBookings } = require('./bookingService');
const { processExpiredWaitlistEntries } = require('./waitlistService');

/**
 * Registers all recurring background jobs. Called once at server startup.
 * Kept isolated so the cron schedule can be swapped out (e.g. for a queue
 * worker) without touching business logic in the services themselves.
 */
function startScheduledJobs() {
  cron.schedule(env.NO_SHOW_CRON, async () => {
    try {
      const processed = await processNoShowBookings();
      if (processed > 0) {
        console.log(`[scheduler] Marked ${processed} booking(s) as no-show`);
      }
    } catch (err) {
      console.error('[scheduler] processNoShowBookings failed:', err.message);
    }

    try {
      const expired = await processExpiredWaitlistEntries();
      if (expired > 0) {
        console.log(`[scheduler] Expired ${expired} waitlist entrie(s)`);
      }
    } catch (err) {
      console.error('[scheduler] processExpiredWaitlistEntries failed:', err.message);
    }
  });

  console.log(`[scheduler] No-show / waitlist processor scheduled (${env.NO_SHOW_CRON})`);
}

module.exports = { startScheduledJobs };
