// Admin service — aggregates data across all entities for admin views.

import { spaceService } from './spaceService'
import { bookingService } from './bookingService'
import { issueService } from './issueService'
import { reviewService } from './reviewService'
import { mockStudents } from '../data/mockData'

const STUDENTS_KEY = 'studyspace_students'

function getStudents() {
  const stored = localStorage.getItem(STUDENTS_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(mockStudents))
  return mockStudents
}

export const adminService = {
  async getStats() {
    await new Promise((r) => setTimeout(r, 300))
    const spaces = spaceService.getAllSync()
    const bookings = bookingService.getAllSync()
    const students = getStudents()

    const totalSeats = spaces.reduce((sum, s) => sum + s.capacity, 0)
    const occupiedSeats = spaces.reduce((sum, s) => sum + s.occupiedCount, 0)
    const activeBookings = bookings.filter((b) => b.status === 'Active').length
    const todayBookings = bookings.filter((b) => {
      const d = new Date(b.startTime)
      const today = new Date()
      return d.toDateString() === today.toDateString()
    }).length
    const noShowBookings = bookings.filter((b) => b.status === 'No-show').length
    const noShowRate = bookings.length > 0 ? Math.round((noShowBookings / bookings.length) * 100) : 0

    return {
      totalStudents: students.length,
      totalSpaces: spaces.length,
      totalSeats,
      activeBookings,
      currentOccupancy: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
      todayBookings,
      noShowRate,
    }
  },

  async getOccupancyByHour() {
    await new Promise((r) => setTimeout(r, 200))
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const currentHour = new Date().getHours()
    return hours.map((h) => {
      let occupancy
      if (h < currentHour) {
        occupancy = Math.round(30 + Math.sin(h * 0.5) * 25 + (h > 9 && h < 17 ? 20 : 0))
      } else if (h === currentHour) {
        const spaces = spaceService.getAllSync()
        const totalSeats = spaces.reduce((sum, s) => sum + s.capacity, 0)
        const occupied = spaces.reduce((sum, s) => sum + s.occupiedCount, 0)
        occupancy = totalSeats > 0 ? Math.round((occupied / totalSeats) * 100) : 0
      } else {
        occupancy = Math.round(30 + Math.sin(h * 0.5) * 25 + (h > 9 && h < 17 ? 20 : 0))
      }
      return { hour: `${h} ${h < 12 ? 'AM' : 'PM'}`, occupancy: Math.min(95, Math.max(5, occupancy)) }
    })
  },

  async getBookingsPerDay() {
    await new Promise((r) => setTimeout(r, 200))
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((d, i) => ({
      day: d,
      bookings: Math.round(15 + Math.sin(i * 0.8) * 10 + (i < 5 ? 15 : -5)),
    }))
  },

  async getPopularSpaces() {
    await new Promise((r) => setTimeout(r, 200))
    const spaces = spaceService.getAllSync()
    return spaces
      .map((s) => ({ name: s.name, bookings: s.reviewCount + Math.floor(s.occupancyPercent / 2), occupancy: s.occupancyPercent }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5)
  },

  async getOccupancyTrends() {
    await new Promise((r) => setTimeout(r, 200))
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        occupancy: Math.round(40 + Math.sin(i * 0.8) * 20 + Math.random() * 10),
      })
    }
    return days
  },

  async getSpaceUtilization() {
    await new Promise((r) => setTimeout(r, 200))
    const spaces = spaceService.getAllSync()
    return spaces.map((s) => ({
      name: s.name.length > 20 ? s.name.slice(0, 20) + '...' : s.name,
      utilization: s.occupancyPercent,
    }))
  },

  async getAllStudents() {
    await new Promise((r) => setTimeout(r, 200))
    return getStudents().map(({ password, ...rest }) => rest)
  },
}
