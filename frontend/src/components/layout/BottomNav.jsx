import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/transactions/new', icon: 'add_circle', label: 'Giao dịch' },
  { to: '/analytics', icon: 'query_stats', label: 'Phân tích' },
  { to: '/categories', icon: 'account_balance_wallet', label: 'Tiết kiệm' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-[#f8f9ff] border-t border-[#bccac0] shadow-lg rounded-t-xl">
      {navItems.map(({ to, icon, label, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center transition-all active:scale-90 ${
              isActive
                ? 'bg-[#d5e0f8] text-[#586377] rounded-full px-4 py-1'
                : 'text-[#3d4a42]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                {icon}
              </span>
              <span className="text-label-caps mt-0.5">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
