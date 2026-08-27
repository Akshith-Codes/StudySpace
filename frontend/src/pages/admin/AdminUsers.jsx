import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import LoadingState from '../../components/LoadingState'

export default function AdminUsers() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await adminService.getAllStudents()
      setStudents(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingState count={3} />

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">User Management</h1>
        <p className="mt-1 text-sm text-neutral-500">View registered students.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Student ID</th>
              <th className="py-2 pr-4 font-medium">Department</th>
              <th className="py-2 pr-4 font-medium">Year</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-neutral-100">
                <td className="py-3 pr-4 font-medium text-neutral-900">{s.name}</td>
                <td className="py-3 pr-4 text-neutral-600">{s.email}</td>
                <td className="py-3 pr-4 text-neutral-600">{s.studentId}</td>
                <td className="py-3 pr-4 text-neutral-600">{s.department}</td>
                <td className="py-3 pr-4 text-neutral-600">{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
