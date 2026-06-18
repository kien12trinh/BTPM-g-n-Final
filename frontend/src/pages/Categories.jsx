import { useState, useEffect, useCallback } from 'react'
import { categoryApi, savingsApi, budgetApi, transactionApi } from '../api/client'
import GoalModal from '../components/savings/GoalModal'
import DepositModal from '../components/savings/DepositModal'

function formatVnd(n) {
  return Number(n).toLocaleString('vi-VN') + ' ₫'
}

// ── Category row ──────────────────────────────────────────────────
function CategoryRow({ cat, budgetAmount, currentAmount, onClick, onDelete }) {
  const isExpense = cat.type === 'expense'
  const isOverBudget = isExpense && budgetAmount > 0 && currentAmount >= budgetAmount

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-lg hover:bg-[#eff4ff] transition-colors group cursor-pointer`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-[#9b3e3b]/10' : 'bg-[#006948]/10'}`}>
          <span className={`material-symbols-outlined ${isExpense ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>{cat.icon}</span>
        </div>
        <div>
          <p className="text-body-lg font-semibold text-[#0b1c30]">{cat.name}</p>
          
          {/* Thông tin phụ hiển thị dưới tên danh mục */}
          {isExpense ? (
            <div className="text-xs font-medium mt-1 space-y-0.5">
              <p className="text-[#6d7a72]">
                Hạn mức báo động: {budgetAmount ? formatVnd(budgetAmount) : 'Chưa đặt'}
              </p>
              <p className={`transition-colors ${isOverBudget ? 'text-[#ba1a1a] font-bold' : 'text-[#9b3e3b]'}`}>
                Đã chi: {formatVnd(currentAmount || 0)}
                {isOverBudget && ' (Đạt/Vượt hạn mức!)'}
              </p>
            </div>
          ) : (
            <div className="text-xs font-medium mt-1 space-y-0.5">
              <p className="text-[#006948]">
                Đã thu: {formatVnd(currentAmount || 0)}
              </p>
            </div>
          )}

        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }} 
          className="p-2 hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-full text-[#3d4a42]"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  )
}

// ── Savings goal card ─────────────────────────────────────────────
function SavingsCard({ goal, onDeposit, onEdit, onDelete }) {
  const pct = goal.progress_pct ?? Math.round((goal.saved_amount / goal.target_amount) * 100)
  const isCompleted = goal.is_completed ?? pct >= 100

  return (
    <div className={`bg-white p-6 rounded-xl border shadow-[0px_4px_20px_rgba(30,41,59,0.05)] flex flex-col gap-3 relative overflow-hidden
      ${isCompleted ? 'border-[#006948]/40' : 'border-[#bccac0]'}`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {isCompleted && <span className="material-symbols-outlined icon-filled text-[#006948] text-[20px]">check_circle</span>}
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          isCompleted ? 'bg-[#006948] text-white' : pct >= 75 ? 'bg-[#d97706] text-white' : 'bg-[#dce9ff] text-[#006948]'
        }`}>
          {pct}%
        </span>
      </div>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-[#006948]/10 text-[#006948]' : 'bg-[#dce9ff] text-[#006948]'}`}>
          <span className="material-symbols-outlined text-[28px]">{goal.icon}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(goal)} className="p-1.5 hover:bg-[#dce9ff] rounded-full text-[#3d4a42]"><span className="material-symbols-outlined text-[18px]">edit</span></button>
          <button onClick={() => onDelete(goal.id)} className="p-1.5 hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-full text-[#3d4a42]"><span className="material-symbols-outlined text-[18px]">delete</span></button>
        </div>
      </div>
      <div>
        <h4 className="text-title-sm text-[#0b1c30]">{goal.name}</h4>
        {goal.deadline && <p className="text-body-md text-[#3d4a42]">Deadline: {new Date(goal.deadline).toLocaleDateString('vi-VN')}</p>}
      </div>
      <div className="mt-auto space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-number-xl text-[#006948]">{formatVnd(goal.target_amount)}</span>
          <span className="text-body-md text-[#3d4a42]">đã có {formatVnd(goal.saved_amount)}</span>
        </div>
        <div className="w-full h-2 bg-[#d3e4fe] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#006948] to-[#85f8c4] rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-label-caps text-[#3d4a42]">
          <span>Còn lại: {formatVnd(goal.remaining_amount ?? goal.target_amount - goal.saved_amount)}</span>
          <span>Mục tiêu: {formatVnd(goal.target_amount)}</span>
        </div>
      </div>
      {!isCompleted && (
        <button onClick={() => onDeposit(goal)} className="w-full mt-1 py-2 bg-[#006948] text-white rounded-lg text-label-caps hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Nạp tiền
        </button>
      )}
      {isCompleted && <div className="w-full mt-1 py-2 bg-[#006948]/10 text-[#006948] rounded-lg text-label-caps text-center font-semibold">Đã hoàn thành 🎉</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function Categories() {
  const [incomeCats, setIncomeCats]   = useState([])
  const [expenseCats, setExpenseCats] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)

  const [goals, setGoals]             = useState([])
  const [loadingGoals, setLoadingGoals] = useState(true)

  const [goalModal, setGoalModal]       = useState({ open: false, goal: null })
  const [depositModal, setDepositModal] = useState({ open: false, goal: null })

  // State Tạo Danh Mục
  const [createCatModal, setCreateCatModal] = useState({
    isOpen: false,
    name: '',
    type: 'expense', // Mặc định là chi tiêu
    icon: 'category'
  })

  // State Quản lý Dòng tiền
  const [totalFund, setTotalFund] = useState(0) // Tổng Thu
  const [totalExpense, setTotalExpense] = useState(0) // Tổng Chi
  const [budgets, setBudgets] = useState({}) // Hạn mức
  const [catTotals, setCatTotals] = useState({}) // Lưu số dư (Đã chi/Đã thu) của TỪNG danh mục
  
  const [catModal, setCatModal] = useState({ 
    isOpen: false, 
    category: null, 
    maxAmount: '', 
    txAmount: '', 
    txNote: '' 
  })
  
  const monthYear = new Date().toISOString().slice(0, 7)

  // 1. Tải Hạn mức
  useEffect(() => {
    if (!budgetApi?.getByMonth) return;
    budgetApi.getByMonth(monthYear).then(r => {
      const map = {}
      ;(r.data?.data || []).forEach(b => {
        map[b.category_id] = b.max_amount
      })
      setBudgets(map)
    }).catch(console.error)
  }, [monthYear])

  // 2. Quét & Phân loại Giao dịch
  const fetchTransactionsData = useCallback(async () => {
    if (!transactionApi?.getAll) return; 
    const [y, m] = monthYear.split('-');
    const lastDay = new Date(y, m, 0).getDate();
    const dateFrom = `${y}-${m}-01`;
    const dateTo = `${y}-${m}-${lastDay}`;

    try {
      const res = await transactionApi.getAll({ date_from: dateFrom, date_to: dateTo });
      const txs = res.data?.data || [];
      
      let sumIncome = 0;
      let sumExpense = 0;
      const mapTotals = {};

      txs.forEach(tx => {
        // Cộng dồn vào từng danh mục (bất kể thu hay chi)
        if (tx.category_id) {
          mapTotals[tx.category_id] = (mapTotals[tx.category_id] || 0) + Number(tx.amount);
        }
        // Tính toán Tổng Quỹ chung
        if (tx.type === 'income') {
          sumIncome += Number(tx.amount);
        } else if (tx.type === 'expense') {
          sumExpense += Number(tx.amount);
        }
      });

      setTotalFund(sumIncome);
      setTotalExpense(sumExpense);
      setCatTotals(mapTotals);
    } catch (e) { console.error(e) }
  }, [monthYear])

  useEffect(() => { fetchTransactionsData() }, [fetchTransactionsData])

  const remainingFund = totalFund - totalExpense

  // ── Fetch categories & goals ───────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const r = await categoryApi?.getAll?.()
      const cats = r.data?.data || []
      setIncomeCats(cats.filter((c) => c.type === 'income'))
      setExpenseCats(cats.filter((c) => c.type === 'expense'))
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingCats(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const fetchGoals = useCallback(async () => {
    if (!savingsApi?.getAll) return;
    try {
      const res = await savingsApi.getAll()
      setGoals(res.data?.data || [])
    } finally {
      setLoadingGoals(false)
    }
  }, [])
  useEffect(() => { fetchGoals() }, [fetchGoals])

  // ── Handlers ───────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!createCatModal.name || !categoryApi?.create) return;
    try {
      await categoryApi.create({
        name: createCatModal.name,
        type: createCatModal.type,
        icon: createCatModal.icon || 'category'
      });
      alert('✅ Tạo danh mục thành công!');
      setCreateCatModal({ isOpen: false, name: '', type: 'expense', icon: 'category' });
      fetchCategories(); // Làm mới danh sách danh mục
    } catch (e) {
      alert('❌ Lỗi khi tạo danh mục');
    }
  }

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Xoá danh mục này?')) return
    try {
      await categoryApi?.delete?.(id)
      setIncomeCats((c) => c.filter((x) => x.id !== id))
      setExpenseCats((c) => c.filter((x) => x.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể xoá')
    }
  }

  const handleCreateGoal = async (data) => {
    try {
      await savingsApi?.create?.(data)
      fetchGoals()
    } catch (e) { alert('Lỗi tạo mục tiêu') }
  }

  const handleUpdateGoal = async (data) => {
    try {
      await savingsApi?.update?.(goalModal.goal.id, data)
      fetchGoals()
    } catch (e) { alert('Lỗi cập nhật mục tiêu') }
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Xoá mục tiêu này? Tất cả lần nạp sẽ bị xoá theo.')) return
    try {
      await savingsApi?.delete?.(id)
      setGoals((prev) => prev.filter((g) => g.id !== id))
    } catch (e) { alert('Lỗi xoá mục tiêu') }
  }

  const handleDeposit = async (data) => {
    try {
      await savingsApi?.addDeposit?.(depositModal.goal.id, data)
      fetchGoals()
    } catch (e) { alert('Lỗi nạp tiền') }
  }

  const handleSaveBudget = async () => {
    if (!catModal.maxAmount || !budgetApi?.setBudget) return;
    try {
      const res = await budgetApi.setBudget({
        category_id: catModal.category.id,
        month_year: monthYear,
        max_amount: Number(catModal.maxAmount)
      });
      setBudgets({ ...budgets, [catModal.category.id]: res.data.data.max_amount });
      alert('Đã cập nhật hạn mức cảnh báo!');
    } catch (e) {
      alert('Lỗi khi lưu hạn mức');
    }
  }

  const handleAddTransaction = async () => {
    if (!catModal.txAmount || !transactionApi?.create) return;
    try {
      await transactionApi.create({
        type: catModal.category.type, // Tự động lấy "income" hoặc "expense"
        amount: Number(catModal.txAmount),
        date: new Date().toISOString().split('T')[0],
        category_id: catModal.category.id,
        note: catModal.txNote || (catModal.category.type === 'expense' ? 'Nhập chi tiêu từ danh mục' : 'Nhập thu nhập từ danh mục')
      });
      alert('✅ Đã ghi nhận giao dịch thành công!');
      setCatModal({ ...catModal, isOpen: false, txAmount: '', txNote: '' });
      fetchTransactionsData(); // Cập nhật lại Quỹ lập tức
    } catch (e) {
      alert('❌ Lỗi khi thêm giao dịch');
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">

      {/* ── Section 1: Quản lý Quỹ & Danh mục ─────────────────────── */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-display-lg text-[#0b1c30] mb-2">Quản lý Quỹ & Danh mục</h1>
            <p className="text-body-lg text-[#3d4a42] max-w-xl">
              Nhấn vào các danh mục bên dưới để nhập Thu / Chi nhanh chóng. Tổng quỹ sẽ tự động đồng bộ.
            </p>
          </div>
          
          {/* NÚT THÊM DANH MỤC */}
          <button 
            onClick={() => setCreateCatModal({ isOpen: true, type: 'expense', name: '', icon: 'category' })}
            className="flex items-center justify-center gap-2 bg-[#006948] text-white px-5 py-2.5 rounded-full font-bold shadow hover:opacity-90 active:scale-95 transition-all w-fit"
          >
            <span className="material-symbols-outlined text-[20px]">add</span> Thêm danh mục
          </button>
        </div>

        {/* KHU VỰC TỔNG QUỸ */}
        <div className="bg-white rounded-xl p-5 border border-[#bccac0] mb-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
          <div className="flex-1 w-full border-r-0 md:border-r border-[#bccac0] pr-0 md:pr-6">
            <label className="text-label-caps text-[#006948] block mb-2">TỔNG THU NHẬP THÁNG NÀY (VND)</label>
            <p className="text-[32px] font-bold text-[#006948] py-1">
              {totalFund.toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div className="flex-1 w-full p-4 bg-[#dce9ff] rounded-lg">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-body-sm text-[#0b1c30]">Quỹ thực tế còn lại (Sau khi trừ chi tiêu):</p>
                <p className={`text-[24px] font-bold mt-1 transition-colors ${remainingFund < 0 ? 'text-[#9b3e3b]' : 'text-[#0b1c30]'}`}>
                  {remainingFund.toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#545f73] uppercase font-bold">Tổng Đã Chi</p>
                <p className="text-title-md text-[#9b3e3b] font-bold">{totalExpense.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
          </div>
        </div>

        {loadingCats ? (
          <div className="text-center py-8 text-[#3d4a42]">Đang tải danh mục...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Thu nhập */}
            <div className="bg-white p-6 rounded-xl border border-[#bccac0] shadow-[0px_4px_20px_rgba(30,41,59,0.05)] relative">
              <div className="flex items-center justify-between mb-4 border-b border-[#bccac0] pb-3">
                <h3 className="text-title-sm text-[#006948] flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_up</span>
                  Danh mục Thu nhập
                </h3>
                <span className="bg-[#006948]/10 text-[#006948] px-2 py-1 rounded text-label-caps">
                  {incomeCats.length} danh mục
                </span>
              </div>
              <p className="text-xs text-[#6d7a72] mb-3 italic">*Nhấn vào danh mục để cộng tiền vào quỹ</p>
              <div className="space-y-1">
                {incomeCats.map((cat) => (
                  <CategoryRow 
                    key={cat.id} 
                    cat={cat} 
                    currentAmount={catTotals[cat.id]}
                    onClick={() => setCatModal({ 
                      isOpen: true, category: cat, maxAmount: '', txAmount: '', txNote: '' 
                    })}
                    onDelete={handleDeleteCat} 
                  />
                ))}
              </div>
            </div>

            {/* Chi tiêu */}
            <div className="bg-white p-6 rounded-xl border border-[#bccac0] shadow-[0px_4px_20px_rgba(30,41,59,0.05)] relative">
              <div className="flex items-center justify-between mb-4 border-b border-[#bccac0] pb-3">
                <h3 className="text-title-sm text-[#9b3e3b] flex items-center gap-2">
                  <span className="material-symbols-outlined">trending_down</span>
                  Danh mục Chi tiêu
                </h3>
                <span className="bg-[#ffdad6]/40 text-[#9b3e3b] px-2 py-1 rounded text-label-caps">
                  {expenseCats.length} danh mục
                </span>
              </div>
              <p className="text-xs text-[#6d7a72] mb-3 italic">*Nhấn vào danh mục để nhập chi tiêu và báo động</p>
              <div className="space-y-1">
                {expenseCats.map((cat) => (
                  <CategoryRow 
                    key={cat.id} 
                    cat={cat} 
                    budgetAmount={budgets[cat.id]}
                    currentAmount={catTotals[cat.id]}
                    onClick={() => setCatModal({ 
                      isOpen: true, category: cat, maxAmount: budgets[cat.id] || '', txAmount: '', txNote: '' 
                    })}
                    onDelete={handleDeleteCat} 
                  />
                ))}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* ── Section 2: Saving Goals ─────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-headline-md text-[#0b1c30]">Mục tiêu Tiết kiệm</h2>
            <p className="text-body-md text-[#3d4a42] italic">Cùng hiện thực hóa những giấc mơ của bạn</p>
          </div>
          <button onClick={() => setGoalModal({ open: true, goal: null })} className="flex items-center gap-2 bg-[#006948] text-white px-5 py-2.5 rounded-full font-bold shadow hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[20px]">add</span> Tạo mục tiêu
          </button>
        </div>

        {loadingGoals ? (
          <div className="text-center py-12 text-[#3d4a42]"><span className="material-symbols-outlined animate-spin text-4xl text-[#006948]">progress_activity</span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="group">
                <SavingsCard goal={g} onDeposit={(goal) => setDepositModal({ open: true, goal })} onEdit={(goal) => setGoalModal({ open: true, goal })} onDelete={handleDeleteGoal} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Modals Cơ bản ───────────────────────────────────────── */}
      <GoalModal open={goalModal.open} goal={goalModal.goal} onClose={() => setGoalModal({ open: false, goal: null })} onSave={goalModal.goal ? handleUpdateGoal : handleCreateGoal} />
      <DepositModal open={depositModal.open} goal={depositModal.goal} onClose={() => setDepositModal({ open: false, goal: null })} onDeposit={handleDeposit} />

      {/* ── MODAL TẠO DANH MỤC MỚI ──────────────────────────────── */}
      {createCatModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#bccac0]">
            <div className="flex justify-between items-center mb-5 border-b border-[#bccac0] pb-3">
              <h2 className="text-title-lg text-[#0b1c30] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948]">add_circle</span>
                Tạo danh mục mới
              </h2>
              <button onClick={() => setCreateCatModal({ ...createCatModal, isOpen: false })} className="p-2 bg-[#f8f9ff] hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-full transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-label-caps block mb-2 text-[#3d4a42]">LOẠI DANH MỤC</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="catType" 
                      value="expense"
                      checked={createCatModal.type === 'expense'}
                      onChange={(e) => setCreateCatModal({...createCatModal, type: e.target.value})}
                      className="text-[#9b3e3b] focus:ring-[#9b3e3b]"
                    />
                    <span className="text-[#9b3e3b] font-medium">Chi tiêu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="catType" 
                      value="income"
                      checked={createCatModal.type === 'income'}
                      onChange={(e) => setCreateCatModal({...createCatModal, type: e.target.value})}
                      className="text-[#006948] focus:ring-[#006948]"
                    />
                    <span className="text-[#006948] font-medium">Thu nhập</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-label-caps block mb-2 text-[#3d4a42]">TÊN DANH MỤC</label>
                <input
                  type="text"
                  value={createCatModal.name}
                  onChange={(e) => setCreateCatModal({...createCatModal, name: e.target.value})}
                  placeholder="VD: Mua sắm, Tiền lương..."
                  className="w-full border-b-2 border-[#bccac0] bg-transparent focus:border-[#006948] py-2 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-label-caps block mb-2 text-[#3d4a42]">ICON (Google Material Symbols)</label>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full flex shrink-0 items-center justify-center bg-[#f8f9ff] border border-[#bccac0]">
                    <span className="material-symbols-outlined text-[#3d4a42]">{createCatModal.icon || 'category'}</span>
                  </div>
                  <input
                    type="text"
                    value={createCatModal.icon}
                    onChange={(e) => setCreateCatModal({...createCatModal, icon: e.target.value})}
                    placeholder="VD: fastfood, flight, checkroom..."
                    className="w-full border-b-2 border-[#bccac0] bg-transparent focus:border-[#006948] py-2 outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#6d7a72] mt-1">
                  *Tham khảo icon tại <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className="text-[#006948] underline">Google Fonts</a>
                </p>
              </div>

              <button 
                onClick={handleCreateCategory} 
                disabled={!createCatModal.name}
                className="w-full mt-4 text-white py-3 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2 bg-[#006948]"
              >
                LƯU DANH MỤC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ĐỘNG CHO CẢ THU NHẬP LẪN CHI TIÊU ───────────────── */}
      {catModal.isOpen && (() => {
        const isExpense = catModal.category?.type === 'expense';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-[#bccac0]">
              <div className="flex justify-between items-center mb-5 border-b border-[#bccac0] pb-3">
                <div>
                  <h2 className="text-title-lg text-[#0b1c30] flex items-center gap-2">
                    <span className={`material-symbols-outlined ${isExpense ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>
                      {catModal.category?.icon}
                    </span>
                    {catModal.category?.name}
                  </h2>
                  <p className="text-xs text-[#6d7a72] mt-1">
                    {isExpense ? 'Đã chi: ' : 'Đã thu: '} 
                    {formatVnd(catTotals[catModal.category?.id] || 0)}
                  </p>
                </div>
                <button onClick={() => setCatModal({ ...catModal, isOpen: false })} className="p-2 bg-[#f8f9ff] hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="space-y-5">
                {/* Chỉ hiện Hạn Mức nếu là Chi Tiêu */}
                {isExpense && (
                  <div className="bg-[#f8f9ff] border border-[#bccac0] rounded-xl p-4">
                    <label className="text-label-caps text-[#3d4a42] block mb-2">HẠN MỨC CẢNH BÁO (Tùy chọn)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={catModal.maxAmount}
                        onChange={(e) => setCatModal({...catModal, maxAmount: e.target.value})}
                        placeholder="VD: 5000000"
                        className="w-full border-b-2 border-[#bccac0] bg-transparent focus:border-[#9b3e3b] py-2 outline-none transition-all"
                      />
                      <button onClick={handleSaveBudget} className="px-4 bg-[#0b1c30] text-white rounded-lg text-sm font-semibold active:scale-95 transition-transform">
                        Lưu
                      </button>
                    </div>
                    <p className="text-[11px] text-[#6d7a72] mt-2 italic">*Chỉ dùng để báo động đỏ khi bạn tiêu lố, không trừ vào Quỹ gốc.</p>
                  </div>
                )}

                {/* Phần nhập tiền thực tế (Biến đổi màu theo Loại) */}
                <div className={`border rounded-xl p-4 ${isExpense ? 'bg-[#ffdad6]/20 border-[#ba1a1a]/30' : 'bg-[#006948]/5 border-[#006948]/30'}`}>
                  <label className={`text-label-caps block mb-3 ${isExpense ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>
                    {isExpense ? 'NHẬP TIỀN ĐÃ CHI THỰC TẾ' : 'NHẬP THU NHẬP THỰC TẾ'}
                  </label>
                  <input
                    type="number"
                    value={catModal.txAmount}
                    onChange={(e) => setCatModal({...catModal, txAmount: e.target.value})}
                    placeholder="Số tiền (VD: 50000)..."
                    className={`w-full border-b-2 border-[#bccac0] bg-transparent py-2 mb-3 outline-none transition-all font-semibold ${isExpense ? 'focus:border-[#9b3e3b] text-[#9b3e3b]' : 'focus:border-[#006948] text-[#006948]'}`}
                  />
                  <input
                    type="text"
                    value={catModal.txNote}
                    onChange={(e) => setCatModal({...catModal, txNote: e.target.value})}
                    placeholder="Ghi chú (Tùy chọn)..."
                    className={`w-full border-b-2 border-[#bccac0] bg-transparent py-2 mb-4 outline-none transition-all text-sm ${isExpense ? 'focus:border-[#9b3e3b]' : 'focus:border-[#006948]'}`}
                  />
                  <button 
                    onClick={handleAddTransaction} 
                    disabled={!catModal.txAmount}
                    className={`w-full text-white py-3 rounded-xl font-bold shadow-md active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2 ${isExpense ? 'bg-[#9b3e3b]' : 'bg-[#006948]'}`}
                  >
                    <span className="material-symbols-outlined">payments</span>
                    {isExpense ? 'TRỪ TIỀN QUỸ NGAY' : 'CỘNG TIỀN VÀO QUỸ'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}