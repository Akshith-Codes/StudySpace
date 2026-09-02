import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import ToastContainer from '../components/ToastContainer'

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile admin bar */}
        <div className="flex items-center justify-between bg-neutral-900 px-4 py-3 lg:hidden">
          <span className="font-display text-sm font-semibold text-white">Admin Portal</span>
        </div>
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
