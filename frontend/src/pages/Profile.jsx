import { useState } from 'react'
import { User, Mail, Hash, Building, GraduationCap, Save, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { DEPARTMENTS, YEARS, FACILITIES } from '../types/constants'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { addToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    department: user.department,
    year: user.year,
    studyStyle: user.studyStyle || 'Individual',
    favoriteFacilities: user.favoriteFacilities || [],
  })

  const handleSave = () => {
    updateProfile(form)
    setEditing(false)
    addToast('success', 'Profile Updated', 'Your profile has been saved.')
  }

  const toggleFacility = (f) => {
    setForm((prev) => ({
      ...prev,
      favoriteFacilities: prev.favoriteFacilities.includes(f)
        ? prev.favoriteFacilities.filter((x) => x !== f)
        : [...prev.favoriteFacilities, f],
    }))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary">Edit Profile</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary"><Save size={16} /> Save</button>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
            <span className="text-xl font-semibold text-primary-600">{user.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{user.name}</h2>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Personal Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" icon={User} value={form.name} editing={editing} onChange={(v)=>setForm({...form, name: v})} />
          <Field label="Email" icon={Mail} value={form.email} editing={editing} onChange={(v)=>setForm({...form, email: v})} />
          <Field label="Student ID" icon={Hash} value={form.studentId} editing={editing} onChange={(v)=>setForm({...form, studentId: v})} />
          <div>
            <label className="label">Department</label>
            {editing ? (
              <select value={form.department} onChange={(e)=>setForm({...form, department: e.target.value})} className="input">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-neutral-900"><Building size={14} className="text-neutral-400" /> {user.department}</p>
            )}
          </div>
          <div>
            <label className="label">Year</label>
            {editing ? (
              <select value={form.year} onChange={(e)=>setForm({...form, year: e.target.value})} className="input">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-neutral-900"><GraduationCap size={14} className="text-neutral-400" /> {user.year}</p>
            )}
          </div>
          <div>
            <label className="label">Study Style</label>
            {editing ? (
              <select value={form.studyStyle} onChange={(e)=>setForm({...form, studyStyle: e.target.value})} className="input">
                <option value="Individual">Individual</option>
                <option value="Group">Group</option>
              </select>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-neutral-900"><BookOpen size={14} className="text-neutral-400" /> {user.studyStyle || 'Individual'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Preferred Facilities</h3>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map((f) => {
            const selected = form.favoriteFacilities.includes(f)
            return (
              <button
                key={f}
                onClick={() => editing && toggleFacility(f)}
                disabled={!editing}
                className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  selected
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 text-neutral-600'
                } ${!editing ? 'cursor-default' : 'hover:bg-neutral-50'}`}
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, value, editing, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      {editing ? (
        <input value={value} onChange={(e)=>onChange(e.target.value)} className="input" />
      ) : (
        <p className="flex items-center gap-1.5 text-sm text-neutral-900"><Icon size={14} className="text-neutral-400" /> {value}</p>
      )}
    </div>
  )
}
