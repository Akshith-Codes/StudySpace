const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
