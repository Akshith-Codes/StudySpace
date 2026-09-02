import { useState, useEffect } from 'react'
import { Users, Building2, Armchair, CalendarCheck, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import { adminService } from '../../services/adminService'
import StatCard from '../../components/StatCard'
import LoadingState from '../../components/LoadingState'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const CHART_COLORS = ['#2f5c8a', '#1e7a54', '#c1791f', '#a83a32', '#7a7466']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [occupancyByHour, setOccupancyByHour] = useState([])
  const [bookingsPerDay, setBookingsPerDay] = useState([])
  const [popularSpaces, setPopularSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [s, obh, bpd, ps] = await Promise.all([
        adminService.getStats(),
        adminService.getOccupancyByHour(),
        adminService.getBookingsPerDay(),
        adminService.getPopularSpaces(),
      ])
      setStats(s)
      setOccupancyByHour(obh)
      setBookingsPerDay(bpd)
      setPopularSpaces(ps)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={4} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Overview of campus study space utilization.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Students" value={stats.totalStudents} color="primary" />
        <StatCard icon={Building2} label="Spaces" value={stats.totalSpaces} color="success" />
        <StatCard icon={Armchair} label="Total Seats" value={stats.totalSeats} color="neutral" />
        <StatCard icon={CalendarCheck} label="Active Bookings" value={stats.activeBookings} color="warning" />
        <StatCard icon={Activity} label="Current Occupancy" value={`${stats.currentOccupancy}%`} color="primary" />
        <StatCard icon={CalendarCheck} label="Today's Bookings" value={stats.todayBookings} color="success" />
        <StatCard icon={AlertCircle} label="No-show Rate" value={`${stats.noShowRate}%`} color="error" />
        <StatCard icon={TrendingUp} label="Utilization" value={`${stats.currentOccupancy}%`} color="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">Occupancy by Hour</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occupancyByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e1ded7' }} />
              <Bar dataKey="occupancy" fill="#2f5c8a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">Bookings per Day</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bookingsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e1ded7' }} />
              <Bar dataKey="bookings" fill="#1e7a54" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Popular Spaces</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={popularSpaces} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={120} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e1ded7' }} />
            <Bar dataKey="bookings" fill="#2f5c8a" radius={[0,3,3,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}