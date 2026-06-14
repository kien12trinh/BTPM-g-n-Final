import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-[#0b1c30]">
      <Sidebar />

      <div className="flex flex-col flex-1 lg:ml-64">
        <Header />
        <main className="flex-1 pb-20 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
