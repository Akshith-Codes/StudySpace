import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) setUser(currentUser)
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const { user: u } = await authService.login(email, password)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (data) => {
    const { user: u } = await authService.register(data)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    const updated = authService.updateProfile(user.id, updates)
    setUser(updated)
    return updated
  }, [user])

  const value = { user, loading, login, register, logout, updateProfile, setUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
