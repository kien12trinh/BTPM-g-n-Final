import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/client'

function formatVnd(n) {
  return Math.abs(n).toLocaleString('vi-VN') + ' ₫'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Sub-components ────────────────────────────────────────────────
function SummaryCard({ title, value, subtitle, icon, iconBg, isNegative }) {
  return (
    <div className="bg-white p-6 rounded-xl custom-shadow border border-[#bccac0]">
      <div className="flex justify-between items-start mb-4">
        <span className="text-label-caps text-[#3d4a42]">{title}</span>
        <div className={`${iconBg} p-2 rounded-lg`}>
          <span className="material-symbols-outlined icon-filled text-[#006948]">{icon}</span>
        </div>
      </div>
      <div className="text-number-xl text-[#0b1c30] mb-2">
        {value != null ? formatVnd(value) : '—'}
      </div>
      <div className={`flex items-center text-body-md ${isNegative ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>
        <span className="material-symbols-outlined text-[18px]">
          {isNegative ? 'warning' : 'trending_up'}
        </span>
        <span className="ml-1">{subtitle}</span>
      </div>
    </div>
  )
}

function SpendingTrendChart({ data }) {
  const values = data.map((d) => d.expense || 0)
  const max = Math.max(...values, 1)
  return (
    <div className="bg-white p-6 rounded-xl custom-shadow border border-[#bccac0] flex flex-col min-h-[350px]">
      <h2 className="text-title-sm text-[#0b1c30] mb-6">Xu hướng chi tiêu (6 tháng)</h2>
      <div className="flex-1 flex items-end justify-between gap-2 mt-4">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex-1 bg-[#9b3e3b] rounded-t-lg transition-all"
            style={{
              height: `${((d.expense || 0) / max) * 100}%`,
              minHeight: 4,
              opacity: 0.3 + ((d.expense || 0) / max) * 0.7,
            }}
            title={`${d.label}: ${formatVnd(d.expense || 0)}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-4 text-label-caps text-[#3d4a42] px-1">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [summary, setSummary]           = useState(null)
  const [trend, setTrend]               = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.getSummary(),
      dashboardApi.getSpendingTrend(),
      dashboardApi.getRecentTransactions(5),
    ])
      .then(([s, t, r]) => {
        setSummary(s.data.data)
        setTrend(t.data.data)
        setTransactions(r.data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const monthLabel = `THÁNG ${today.getMonth() + 1}`
  const prevMonthLabel = `THÁNG ${today.getMonth() === 0 ? 12 : today.getMonth()}`

  return (
    <div className="px-6 py-4 max-w-7xl mx-auto">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          title={`THU NHẬP ${monthLabel}`}
          value={summary?.income}
          subtitle={
            summary
              ? summary.income_change >= 0
                ? `Tăng ${summary.income_change}% so với ${prevMonthLabel}`
                : `Giảm ${Math.abs(summary.income_change)}% so với ${prevMonthLabel}`
              : loading ? 'Đang tải...' : '—'
          }
          icon="arrow_downward"
          iconBg="bg-[#006948]/20"
        />
        <SummaryCard
          title={`CHI TIÊU ${monthLabel}`}
          value={summary?.expense}
          subtitle={
            summary
              ? summary.expense_change >= 0
                ? `Cao hơn ${summary.expense_change}% so với ${prevMonthLabel}`
                : `Thấp hơn ${Math.abs(summary.expense_change)}% so với ${prevMonthLabel}`
              : loading ? 'Đang tải...' : '—'
          }
          icon="arrow_upward"
          iconBg="bg-[#ffdad7]/30"
          isNegative={summary?.expense_change > 0}
        />
        <SummaryCard
          title="SỐ DƯ HIỆN TẠI"
          value={summary?.balance}
          subtitle={summary ? `Cập nhật ${formatDate(summary.updated_at)}` : loading ? 'Đang tải...' : '—'}
          icon="account_balance_wallet"
          iconBg="bg-[#d5e0f8]/50"
        />
      </section>

      {/* Spending Trend */}
      <div className="mb-8">
        {loading ? (
          <div className="bg-white p-6 rounded-xl custom-shadow border border-[#bccac0] flex items-center justify-center h-40 text-[#3d4a42]">
            Đang tải biểu đồ...
          </div>
        ) : (
          <SpendingTrendChart data={trend} />
        )}
      </div>

      {/* Recent Transactions */}
      <section className="bg-white rounded-xl custom-shadow border border-[#bccac0] overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-[#bccac0]">
          <h2 className="text-title-sm text-[#0b1c30]">Giao dịch gần đây</h2>
          <Link to="/analytics" className="text-[#006948] text-body-md hover:underline">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#eff4ff] text-label-caps text-[#3d4a42]">
              <tr>
                <th className="px-6 py-3">Nội dung</th>
                <th className="px-6 py-3">Danh mục</th>
                <th className="px-6 py-3">Ngày</th>
                <th className="px-6 py-3 text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccac0]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#3d4a42]">Đang tải...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#3d4a42]">Chưa có giao dịch nào</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#eff4ff] transition-all cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-[#006948]/10' : 'bg-[#d3e4fe]'}`}>
                          <span className={`material-symbols-outlined text-[18px] ${tx.type === 'income' ? 'text-[#006948]' : 'text-[#9b3e3b]'}`}>
                            {tx.category?.icon || 'payments'}
                          </span>
                        </div>
                        <span className="text-body-md font-semibold">{tx.note || tx.category?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-body-md">{tx.category?.name || '—'}</td>
                    <td className="px-6 py-4 text-body-md text-[#3d4a42]">{formatDate(tx.date)}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${tx.type === 'income' ? 'text-[#006948]' : 'text-[#9b3e3b]'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatVnd(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
