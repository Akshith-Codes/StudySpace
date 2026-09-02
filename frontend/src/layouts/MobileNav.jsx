import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Map, CalendarCheck, Clock, Star, AlertCircle, User, LogOut, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/spaces', label: 'Find a Space', icon: Search },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/waitlist', label: 'Waitlist', icon: Clock },
  { to: '/recommendations', label: 'Recommend', icon: Star },
  { to: '/issues', label: 'Issues', icon: AlertCircle },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function MobileNav() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-neutral-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-success-500" />
          <span className="font-display text-sm font-semibold text-white">StudySpace</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-md p-2 text-neutral-300 hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Slide-down menu */}
      {menuOpen && (
        <div className="border-b border-neutral-200 bg-white px-3 py-2 lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                  }`
                }
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </>
  )
}