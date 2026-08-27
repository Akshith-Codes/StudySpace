import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <BookOpen size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Reset Password</h1>
        </div>

        <div className="card p-6">
          {sent ? (
            <div className="text-center">
              <p className="text-sm text-neutral-600">
                If an account exists for <span className="font-medium text-neutral-900">{email}</span>, a password reset link has been sent.
              </p>
              <Link to="/login" className="btn-secondary mt-4">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-9" placeholder="you@university.edu" required />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Send Reset Link</button>
              <p className="text-center text-xs text-neutral-500">
                <Link to="/login" className="text-primary-600 hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
