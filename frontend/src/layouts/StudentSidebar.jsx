import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Map, CalendarCheck, Clock, Star, AlertCircle, User, LogOut, BookOpen, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/spaces', label: 'Find a Space', icon: Search },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/waitlist', label: 'Waitlist', icon: Clock },
  { to: '/recommendations', label: 'Recommendations', icon: Star },
  { to: '/issues', label: 'Issues', icon: AlertCircle },
]

export default function StudentSidebar() {
  const { user, logout } = useAuth()
  const { notifications } = useApp()
  const navigate = useNavigate()
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-neutral-900 lg:flex">
      <div className="flex items-center gap-2 px-5 py-4">
        <BookOpen size={20} className="text-success-500" />
        <span className="font-display text-sm font-semibold text-white">StudySpace</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-l-success-500 bg-white/5 font-medium text-white'
                  : 'border-l-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-100'
              }`
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
            {item.to === '/waitlist' && unreadCount > 0 && (
              <span className="num ml-auto rounded-sm bg-success-600 px-1.5 py-0.5 text-2xs text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors ${
              isActive ? 'border-l-success-500 bg-white/5 font-medium text-white' : 'border-l-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-100'
            }`
          }
        >
          <User size={16} />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md border-l-[3px] border-l-transparent px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}