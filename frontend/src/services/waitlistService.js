import { mockWaitlists } from '../data/mockData'

const WAITLIST_KEY = 'studyspace_waitlist'

function getWaitlist() {
  const stored = localStorage.getItem(WAITLIST_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(mockWaitlists))
  return mockWaitlists
}

function saveWaitlist(waitlist) {
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlist))
}

export const waitlistService = {
  async getByStudent(studentId) {
    await new Promise((r) => setTimeout(r, 200))
    return getWaitlist().filter((w) => w.studentId === studentId)
  },

  async getBySpace(spaceId) {
    await new Promise((r) => setTimeout(r, 200))
    return getWaitlist()
      .filter((w) => w.spaceId === spaceId && w.status === 'waiting')
      .sort((a, b) => a.position - b.position)
  },

  async join(spaceId, spaceName, studentId, studentName) {
    const waitlist = getWaitlist()
    const existing = waitlist.find(
      (w) => w.spaceId === spaceId && w.studentId === studentId && w.status === 'waiting',
    )
    if (existing) return existing
    const spaceEntries = waitlist.filter((w) => w.spaceId === spaceId && w.status === 'waiting')
    const entry = {
      id: `wl_${Date.now()}`,
      spaceId,
      spaceName,
      studentId,
      studentName,
      position: spaceEntries.length + 1,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
    }
    waitlist.push(entry)
    saveWaitlist(waitlist)
    return entry
  },

  async leave(id) {
    const waitlist = getWaitlist().filter((w) => w.id !== id)
    saveWaitlist(waitlist)
  },

  async notifyNext(spaceId) {
    const waitlist = getWaitlist()
    const next = waitlist
      .filter((w) => w.spaceId === spaceId && w.status === 'waiting')
      .sort((a, b) => a.position - b.position)[0]
    if (next) {
      next.status = 'notified'
      next.notifiedAt = new Date().toISOString()
      saveWaitlist(waitlist)
    }
    return next
  },
}
