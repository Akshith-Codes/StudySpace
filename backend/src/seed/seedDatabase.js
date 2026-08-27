/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Issue = require('../models/Issue');
const Exam = require('../models/Exam');
const Notification = require('../models/Notification');
const Waitlist = require('../models/Waitlist');

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    StudySpace.deleteMany({}),
    Seat.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Issue.deleteMany({}),
    Exam.deleteMany({}),
    Notification.deleteMany({}),
    Waitlist.deleteMany({}),
  ]);
  console.log('[seed] Cleared existing collections');
}

async function seedUsers() {
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    department: 'Other',
    year: '4th Year',
  });

  const student = await User.create({
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    studentId: 'STU2023001',
    department: 'CSE',
    year: '3rd Year',
    preferences: { quietness: 40, distance: 15, facilities: 25, studyType: 'Individual', charging: true, ac: true },
  });

  const extraStudents = await User.create([
    {
      name: 'Ananya Rao',
      email: 'ananya.rao@demo.com',
      password: 'student123',
      studentId: 'STU2023002',
      department: 'ECE',
      year: '2nd Year',
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@demo.com',
      password: 'student123',
      studentId: 'STU2023003',
      department: 'Mechanical',
      year: '1st Year',
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@demo.com',
      password: 'student123',
      studentId: 'STU2023004',
      department: 'CSE',
      year: '4th Year',
    },
  ]);

  console.log('[seed] Users created: admin@demo.com / student@demo.com (+3 extra students)');
  return { admin, student, students: [student, ...extraStudents] };
}

async function seedSpaces() {
  const spacesData = [
    {
      name: 'Central Library',
      building: 'Central Library',
      floor: 'Ground Floor',
      type: 'library',
      description: 'The main campus library with a large silent reading hall and extensive book collection.',
      capacity: 50,
      facilities: ['wifi', 'ac', 'charging', 'silent'],
      noiseLevel: 'silent',
      openingHours: { open: '07:00', close: '23:00' },
      location: { latitude: 17.41931, longitude: 78.65654 },
      status: 'active',
      image: '',
    },
    {
      name: 'CSE Reading Room',
      building: 'CSE Block',
      floor: '2nd Floor',
      type: 'reading-room',
      description: 'A quiet reading room reserved for Computer Science students.',
      capacity: 30,
      facilities: ['wifi', 'ac', 'charging'],
      noiseLevel: 'quiet',
      openingHours: { open: '08:00', close: '22:00' },
      location: { latitude: 17.41991, longitude: 78.65784 },
      status: 'active',
      image: '',
    },
    {
      name: 'Engineering Study Hall',
      building: 'Engineering Block',
      floor: '1st Floor',
      type: 'study-hall',
      description: 'A spacious hall ideal for both individual and group study sessions.',
      capacity: 40,
      facilities: ['wifi', 'ac', 'group-study'],
      noiseLevel: 'moderate',
      openingHours: { open: '08:00', close: '21:00' },
      location: { latitude: 17.41871, longitude: 78.65904 },
      status: 'active',
      image: '',
    },
    {
      name: 'Individual Study Cabins',
      building: 'Hostel',
      floor: '1st Floor',
      type: 'cabin',
      description: 'Private single-occupancy cabins for focused, distraction-free study.',
      capacity: 12,
      facilities: ['charging', 'silent', 'ac'],
      noiseLevel: 'silent',
      openingHours: { open: '06:00', close: '23:59' },
      location: { latitude: 17.41761, longitude: 78.65584 },
      status: 'active',
      image: '',
    },
    {
      name: 'Discussion Room',
      building: 'Reading Hall',
      floor: 'Ground Floor',
      type: 'discussion-room',
      description: 'A collaborative space for group discussions and project work.',
      capacity: 20,
      facilities: ['wifi', 'ac', 'group-study'],
      noiseLevel: 'moderate',
      openingHours: { open: '08:00', close: '20:00' },
      location: { latitude: 17.42101, longitude: 78.65724 },
      status: 'active',
      image: '',
    },
  ];

  const spaces = await StudySpace.create(spacesData);
  console.log(`[seed] Created ${spaces.length} study spaces`);

  const seatTypeCycle = ['standard', 'window', 'charging', 'silent', 'accessible'];
  for (const space of spaces) {
    const seatCount = space.capacity;
    const seatsPerRow = 10;
    const seatDocs = [];
    for (let i = 1; i <= seatCount; i += 1) {
      const row = Math.ceil(i / seatsPerRow);
      const column = ((i - 1) % seatsPerRow) + 1;
      const type = space.type === 'cabin' ? 'cabin' : seatTypeCycle[i % seatTypeCycle.length];
      const status = i % 17 === 0 ? 'disabled' : 'available';
      seatDocs.push({
        space: space._id,
        seatNumber: `${space.type.slice(0, 2).toUpperCase()}-${String(i).padStart(2, '0')}`,
        type,
        row,
        column,
        position: { x: column * 40, y: row * 40 },
        status,
        features: type === 'charging' ? ['power-outlet'] : type === 'window' ? ['natural-light'] : [],
      });
    }
    const seats = await Seat.insertMany(seatDocs);
    space.totalSeats = seats.length;
    space.availableSeats = seats.filter((s) => s.status === 'available').length;
    await space.save();
  }
  console.log('[seed] Seats created for all spaces');

  return spaces;
}

