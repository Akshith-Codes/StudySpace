import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Auth pages
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import AdminLogin from '../pages/AdminLogin'
import Home from '../pages/Home'

// Layouts
import StudentLayout from '../layouts/StudentLayout'
import AdminLayout from '../layouts/AdminLayout'

// Student pages
import Dashboard from '../pages/Dashboard'
import FindSpaces from '../pages/FindSpaces'
import SpaceDetails from '../pages/SpaceDetails'
import BookingFlow from '../pages/BookingFlow'
import Bookings from '../pages/Bookings'
import BookingDetail from '../pages/BookingDetail'
import CheckIn from '../pages/CheckIn'
import CampusMap from '../pages/CampusMap'
import Waitlist from '../pages/Waitlist'
import Recommendations from '../pages/Recommendations'
import Reviews from '../pages/Reviews'
import Issues from '../pages/Issues'
import Profile from '../pages/Profile'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminSpaces from '../pages/admin/AdminSpaces'
import AdminSeats from '../pages/admin/AdminSeats'
import AdminBookings from '../pages/admin/AdminBookings'
import AdminOccupancy from '../pages/admin/AdminOccupancy'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminIssues from '../pages/admin/AdminIssues'
import AdminReviews from '../pages/admin/AdminReviews'
import AdminAnalytics from '../pages/admin/AdminAnalytics'

function StudentRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="skeleton h-8 w-8 rounded-full" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'student') return <Navigate to="/admin/dashboard" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="skeleton h-8 w-8 rounded-full" /></div>
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function HomeRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="skeleton h-8 w-8 rounded-full" /></div>
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />
  return <Home />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Public landing */}
      <Route path="/" element={<HomeRoute />} />

      {/* Student */}
      <Route element={<StudentRoute><StudentLayout /></StudentRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/spaces" element={<FindSpaces />} />
        <Route path="/spaces/:id" element={<SpaceDetails />} />
        <Route path="/book/:id" element={<BookingFlow />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/map" element={<CampusMap />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/spaces" element={<AdminSpaces />} />
        <Route path="/admin/seats" element={<AdminSeats />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/occupancy" element={<AdminOccupancy />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/issues" element={<AdminIssues />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}