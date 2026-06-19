import { useState, useEffect } from 'react'

function formatVnd(n) {
  return Number(n).toLocaleString('vi-VN') + ' ₫'
}

export default function DepositModal({ open, goal, onClose, onDeposit }) {
  const [amount, setAmount]   = useState('')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [note, setNote]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount('')
      setNote('')
      setError('')
      setDate(new Date().toISOString().split('T')[0])
    }
  }, [open])

  if (!open || !goal) return null

  const remaining = goal.remaining_amount ?? (goal.target_amount - goal.saved_amount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('Số tiền phải lớn hơn 0'); return }
    if (amt > remaining) { setError(`Chỉ cần ${formatVnd(remaining)} để hoàn thành mục tiêu`); return }

    setLoading(true)
    try {
      await onDeposit({ amount: amt, date, note: note.trim() || null })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error ?? 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const pct = goal.target_amount > 0
    ? Math.round((goal.saved_amount / goal.target_amount) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#bccac0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#006948]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#006948]">{goal.icon}</span>
            </div>
            <div>
              <h2 className="text-title-sm text-[#0b1c30]">Nạp tiền vào quỹ</h2>
              <p className="text-xs text-[#3d4a42]">{goal.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#dce9ff] rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress summary */}
        <div className="px-6 py-3 bg-[#eff4ff]">
          <div className="flex justify-between text-body-md mb-1.5">
            <span className="text-[#3d4a42]">Đã tiết kiệm</span>
            <span className="font-semibold text-[#006948]">
              {formatVnd(goal.saved_amount)} / {formatVnd(goal.target_amount)}
            </span>
          </div>
          <div className="w-full h-2 bg-[#d3e4fe] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#006948] to-[#85f8c4] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-label-caps text-[#006948]">{pct}%</span>
            <span className="text-label-caps text-[#3d4a42]">Còn lại: {formatVnd(remaining)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">SỐ TIỀN NẠP (₫)</label>
            <div className="flex items-center border border-[#6d7a72] rounded-lg px-4 focus-within:border-[#006948] focus-within:ring-1 focus-within:ring-[#006948]">
              <span className="text-[#006948] font-bold mr-2">₫</span>
              <input
                type="number"
                min="1"
                max={remaining}
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="flex-1 py-2.5 bg-transparent outline-none text-body-md"
              />
            </div>
            {/* Quick fill buttons */}
            <div className="flex gap-2 mt-2">
              {[500000, 1000000, 2000000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(Math.min(v, remaining)))}
                  className="flex-1 py-1 text-xs rounded-lg border border-[#bccac0] hover:bg-[#dce9ff] text-[#3d4a42] transition-all"
                >
                  +{(v / 1000).toFixed(0)}k
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="flex-1 py-1 text-xs rounded-lg border border-[#006948] text-[#006948] hover:bg-[#006948]/5 transition-all"
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">NGÀY NẠP</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[#6d7a72] rounded-lg px-4 py-2.5 text-body-md outline-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-label-caps text-[#3d4a42] block mb-1">GHI CHÚ (tuỳ chọn)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Lương tháng 8"
              className="w-full border border-[#6d7a72] rounded-lg px-4 py-2.5 text-body-md outline-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948]"
            />
          </div>

          {error && <p className="text-sm text-[#ba1a1a]">{error}</p>}

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
              {loading ? 'Đang lưu...' : 'Xác nhận nạp tiền'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
