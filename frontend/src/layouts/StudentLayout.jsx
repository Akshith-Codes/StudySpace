import { Outlet } from 'react-router-dom'
import StudentSidebar from './StudentSidebar'
import MobileNav from './MobileNav'
import ToastContainer from '../components/ToastContainer'

export default function StudentLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <StudentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
