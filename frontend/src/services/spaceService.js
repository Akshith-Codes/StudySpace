import { mockSpaces } from '../data/mockData'

const SPACES_KEY = 'studyspace_spaces'

function getSpaces() {
  const stored = localStorage.getItem(SPACES_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(SPACES_KEY, JSON.stringify(mockSpaces))
  return mockSpaces
}

function saveSpaces(spaces) {
  localStorage.setItem(SPACES_KEY, JSON.stringify(spaces))
}

export const spaceService = {
  async getAll() {
    await new Promise((r) => setTimeout(r, 300))
    return getSpaces()
  },

  async getById(id) {
    await new Promise((r) => setTimeout(r, 200))
    return getSpaces().find((s) => s.id === id)
  },

  async create(data) {
    const spaces = getSpaces()
    const newSpace = { id: `space_${Date.now()}`, reviewCount: 0, ...data }
    spaces.push(newSpace)
    saveSpaces(spaces)
    return newSpace
  },

  async update(id, updates) {
    const spaces = getSpaces()
    const idx = spaces.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Space not found')
    spaces[idx] = { ...spaces[idx], ...updates }
    saveSpaces(spaces)
    return spaces[idx]
  },

  async remove(id) {
    const spaces = getSpaces().filter((s) => s.id !== id)
    saveSpaces(spaces)
  },

  async updateSeatState(spaceId, seatId, state) {
    const spaces = getSpaces()
    const space = spaces.find((s) => s.id === spaceId)
    if (!space) return
    const seat = space.seats.find((s) => s.id === seatId)
    if (!seat) return
    seat.state = state
    space.occupiedCount = space.seats.filter((s) => s.state === 'occupied').length
    space.reservedCount = space.seats.filter((s) => s.state === 'reserved').length
    space.availableCount = space.seats.filter((s) => s.state === 'available').length
    space.occupancyPercent = Math.round((space.occupiedCount / space.seats.length) * 100)
    let availability = 'Available'
    if (space.occupancyPercent >= 90) availability = 'Full'
    else if (space.occupancyPercent >= 70) availability = 'Crowded'
    else if (space.occupancyPercent >= 40) availability = 'Moderate'
    space.availability = availability
    saveSpaces(spaces)
    return space
  },

  async updateSeats(spaceId, seats) {
    const spaces = getSpaces()
    const space = spaces.find((s) => s.id === spaceId)
    if (!space) return
    space.seats = seats
    space.capacity = seats.length
    space.occupiedCount = seats.filter((s) => s.state === 'occupied').length
    space.reservedCount = seats.filter((s) => s.state === 'reserved').length
    space.availableCount = seats.filter((s) => s.state === 'available').length
    space.occupancyPercent = Math.round((space.occupiedCount / seats.length) * 100)
    let availability = 'Available'
    if (space.occupancyPercent >= 90) availability = 'Full'
    else if (space.occupancyPercent >= 70) availability = 'Crowded'
    else if (space.occupancyPercent >= 40) availability = 'Moderate'
    space.availability = availability
    saveSpaces(spaces)
    return space
  },

  getAllSync() {
    return getSpaces()
  },

  getByIdSync(id) {
    return getSpaces().find((s) => s.id === id)
  },
}
