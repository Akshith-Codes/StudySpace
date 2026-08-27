import { uid, seededRandom } from '../utils/helpers'

// Campus coordinates (approximate center)
export const CAMPUS_CENTER = [17.41931, 78.65654]

const spaceTemplates = [
  {
    name: 'Central Library — Reading Hall',
    building: 'Central Library',
    floor: 2,
    type: 'Library',
    capacity: 50,
    description: 'A spacious reading hall with natural light and individual study desks. Ideal for focused, independent study sessions.',
    facilities: ['Wi-Fi', 'AC', 'Charging', 'Power outlets', 'Natural light'],
    noiseLevel: 'Silent',
    openHours: '8:00 AM – 10:00 PM',
    rating: 4.7,
    location: [17.41931, 78.65654],
    rows: 3,
    cols: 4,
  },
  {
    name: 'Engineering Block — Study Hall A',
    building: 'Engineering Block',
    floor: 1,
    type: 'Study Hall',
    capacity: 40,
    description: 'Open study hall near the engineering departments. Good for group work and collaborative sessions.',
    facilities: ['Wi-Fi', 'AC', 'Power outlets', 'Group study'],
    noiseLevel: 'Moderate',
    openHours: '7:00 AM – 11:00 PM',
    rating: 4.3,
    location: [17.42011, 78.65734],
    rows: 4,
    cols: 4,
  },
  {
    name: 'CSE Block — Quiet Zone',
    building: 'CSE Block',
    floor: 3,
    type: 'Quiet Zone',
    capacity: 24,
    description: 'A dedicated quiet zone for computer science students. Strict silence policy enforced.',
    facilities: ['Wi-Fi', 'AC', 'Charging', 'Silent environment'],
    noiseLevel: 'Silent',
    openHours: '8:00 AM – 9:00 PM',
    rating: 4.8,
    location: [17.42081, 78.65604],
    rows: 2,
    cols: 4,
  },
  {
    name: 'Central Library — Discussion Room',
    building: 'Central Library',
    floor: 1,
    type: 'Discussion Room',
    capacity: 12,
    description: 'A bookable discussion room with a whiteboard and seating for small groups.',
    facilities: ['Wi-Fi', 'AC', 'Power outlets', 'Group study'],
    noiseLevel: 'Moderate',
    openHours: '8:00 AM – 10:00 PM',
    rating: 4.5,
    location: [17.41911, 78.65634],
    rows: 2,
    cols: 3,
  },
  {
    name: 'Hostel — Reading Room',
    building: 'Hostel',
    floor: 1,
    type: 'Reading Room',
    capacity: 30,
    description: 'A reading room inside the hostel premises, open to residents for late-night study.',
    facilities: ['Wi-Fi', 'Charging', 'Power outlets'],
    noiseLevel: 'Quiet',
    openHours: '6:00 AM – 12:00 AM',
    rating: 4.1,
    location: [17.42161, 78.65834],
    rows: 3,
    cols: 5,
  },
  {
    name: 'Reading Hall — Individual Cabins',
    building: 'Reading Hall',
    floor: 2,
    type: 'Individual Cabin',
    capacity: 16,
    description: 'Private individual study cabins with doors, power outlets, and a desk lamp in each unit.',
    facilities: ['Wi-Fi', 'AC', 'Charging', 'Power outlets', 'Silent environment'],
    noiseLevel: 'Silent',
    openHours: '8:00 AM – 10:00 PM',
    rating: 4.9,
    location: [17.41961, 78.65534],
    rows: 2,
    cols: 4,
  },
  {
    name: 'Engineering Block — Cabin Row',
    building: 'Engineering Block',
    floor: 2,
    type: 'Individual Cabin',
    capacity: 20,
    description: 'A row of individual study cabins on the second floor of the engineering block.',
    facilities: ['Wi-Fi', 'AC', 'Charging', 'Power outlets'],
    noiseLevel: 'Quiet',
    openHours: '7:00 AM – 11:00 PM',
    rating: 4.4,
    location: [17.42041, 78.65764],
    rows: 2,
    cols: 5,
  },
  {
    name: 'CSE Block — Study Hall',
    building: 'CSE Block',
    floor: 2,
    type: 'Study Hall',
    capacity: 36,
    description: 'A large study hall in the CSE block with ample power outlets and comfortable seating.',
    facilities: ['Wi-Fi', 'AC', 'Charging', 'Power outlets', 'Natural light'],
    noiseLevel: 'Quiet',
    openHours: '8:00 AM – 9:00 PM',
    rating: 4.6,
    location: [17.42061, 78.65634],
    rows: 3,
    cols: 4,
  },
]

