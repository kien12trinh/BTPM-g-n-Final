import { useState, useEffect } from 'react'

const ICONS = [
  { value: 'laptop_mac',  label: 'Laptop' },
  { value: 'flight',      label: 'Du lịch' },
  { value: 'home',        label: 'Nhà' },
  { value: 'directions_car', label: 'Xe' },
  { value: 'school',      label: 'Học tập' },
  { value: 'favorite',    label: 'Sức khỏe' },
  { value: 'savings',     label: 'Tiết kiệm' },
  { value: 'star',        label: 'Khác' },
]

export default function GoalModal({ open, goal, onClose, onSave }) {
  const isEdit = !!goal

  const [form, setForm] = useState({
    name: '', icon: 'savings', target_amount: '', deadline: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setError('')
      setForm(goal
        ? { name: goal.name, icon: goal.icon, target_amount: goal.target_amount, deadline: goal.deadline ?? '' }
        : { name: '', icon: 'savings', target_amount: '', deadline: '' }
      )
    }
  }, [open, goal])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Tên không được để trống'); return }
    if (!form.target_amount || Number(form.target_amount) <= 0) { setError('Số tiền mục tiêu phải > 0'); return }

    setLoading(true)
    try {
      await onSave({
        name: form.name.trim(),
        icon: form.icon,
        target_amount: Number(form.target_amount),
        deadline: form.deadline || null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccac0]">
          <h2 className="text-title-sm text-[#0b1c30]">
            {isEdit ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu tiết kiệm'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#dce9ff] rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">TÊN MỤC TIÊU</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VD: Tiết kiệm mua laptop"
              className="w-full border border-[#6d7a72] rounded-lg px-4 py-2.5 text-body-md outline-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948]"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-2">BIỂU TƯỢNG</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic.value}
                  type="button"
                  onClick={() => set('icon', ic.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    form.icon === ic.value
                      ? 'border-[#006948] bg-[#006948]/5'
                      : 'border-transparent hover:bg-[#dce9ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#006948]">{ic.value}</span>
                  <span className="text-[10px] text-[#3d4a42]">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target amount */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">SỐ TIỀN MỤC TIÊU (₫)</label>
            <div className="flex items-center border border-[#6d7a72] rounded-lg px-4 focus-within:border-[#006948] focus-within:ring-1 focus-within:ring-[#006948]">
              <span className="text-[#006948] font-bold mr-2">₫</span>
              <input
                type="number"
                min="1"
                value={form.target_amount}
                onChange={(e) => set('target_amount', e.target.value)}
                placeholder="20000000"
                className="flex-1 py-2.5 bg-transparent outline-none text-body-md"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">THỜI HẠN (tuỳ chọn)</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => set('deadline', e.target.value)}
              className="w-full border border-[#6d7a72] rounded-lg px-4 py-2.5 text-body-md outline-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948]"
            />
          </div>

          {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#bccac0] text-[#545f73] text-label-caps hover:bg-[#dce9ff] transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 rounded-xl bg-[#006948] text-white text-label-caps hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
