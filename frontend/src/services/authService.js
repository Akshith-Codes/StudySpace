// API-ready service layer.
// Currently uses mock data from localStorage.
// To connect to a backend, replace the mock implementations with Axios calls.
//
// Example future implementation:
//   import axios from 'axios'
//   const api = axios.create({ baseURL: '/api' })
//   export const authService = {
//     login: (email, password) => api.post('/auth/login', { email, password }).then(r => r.data),
//     register: (data) => api.post('/auth/register', data).then(r => r.data),
//     ...
//   }

import { mockStudents, mockAdmins } from '../data/mockData'
import { uid } from '../utils/helpers'

const SESSION_KEY = 'studyspace_session'
const USERS_KEY = 'studyspace_users'

function getUsers() {
  const stored = localStorage.getItem(USERS_KEY)
  if (stored) return JSON.parse(stored)
  const all = [...mockStudents, ...mockAdmins]
  localStorage.setItem(USERS_KEY, JSON.stringify(all))
  return all
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const authService = {
  async login(email, password) {
    await new Promise((r) => setTimeout(r, 400))
    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const session = { userId: user.id, token: uid('token'), expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    const { password: _, ...safeUser } = user
    return { user: safeUser, session }
  },

  async register(data) {
    await new Promise((r) => setTimeout(r, 400))
    const users = getUsers()
    if (users.find((u) => u.email === data.email)) throw new Error('Email already registered')
    const newUser = {
      id: uid('usr'),
      role: 'student',
      password: data.password,
      preferences: { quietness: 30, availability: 25, facilities: 20, distance: 15, rating: 10 },
      favoriteFacilities: [],
      studyStyle: 'Individual',
      ...data,
    }
    users.push(newUser)
    saveUsers(users)
    const session = { userId: newUser.id, token: uid('token'), expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    const { password: _, ...safeUser } = newUser
    return { user: safeUser, session }
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY)
  },

  getSession() {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null
    const session = JSON.parse(stored)
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  },

  getCurrentUser() {
    const session = this.getSession()
    if (!session) return null
    const users = getUsers()
    const user = users.find((u) => u.id === session.userId)
    if (!user) return null
    const { password: _, ...safeUser } = user
    return safeUser
  },

  updateProfile(userId, updates) {
    const users = getUsers()
    const idx = users.findIndex((u) => u.id === userId)
    if (idx === -1) throw new Error('User not found')
    users[idx] = { ...users[idx], ...updates }
    saveUsers(users)
    const { password: _, ...safeUser } = users[idx]
    return safeUser
  },
}