export function generateSeats(space) {
  const seats = []
  const totalSeats = space.rows * space.cols
  const rng = seededRandom(space.name.length * 1000 + space.capacity)

  for (let i = 0; i < totalSeats; i++) {
    const row = Math.floor(i / space.cols)
    const col = i % space.cols
    const label = String.fromCharCode(65 + row) + String(col + 1).padStart(2, '0')

    let type = 'Standard'
    if (space.type === 'Individual Cabin') type = 'Cabin'
    else if (row === space.rows - 1 && col === 0) type = 'Accessible'
    else if (col === 0 || col === space.cols - 1) type = 'Window'
    else if (col === 1) type = 'Charging'
    else if (row === 0) type = 'Silent'

    let state = 'available'
    const r = rng()
    if (r < 0.45) state = 'occupied'
    else if (r < 0.55) state = 'reserved'
    else if (r < 0.58) state = 'disabled'

    seats.push({
      id: uid('seat'),
      label,
      type,
      state,
      row,
      col,
    })
  }

  return seats
}

export const mockSpaces = spaceTemplates.map((s, idx) => {
  const seats = generateSeats(s)
  const occupied = seats.filter((seat) => seat.state === 'occupied').length
  const reserved = seats.filter((seat) => seat.state === 'reserved').length
  const available = seats.filter((seat) => seat.state === 'available').length
  const occupancyPercent = Math.round((occupied / seats.length) * 100)

  let availability = 'Available'
  if (occupancyPercent >= 90) availability = 'Full'
  else if (occupancyPercent >= 70) availability = 'Crowded'
  else if (occupancyPercent >= 40) availability = 'Moderate'

  return {
    id: uid('space'),
    ...s,
    seats,
    occupiedCount: occupied,
    reservedCount: reserved,
    availableCount: available,
    occupancyPercent,
    availability,
    distance: Math.round((0.05 + idx * 0.03) * 100) / 100,
    reviewCount: Math.floor(20 + idx * 7),
  }
})

export const mockStudents = [
  {
    id: 'usr_student',
    name: 'Aarav Sharma',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    studentId: 'CS21B001',
    department: 'CSE',
    year: '3rd Year',
    preferences: {
      quietness: 30,
      availability: 25,
      facilities: 20,
      distance: 15,
      rating: 10,
    },
    favoriteFacilities: ['Wi-Fi', 'AC', 'Charging'],
    studyStyle: 'Individual',
  },
  {
    id: 'usr_student2',
    name: 'Priya Patel',
    email: 'priya@demo.com',
    password: 'student123',
    role: 'student',
    studentId: 'EC22B042',
    department: 'ECE',
    year: '2nd Year',
    preferences: {
      quietness: 20,
      availability: 30,
      facilities: 15,
      distance: 20,
      rating: 15,
    },
    favoriteFacilities: ['Wi-Fi', 'Natural light'],
    studyStyle: 'Group',
  },
  {
    id: 'usr_student3',
    name: 'Rohan Gupta',
    email: 'rohan@demo.com',
    password: 'student123',
    role: 'student',
    studentId: 'ME20B015',
    department: 'Mechanical',
    year: '4th Year',
    preferences: {
      quietness: 25,
      availability: 25,
      facilities: 25,
      distance: 10,
      rating: 15,
    },
    favoriteFacilities: ['AC', 'Power outlets', 'Charging'],
    studyStyle: 'Individual',
  },
]

export const mockAdmins = [
  {
    id: 'usr_admin',
    name: 'Dr. Kavitha Rao',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
    staffId: 'ADMIN001',
    department: 'Library Services',
  },
]

