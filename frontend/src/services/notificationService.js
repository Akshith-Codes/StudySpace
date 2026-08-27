import { mockNotifications } from '../data/mockData'

const NOTIF_KEY = 'studyspace_notifications'

function getNotifications() {
  const stored = localStorage.getItem(NOTIF_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(NOTIF_KEY, JSON.stringify(mockNotifications))
  return mockNotifications
}

function saveNotifications(notifs) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs))
}

export const notificationService = {
  async getByStudent(studentId) {
    await new Promise((r) => setTimeout(r, 150))
    return getNotifications()
      .filter((n) => n.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async create(data) {
    const notifs = getNotifications()
    const notif = {
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...data,
    }
    notifs.push(notif)
    saveNotifications(notifs)
    return notif
  },

  async markRead(id) {
    const notifs = getNotifications()
    const idx = notifs.findIndex((n) => n.id === id)
    if (idx !== -1) {
      notifs[idx].read = true
      saveNotifications(notifs)
    }
  },

  async markAllRead(studentId) {
    const notifs = getNotifications()
    notifs.forEach((n) => {
      if (n.studentId === studentId) n.read = true
    })
    saveNotifications(notifs)
  },
}
