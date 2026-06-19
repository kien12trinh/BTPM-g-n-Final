import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/transactions/new', icon: 'add_box', label: 'Giao dịch' },
  { to: '/analytics', icon: 'analytics', label: 'Phân tích' },
  { to: '/categories', icon: 'savings', label: 'Danh mục & Tiết kiệm' },
]

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login'); 
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen py-6 bg-[#eff4ff] border-r border-[#bccac0] fixed left-0 top-0 w-64 z-50">
      <div className="text-headline-md font-bold text-[#006948] px-4 mb-4">
        Quản lý tài chính
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 mx-2 rounded-lg transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#d5e0f8] text-[#586377]'
                  : 'text-[#3d4a42] hover:bg-[#d3e4fe]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                  {icon}
                </span>
                <span className={`text-body-md ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#bccac0] pt-4 space-y-1">
        <a
          href="#"
          className="flex items-center gap-4 text-[#3d4a42] px-4 py-3 mx-2 hover:bg-[#d3e4fe] rounded-lg transition-all"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-body-md">Trợ giúp</span>
        </a>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          className="flex items-center gap-4 text-[#3d4a42] px-4 py-3 mx-2 hover:bg-[#d3e4fe] rounded-lg transition-all" 
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-body-md">Đăng xuất</span>
        </a> 
      </div>
    </aside>
  )
}