async function seedBookingsReviewsAndMore({ admin, student, students }, spaces) {
  const allSeatsByCollection = await Seat.find({}).lean();

  function seatsFor(spaceId) {
    return allSeatsByCollection.filter((s) => String(s.space) === String(spaceId));
  }

  const now = new Date();

  // 1. A completed booking for the demo student (yesterday) -> eligible for review
  const pastSpace = spaces[0];
  const pastSeat = seatsFor(pastSpace._id)[0];
  const pastStart = addDays(now, -1);
  pastStart.setHours(10, 0, 0, 0);
  const pastEnd = new Date(pastStart.getTime() + 2 * 60 * 60 * 1000);

  const completedBooking = await Booking.create({
    user: student._id,
    space: pastSpace._id,
    seat: pastSeat._id,
    date: ymd(pastStart),
    startTime: pastStart,
    endTime: pastEnd,
    status: 'completed',
    checkedInAt: pastStart,
    checkedOutAt: pastEnd,
  });

  // 2. An upcoming booking for the demo student (later today)
  const upcomingSpace = spaces[1];
  const upcomingSeat = seatsFor(upcomingSpace._id)[1];
  const upcomingStart = new Date(now.getTime() + 60 * 60 * 1000);
  const upcomingEnd = new Date(upcomingStart.getTime() + 2 * 60 * 60 * 1000);

  await Booking.create({
    user: student._id,
    space: upcomingSpace._id,
    seat: upcomingSeat._id,
    date: ymd(upcomingStart),
    startTime: upcomingStart,
    endTime: upcomingEnd,
    status: 'upcoming',
  });

  // 3. An active (checked-in) booking for another student
  const activeSpace = spaces[2];
  const activeSeat = seatsFor(activeSpace._id)[3];
  const activeStart = new Date(now.getTime() - 30 * 60 * 1000);
  const activeEnd = new Date(now.getTime() + 90 * 60 * 1000);

  await Booking.create({
    user: students[1]._id,
    space: activeSpace._id,
    seat: activeSeat._id,
    date: ymd(activeStart),
    startTime: activeStart,
    endTime: activeEnd,
    status: 'active',
    checkedInAt: activeStart,
  });

  // 4. A past no-show booking (illustrative, historical)
  const noShowSpace = spaces[3];
  const noShowSeat = seatsFor(noShowSpace._id)[2];
  const noShowStart = addDays(now, -2);
  noShowStart.setHours(9, 0, 0, 0);
  const noShowEnd = new Date(noShowStart.getTime() + 60 * 60 * 1000);

  await Booking.create({
    user: students[2]._id,
    space: noShowSpace._id,
    seat: noShowSeat._id,
    date: ymd(noShowStart),
    startTime: noShowStart,
    endTime: noShowEnd,
    status: 'no-show',
    noShowAt: new Date(noShowStart.getTime() + 5 * 60 * 1000),
  });

  console.log('[seed] Example bookings created (completed, upcoming, active, no-show)');

  // Reviews (tied to the completed booking)
  await Review.create({
    user: student._id,
    space: pastSpace._id,
    booking: completedBooking._id,
    overall: 5,
    cleanliness: 5,
    noise: 4,
    wifi: 5,
    comfort: 4,
    facilities: 5,
    comment: 'Quiet, clean, and great charging points near every seat.',
  });

  // A couple of extra reviews on other spaces from other (unlinked) fake bookings
  const extraReviewBooking = await Booking.create({
    user: students[1]._id,
    space: spaces[2]._id,
    seat: seatsFor(spaces[2]._id)[5]._id,
    date: ymd(addDays(now, -3)),
    startTime: addDays(now, -3),
    endTime: addDays(now, -3),
    status: 'completed',
  });
  await Review.create({
    user: students[1]._id,
    space: spaces[2]._id,
    booking: extraReviewBooking._id,
    overall: 4,
    cleanliness: 4,
    noise: 3,
    wifi: 4,
    comfort: 4,
    facilities: 4,
    comment: 'Good for group work, gets a little noisy in the evening.',
  });

  for (const space of spaces) {
    const stats = await Review.aggregate([
      { $match: { space: space._id } },
      { $group: { _id: '$space', avgRating: { $avg: '$overall' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      space.rating = Math.round(stats[0].avgRating * 10) / 10;
      space.reviewCount = stats[0].count;
      await space.save();
    }
  }
  console.log('[seed] Reviews created and space ratings recalculated');

  // Issues
  await Issue.create([
    {
      user: students[2]._id,
      space: spaces[0]._id,
      type: 'AC',
      description: 'AC near seat LI-05 is not cooling properly.',
      status: 'reported',
    },
    {
      user: students[1]._id,
      space: spaces[2]._id,
      type: 'Wi-Fi',
      description: 'Wi-Fi signal is weak at the back of the hall.',
      status: 'in-progress',
    },
    {
      user: student._id,
      space: spaces[3]._id,
      type: 'Charging',
      description: 'Power outlet at cabin IN-03 is not working.',
      status: 'resolved',
      resolvedAt: new Date(),
    },
  ]);
  console.log('[seed] Issues created');

  // Exams
  await Exam.create([
    {
      user: student._id,
      subject: 'Data Structures & Algorithms',
      examDate: addDays(now, 3),
      priority: 'high',
    },
    {
      user: student._id,
      subject: 'Operating Systems',
      examDate: addDays(now, 10),
      priority: 'medium',
    },
    {
      user: students[1]._id,
      subject: 'Digital Electronics',
      examDate: addDays(now, 2),
      priority: 'high',
    },
  ]);
  console.log('[seed] Exams created');

  // Notifications
  await Notification.create([
    {
      user: student._id,
      type: 'booking-confirmed',
      title: 'Booking confirmed',
      message: `Your seat at ${upcomingSpace.name} is booked.`,
      read: false,
    },
    {
      user: student._id,
      type: 'review',
      title: 'Thanks for your review!',
      message: `Your review for ${pastSpace.name} has been posted.`,
      read: true,
    },
    {
      user: students[2]._id,
      type: 'no-show',
      title: 'Marked as no-show',
      message: 'You missed the 5-minute check-in window for your booking.',
      read: false,
    },
  ]);
  console.log('[seed] Notifications created');

  // Waitlist entries
  const waitlistSpace = spaces[4];
  await Waitlist.create([
    {
      user: students[1]._id,
      space: waitlistSpace._id,
      requestedDate: ymd(now),
      startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      position: 1,
      status: 'waiting',
    },
    {
      user: students[2]._id,
      space: waitlistSpace._id,
      requestedDate: ymd(now),
      startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
      position: 2,
      status: 'waiting',
    },
  ]);
  console.log('[seed] Waitlist entries created');
}

async function seedDatabase() {
  await connectDB();
  await clearCollections();

  const { admin, student, students } = await seedUsers();
  const spaces = await seedSpaces();
  await seedBookingsReviewsAndMore({ admin, student, students }, spaces);

  console.log('\n[seed] ✅ Database seeded successfully!');
  console.log('[seed] Demo credentials:');
  console.log('[seed]   Admin:   admin@demo.com / admin123');
  console.log('[seed]   Student: student@demo.com / student123');

  await mongoose.connection.close();
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[seed] Seeding failed:', err);
  process.exit(1);
});
