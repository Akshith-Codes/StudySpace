import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e, demoEmail, demoPassword) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(demoEmail || email, demoPassword || password)
      if (user.role !== 'admin') {
        setError('This account does not have admin access.')
        return
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to log in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <Shield size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Admin Portal</h1>
          <p className="mt-1 text-sm text-neutral-500">StudySpace AI Administration</p>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="input pl-9" placeholder="admin@university.edu" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="input pl-9" placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in...' : 'Login'}</button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">or try demo</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <button onClick={() => handleSubmit(null, 'admin@demo.com', 'admin123')} disabled={loading} className="btn-secondary w-full">
            Demo Admin Login
          </button>

          <p className="mt-4 text-center text-xs">
            <Link to="/login" className="text-primary-600 hover:underline">Student Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