export const mockExams = [
  {
    id: uid('exam'),
    studentId: 'usr_student',
    subject: 'Data Structures & Algorithms',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('exam'),
    studentId: 'usr_student',
    subject: 'Operating Systems',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('exam'),
    studentId: 'usr_student',
    subject: 'Database Management Systems',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockReviews = [
  {
    id: uid('rev'),
    spaceId: mockSpaces[0].id,
    studentId: 'usr_student2',
    studentName: 'Priya Patel',
    ratings: { Overall: 5, Cleanliness: 5, Noise: 4, 'Wi-Fi': 5, Comfort: 4, Facilities: 5 },
    comment: 'Excellent environment for focused study. The natural light makes a big difference.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('rev'),
    spaceId: mockSpaces[0].id,
    studentId: 'usr_student3',
    studentName: 'Rohan Gupta',
    ratings: { Overall: 4, Cleanliness: 4, Noise: 5, 'Wi-Fi': 4, Comfort: 5, Facilities: 4 },
    comment: 'Very quiet and well-maintained. Wi-Fi can be spotty during peak hours.',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('rev'),
    spaceId: mockSpaces[2].id,
    studentId: 'usr_student2',
    studentName: 'Priya Patel',
    ratings: { Overall: 5, Cleanliness: 5, Noise: 5, 'Wi-Fi': 5, Comfort: 5, Facilities: 4 },
    comment: 'The strict silence policy really works. Best place for deep focus.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('rev'),
    spaceId: mockSpaces[5].id,
    studentId: 'usr_student3',
    studentName: 'Rohan Gupta',
    ratings: { Overall: 5, Cleanliness: 5, Noise: 5, 'Wi-Fi': 5, Comfort: 5, Facilities: 5 },
    comment: 'Individual cabins are perfect for exam prep. Highly recommend.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockIssues = [
  {
    id: uid('iss'),
    type: 'Wi-Fi problem',
    description: 'Wi-Fi signal is very weak in the corner seats near the window.',
    spaceId: mockSpaces[0].id,
    spaceName: mockSpaces[0].name,
    seat: 'A03',
    studentId: 'usr_student2',
    studentName: 'Priya Patel',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('iss'),
    type: 'AC problem',
    description: 'Air conditioning is not working properly, it gets very warm in the afternoon.',
    spaceId: mockSpaces[1].id,
    spaceName: mockSpaces[1].name,
    seat: 'B02',
    studentId: 'usr_student3',
    studentName: 'Rohan Gupta',
    status: 'Reported',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('iss'),
    type: 'Broken furniture',
    description: 'One of the chairs (row C, seat 3) has a broken backrest.',
    spaceId: mockSpaces[4].id,
    spaceName: mockSpaces[4].name,
    seat: 'C03',
    studentId: 'usr_student',
    studentName: 'Aarav Sharma',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockWaitlists = [
  {
    id: uid('wl'),
    spaceId: mockSpaces[5].id,
    spaceName: mockSpaces[5].name,
    studentId: 'usr_student',
    studentName: 'Aarav Sharma',
    position: 1,
    joinedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'waiting',
  },
  {
    id: uid('wl'),
    spaceId: mockSpaces[5].id,
    spaceName: mockSpaces[5].name,
    studentId: 'usr_student3',
    studentName: 'Rohan Gupta',
    position: 2,
    joinedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'waiting',
  },
  {
    id: uid('wl'),
    spaceId: mockSpaces[2].id,
    spaceName: mockSpaces[2].name,
    studentId: 'usr_student2',
    studentName: 'Priya Patel',
    position: 3,
    joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'waiting',
  },
]

export const mockNotifications = [
  {
    id: uid('notif'),
    studentId: 'usr_student',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your seat A05 at Central Library — Reading Hall has been reserved.',
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: uid('notif'),
    studentId: 'usr_student',
    type: 'waitlist_available',
    title: 'Waitlist Update',
    message: 'A seat may become available at Reading Hall — Individual Cabins. You are #1 in the waitlist.',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: uid('notif'),
    studentId: 'usr_student',
    type: 'issue_resolved',
    title: 'Issue Resolved',
    message: 'Your reported issue about broken furniture at Hostel — Reading Room has been resolved.',
    read: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
]