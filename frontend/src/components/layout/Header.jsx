import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Tổng quan tài chính',
  '/transactions/new': 'Nhập giao dịch',
  '/analytics': 'Phân tích & Báo cáo',
  '/categories': 'Danh mục & Tiết kiệm',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Quản lý tài chính'

  return (
    <header className="flex justify-between items-center px-6 h-16 w-full sticky top-0 bg-[#f8f9ff] border-b border-[#bccac0] shadow-sm z-40">
      {/* Mobile brand */}
      <div className="lg:hidden text-headline-md font-bold text-[#006948]">
        Quản lý tài chính
      </div>
      {/* Desktop page title */}
      <div className="hidden lg:block text-title-sm text-[#006948]">{title}</div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-[#dce9ff] transition-all">
          <span className="material-symbols-outlined text-[#3d4a42]">notifications</span>
        </button>
        <button className="p-2 rounded-full hover:bg-[#dce9ff] transition-all">
          <span className="material-symbols-outlined text-[#3d4a42]">settings</span>
        </button>
      </div>
    </header>
  )
}
