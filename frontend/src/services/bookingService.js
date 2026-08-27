import { mockBookings } from '../data/mockBookings'
import { spaceService } from './spaceService'

const BOOKINGS_KEY = 'studyspace_bookings'

function getBookings() {
  const stored = localStorage.getItem(BOOKINGS_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(mockBookings))
  return mockBookings
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export const bookingService = {
  async getByStudent(studentId) {
    await new Promise((r) => setTimeout(r, 300))
    return getBookings()
      .filter((b) => b.studentId === studentId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  },

  async getAll() {
    await new Promise((r) => setTimeout(r, 300))
    return getBookings().sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  },

  async getById(id) {
    await new Promise((r) => setTimeout(r, 200))
    return getBookings().find((b) => b.id === id)
  },

  async create(data) {
    const bookings = getBookings()
    const booking = {
      id: `booking_${Date.now()}`,
      status: 'Upcoming',
      checkedIn: false,
      checkedOut: false,
      createdAt: new Date().toISOString(),
      ...data,
    }
    bookings.push(booking)
    saveBookings(bookings)
    await spaceService.updateSeatState(data.spaceId, data.seatId, 'reserved')
    return booking
  },

  async cancel(id) {
    const bookings = getBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    bookings[idx].status = 'Cancelled'
    bookings[idx].cancelledAt = new Date().toISOString()
    saveBookings(bookings)
    await spaceService.updateSeatState(bookings[idx].spaceId, bookings[idx].seatId, 'available')
    return bookings[idx]
  },

  async checkIn(id) {
    const bookings = getBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    bookings[idx].checkedIn = true
    bookings[idx].status = 'Active'
    bookings[idx].checkInTime = new Date().toISOString()
    saveBookings(bookings)
    await spaceService.updateSeatState(bookings[idx].spaceId, bookings[idx].seatId, 'occupied')
    return bookings[idx]
  },

  async checkOut(id) {
    const bookings = getBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    bookings[idx].checkedOut = true
    bookings[idx].status = 'Completed'
    bookings[idx].checkOutTime = new Date().toISOString()
    saveBookings(bookings)
    await spaceService.updateSeatState(bookings[idx].spaceId, bookings[idx].seatId, 'available')
    return bookings[idx]
  },

  async markNoShow(id) {
    const bookings = getBookings()
    const idx = bookings.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('Booking not found')
    bookings[idx].status = 'No-show'
    saveBookings(bookings)
    await spaceService.updateSeatState(bookings[idx].spaceId, bookings[idx].seatId, 'available')
    return bookings[idx]
  },

  async getByStudentSync(studentId) {
    return getBookings()
      .filter((b) => b.studentId === studentId)
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
  },

  getAllSync() {
    return getBookings()
  },
}
