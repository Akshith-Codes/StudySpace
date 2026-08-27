import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])

  const loadNotifications = useCallback(async () => {
    if (!user || user.role !== 'student') return
    const notifs = await notificationService.getByStudent(user.id)
    setNotifications(notifs)
  }, [user])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const addToast = useCallback((type, title, message) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushNotification = useCallback(
    async (type, title, message) => {
      if (!user || user.role !== 'student') return
      const notif = await notificationService.create({ studentId: user.id, type, title, message })
      setNotifications((prev) => [notif, ...prev])
      addToast(type, title, message)
    },
    [user, addToast],
  )

  const markNotificationRead = useCallback(async (id) => {
    await notificationService.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [user?.id])

  const markAllNotificationsRead = useCallback(async () => {
    if (!user) return
    await notificationService.markAllRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [user?.id])

  const value = {
    notifications,
    toasts,
    addToast,
    dismissToast,
    pushNotification,
    markNotificationRead,
    markAllNotificationsRead,
    loadNotifications,
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
