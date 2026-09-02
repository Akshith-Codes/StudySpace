import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, Armchair, CalendarCheck, BarChart3, Users, AlertCircle, Star, LogOut, Shield, Activity } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/spaces', label: 'Spaces', icon: Building2 },
  { to: '/admin/seats', label: 'Seats', icon: Armchair },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/occupancy', label: 'Occupancy', icon: Activity },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/issues', label: 'Issues', icon: AlertCircle },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-neutral-900 lg:flex">
      <div className="flex items-center gap-2 px-5 py-4">
        <Shield size={20} className="text-primary-400" />
        <div>
          <span className="font-display text-sm font-semibold text-white">StudySpace</span>
          <p className="text-2xs text-neutral-500">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md border-l-[3px] px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'border-l-primary-400 bg-white/5 font-medium text-white'
                  : 'border-l-transparent text-neutral-400 hover:bg-white/5 hover:text-neutral-100'
              }`
            }
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-2">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-neutral-200">{user?.name || 'Admin'}</p>
          <p className="text-2xs text-neutral-500">{user?.email}</p>
        </div>
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