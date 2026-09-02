import { Link } from 'react-router-dom'
import { BookOpen, Search, QrCode, Bell } from 'lucide-react'
import OccupancyBar from '../components/OccupancyBar'
import StatusBadge from '../components/StatusBadge'

const SAMPLE_ROOMS = [
  { name: 'Library — Floor 3, Quiet Room', occupied: 6, total: 24, availability: 'Available' },
  { name: 'Innovation Hub — Pod B', occupied: 17, total: 20, availability: 'Crowded' },
  { name: 'Science Commons — Group Table 4', occupied: 9, total: 12, availability: 'Moderate' },
]

const FEATURES = [
  {
    icon: Search,
    title: 'See what\u2019s actually free',
    body: 'Occupancy updates in real time, room by room and seat by seat, so you stop walking floors hoping for a spot.',
  },
  {
    icon: QrCode,
    title: 'Reserve it, then prove it',
    body: 'Book a seat in advance and check in with a QR scan when you arrive. No app-switching, no front-desk line.',
  },
  {
    icon: Bell,
    title: 'Never lose a spot to a no-show',
    body: 'Miss your check-in window and your seat automatically releases to the next student on the waitlist.',
  },
]

const STEPS = [
  { n: '1', title: 'Search', body: 'Filter by building, noise level, or the outlets and monitors you need.' },
  { n: '2', title: 'Reserve', body: 'Pick a seat and a time. Your spot is held until your check-in window closes.' },
  { n: '3', title: 'Check in', body: 'Scan the QR code at the seat. Leave early and it opens right back up.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-success-600" />
            <span className="font-display text-sm font-semibold text-neutral-900">StudySpace</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary">Create account</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-neutral-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
              Stop wandering the library hoping for a seat.
            </h1>
            <p className="mt-4 max-w-md text-base text-neutral-300">
              StudySpace tracks real seat availability across campus, lets you reserve one ahead of time,
              and holds it with a QR check-in — so you spend your time studying, not searching.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-6 py-2.5 text-base">Create account</Link>
              <Link to="/login" className="btn bg-white/10 px-6 py-2.5 text-base text-white hover:bg-white/20">Log in</Link>
            </div>
          </div>

          {/* Hero object: a live-looking occupancy readout, the actual product in miniature */}
          <div className="card border-neutral-700 bg-neutral-800 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-300">Right now on campus</span>
              <span className="num text-xs text-neutral-500">updated 2 min ago</span>
            </div>
            <div className="space-y-5">
              {SAMPLE_ROOMS.map((room) => (
                <div key={room.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-sm text-neutral-200">{room.name}</span>
                    <StatusBadge status={room.availability} />
                  </div>
                  <OccupancyBar occupied={room.occupied} total={room.total} showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-neutral-900">Built around one question: is there a seat?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-success-50">
                <f.icon size={18} className="text-success-700" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — a genuine sequence, so numbering earns its place */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-neutral-900">From search to seated in three steps</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-4">
                <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-900 text-sm font-semibold text-white">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-neutral-900">Find your space. Focus on what matters.</h2>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-2.5 text-base">Create account</Link>
          <Link to="/login" className="btn-secondary px-6 py-2.5 text-base">Log in</Link>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-8 text-center text-xs text-neutral-400">
        StudySpace — built for students who'd rather study than search.
      </footer>
    </div>
  )
}