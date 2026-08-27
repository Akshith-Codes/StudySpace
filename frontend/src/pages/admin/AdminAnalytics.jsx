import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingState from '../../components/LoadingState'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1a4cff', '#10b981', '#f59e0b', '#ef4444', '#737373', '#3366ff', '#6ee7b7']

export default function AdminAnalytics() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [occupancyByHour, popularSpaces, trends, utilization] = await Promise.all([
        adminService.getOccupancyByHour(),
        adminService.getPopularSpaces(),
        adminService.getOccupancyTrends(),
        adminService.getSpaceUtilization(),
      ])
      setData({ occupancyByHour, popularSpaces, trends, utilization })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={4} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500">Usage trends and insights across campus study spaces.</p>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Peak Hours</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.occupancyByHour}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
            <Line type="monotone" dataKey="occupancy" stroke="#1a4cff" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">Occupancy Trends (7 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
              <Line type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">Space Utilization</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.utilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
              <Bar dataKey="utilization" fill="#1a4cff" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Most Popular Spaces</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.popularSpaces} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={140} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e5e5' }} />
            <Bar dataKey="bookings" fill="#f59e0b" radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
