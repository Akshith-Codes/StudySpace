import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, User, Mail, Lock, Hash, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { DEPARTMENTS, YEARS } from '../types/constants'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    department: 'CSE',
    year: '1st Year',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <BookOpen size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Create Account</h1>
          <p className="mt-1 text-sm text-neutral-500">Join StudySpace AI to find and reserve study spaces.</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={form.name} onChange={handleChange('name')} className="input pl-9" placeholder="Aarav Sharma" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="email" value={form.email} onChange={handleChange('email')} className="input pl-9" placeholder="you@university.edu" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="password" value={form.password} onChange={handleChange('password')} className="input pl-9" placeholder="••••••••" required />
              </div>
            </div>

            <div>
              <label className="label">Student ID / Roll Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={form.studentId} onChange={handleChange('studentId')} className="input pl-9" placeholder="CS21B001" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Department</label>
                <select value={form.department} onChange={handleChange('department')} className="input">
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select value={form.year} onChange={handleChange('year')} className="input">
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
