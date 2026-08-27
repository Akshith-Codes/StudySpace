const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const occupancyRoutes = require('./routes/occupancyRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const issueRoutes = require('./routes/issueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const examRoutes = require('./routes/examRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security & core middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'StudySpace AI API is running', data: { uptime: process.uptime() } });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/occupancy', occupancyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
