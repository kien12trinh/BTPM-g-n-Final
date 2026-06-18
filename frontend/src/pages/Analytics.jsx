import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { analyticsApi, dashboardApi } from '../api/client'

function formatVndShort(v) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'tỷ'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'tr'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k'
  return v + 'đ'
}

function formatVnd(n) {
  return Math.abs(n).toLocaleString('vi-VN') + 'đ'
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Donut chart ───────────────────────────────────────────────────
function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const total = d.payload.total
  const pct = ((d.value / total) * 100).toFixed(1)
  return (
    <div className="bg-white border border-[#bccac0] rounded-lg px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#0b1c30]">{d.name}</p>
      <p style={{ color: d.payload.color }}>{formatVndShort(d.value)} ({pct}%)</p>
    </div>
  )
}

function CategoryDonut({ title, data }) {
  const total = data.reduce((s, d) => s + (d.amount ?? d.value ?? 0), 0)
  const enriched = data.map((d) => ({ name: d.category ?? d.name, value: d.amount ?? d.value ?? 0, color: d.color, total }))

  if (enriched.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl border border-[#bccac0] shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
        <h4 className="text-title-sm text-[#0b1c30] mb-4">{title}</h4>
        <p className="text-body-md text-[#6d7a72] text-center py-8">Không có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-[#bccac0] shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
      <h4 className="text-title-sm text-[#0b1c30] mb-4">{title}</h4>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div style={{ width: 180, height: 180, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enriched}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={78}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {enriched.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2 w-full">
          {enriched.map((d) => {
            const pct = ((d.value / total) * 100).toFixed(1)
            return (
              <li key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-body-md text-[#0b1c30] flex-1 truncate">{d.name}</span>
                <span className="text-body-md text-[#3d4a42] font-semibold">{pct}%</span>
                <span className="text-xs text-[#6d7a72] w-14 text-right">{formatVndShort(d.value)}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ── SVG 3-line chart ──────────────────────────────────────────────
function LineChart({ data }) {
  const W = 560
  const H = 220
  const PAD = { top: 16, right: 20, bottom: 8, left: 52 }
  const [hover, setHover] = useState(null)

  if (!data.length) return null

  // Compute cumulative balance series
  let cum = 0
  const enriched = data.map((d) => {
    cum += d.income - d.expense
    return { ...d, balance: cum }
  })

  const allVals = enriched.flatMap((d) => [d.income, d.expense, d.balance])
  const minV = Math.min(...allVals)
  const maxV = Math.max(...allVals)
  const range = maxV - minV || 1

  const cols = enriched.length
  const xStep = (W - PAD.left - PAD.right) / Math.max(cols - 1, 1)
  const toX = (i) => PAD.left + i * xStep
  const toY = (v) => PAD.top + ((maxV - v) / range) * (H - PAD.top - PAD.bottom)

  const line = (key) =>
    enriched.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d[key])}`).join(' ')

  const area = (key) => {
    const base = H - PAD.bottom
    return (
      enriched.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d[key])}`).join(' ') +
      ` L${toX(cols - 1)},${base} L${toX(0)},${base} Z`
    )
  }

  const ticks = Array.from({ length: 5 }, (_, k) => minV + (range / 4) * k)

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 240 }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#006948" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#006948" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9b3e3b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#9b3e3b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((v, k) => (
          <g key={k}>
            <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)}
              stroke="#bccac0" strokeWidth="0.6" strokeDasharray="4 4" />
            <text x={PAD.left - 4} y={toY(v) + 4} textAnchor="end"
              fontSize="9" fill="#6d7a72">{formatVndShort(Math.round(v))}</text>
          </g>
        ))}

        <path d={area('income')} fill="url(#gIncome)" />
        <path d={area('expense')} fill="url(#gExpense)" />
        <path d={area('balance')} fill="url(#gBalance)" />

        <path d={line('income')} fill="none" stroke="#006948" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        <path d={line('expense')} fill="none" stroke="#9b3e3b" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        <path d={line('balance')} fill="none" stroke="#d97706" strokeWidth="2"
          strokeLinejoin="round" strokeLinecap="round" strokeDasharray="6 3" />

        {enriched.map((d, i) => (
          <g key={i} onMouseEnter={() => setHover({ ...d, i })}>
            <rect
              x={toX(i) - xStep / 2} y={PAD.top}
              width={xStep} height={H - PAD.top - PAD.bottom}
              fill="transparent"
            />
            <circle cx={toX(i)} cy={toY(d.income)} r={hover?.i === i ? 5 : 3.5}
              fill="#006948" stroke="white" strokeWidth="1.5" />
            <circle cx={toX(i)} cy={toY(d.expense)} r={hover?.i === i ? 5 : 3.5}
              fill="#9b3e3b" stroke="white" strokeWidth="1.5" />
            <circle cx={toX(i)} cy={toY(d.balance)} r={hover?.i === i ? 5 : 3}
              fill="#d97706" stroke="white" strokeWidth="1.5" />

            {hover?.i === i && (
              <line x1={toX(i)} y1={PAD.top} x2={toX(i)} y2={H - PAD.bottom}
                stroke="#bccac0" strokeWidth="1" strokeDasharray="3 3" />
            )}
          </g>
        ))}

        {hover && (() => {
          const tx = toX(hover.i)
          const boxW = 148, boxH = 76
          const bx = tx + 8 + boxW > W ? tx - boxW - 8 : tx + 8
          const by = PAD.top
          return (
            <g>
              <rect x={bx} y={by} width={boxW} height={boxH} rx="6"
                fill="white" stroke="#bccac0" strokeWidth="1"
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.08))" />
              <text x={bx + 10} y={by + 16} fontSize="10" fontWeight="600" fill="#0b1c30">
                {hover.label}
              </text>
              <circle cx={bx + 10} cy={by + 30} r="4" fill="#006948" />
              <text x={bx + 18} y={by + 34} fontSize="9" fill="#3d4a42">
                Thu nhập: <tspan fontWeight="600" fill="#006948">{formatVndShort(hover.income)}</tspan>
              </text>
              <circle cx={bx + 10} cy={by + 46} r="4" fill="#9b3e3b" />
              <text x={bx + 18} y={by + 50} fontSize="9" fill="#3d4a42">
                Chi tiêu: <tspan fontWeight="600" fill="#9b3e3b">{formatVndShort(hover.expense)}</tspan>
              </text>
              <circle cx={bx + 10} cy={by + 62} r="4" fill="#d97706" />
              <text x={bx + 18} y={by + 66} fontSize="9" fill="#3d4a42">
                Số dư: <tspan fontWeight="600" fill="#d97706">{formatVndShort(hover.balance)}</tspan>
              </text>
            </g>
          )
        })()}
      </svg>

      <div
        className="flex mt-1 text-label-caps text-[#3d4a42]"
        style={{ paddingLeft: PAD.left, paddingRight: PAD.right }}
      >
        {enriched.map((d, i) => (
          <span key={i} className="flex-1 text-center">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────
export default function Analytics() {
  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = today.slice(0, 8) + '01'

  const [dateFrom, setDateFrom] = useState(firstOfMonth)
  const [dateTo, setDateTo]     = useState(today)
  const [txType, setTxType]     = useState('all')
  const [page, setPage]         = useState(1)

  const [report, setReport]     = useState(null)
  const [trend, setTrend]       = useState([])
  const [loading, setLoading]   = useState(true)

  const handleDateFrom = (val) => {
    setDateFrom(val)
    if (val > dateTo) setDateTo(val)
  }

  const handleDateTo = (val) => {
    setDateTo(val)
    if (val < dateFrom) setDateFrom(val)
  }

  // Fetch report when filters change
  useEffect(() => {
    setLoading(true)
    analyticsApi.getReport({
      date_from: dateFrom,
      date_to: dateTo,
      type: txType === 'all' ? undefined : txType,
    })
      .then((r) => setReport(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo, txType])

  // Fetch 6-month trend once
  useEffect(() => {
    dashboardApi.getSpendingTrend()
      .then((r) => setTrend(r.data.data))
      .catch(console.error)
  }, [])

  const transactions = report?.transactions || []
  const overview = {
    income: report?.total_income ?? 0,
    expense: report?.total_expense ?? 0,
    balance: report?.balance ?? 0,
  }
  const expenseCats = report?.expense_by_category || []
  const incomeCats  = report?.income_by_category  || []

  const incomeBarW  = overview.income > 0 ? Math.min(100, Math.round(overview.income  / Math.max(overview.income, overview.expense) * 100)) : 0
  const expenseBarW = overview.expense > 0 ? Math.min(100, Math.round(overview.expense / Math.max(overview.income, overview.expense) * 100)) : 0

  const PAGE_SIZE = 10
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE)

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Filters */}
      <section className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-label-caps text-[#3d4a42] mb-1 block">KHOẢNG THỜI GIAN</label>
          <div className="flex items-center bg-white border border-[#6d7a72] rounded-lg overflow-hidden focus-within:border-[#006948] focus-within:ring-1 focus-within:ring-[#006948]">
            <span className="material-symbols-outlined pl-3 text-[#3d4a42] text-[18px] flex-shrink-0">calendar_today</span>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={(e) => handleDateFrom(e.target.value)}
              className="bg-transparent border-none outline-none py-2.5 pl-2 pr-1 text-body-md text-[#0b1c30]"
            />
            <span className="text-[#6d7a72] px-1 flex-shrink-0">→</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              onChange={(e) => handleDateTo(e.target.value)}
              className="bg-transparent border-none outline-none py-2.5 pl-1 pr-3 text-body-md text-[#0b1c30]"
            />
          </div>
        </div>

        <div>
          <label className="text-label-caps text-[#3d4a42] mb-1 block">LOẠI GIAO DỊCH</label>
          <div className="relative">
            <select
              value={txType}
              onChange={(e) => { setTxType(e.target.value); setPage(1) }}
              className="bg-white border border-[#6d7a72] rounded-lg py-2.5 px-4 pr-10 appearance-none focus:border-[#006948] focus:ring-1 focus:ring-[#006948] outline-none text-body-md"
            >
              <option value="all">Tất cả</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 pointer-events-none text-[#3d4a42] text-[18px]">swap_vert</span>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Line Chart */}
        <div className="md:col-span-8 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-[#bccac0]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-title-sm text-[#0b1c30]">Xu hướng thu chi (6 tháng)</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#006948]" />
                <span className="text-xs text-[#3d4a42]">Thu nhập</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#9b3e3b]" />
                <span className="text-xs text-[#3d4a42]">Chi tiêu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-8 border-t-2 border-dashed border-[#d97706]" />
                <span className="text-xs text-[#3d4a42]">Số dư</span>
              </div>
            </div>
          </div>
          <LineChart data={trend} />
        </div>

        {/* Overview Summary */}
        <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-[#bccac0] flex flex-col">
          <h3 className="text-title-sm text-[#0b1c30] mb-8">Tổng quan thu chi</h3>
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#3d4a42]">Tổng thu nhập</span>
                <span className="font-bold text-[#006948]">{formatVnd(overview.income)}</span>
              </div>
              <div className="w-full bg-[#d3e4fe] h-2 rounded-full overflow-hidden">
                <div className="bg-[#006948] h-full rounded-full transition-all" style={{ width: `${incomeBarW}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#3d4a42]">Tổng chi tiêu</span>
                <span className="font-bold text-[#ba1a1a]">{formatVnd(overview.expense)}</span>
              </div>
              <div className="w-full bg-[#d3e4fe] h-2 rounded-full overflow-hidden">
                <div className="bg-[#9b3e3b] h-full rounded-full transition-all" style={{ width: `${expenseBarW}%` }} />
              </div>
            </div>
            <div className="pt-6 mt-2 border-t border-[#bccac0] flex justify-between items-center">
              <span className="text-label-caps text-[#3d4a42]">SỐ DƯ KỲ NÀY</span>
              <span className={`text-headline-md font-bold ${overview.balance >= 0 ? 'text-[#006948]' : 'text-[#9b3e3b]'}`}>
                {overview.balance >= 0 ? '+' : ''}{formatVnd(overview.balance)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Donuts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CategoryDonut title="Chi tiêu theo danh mục" data={expenseCats} />
        <CategoryDonut title="Thu nhập theo danh mục" data={incomeCats} />
      </section>

      {/* Data Table */}
      <section className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-[#bccac0] overflow-hidden">
        <div className="p-6 border-b border-[#bccac0] flex justify-between items-center bg-[#eff4ff]">
          <h3 className="text-title-sm text-[#0b1c30]">Danh sách giao dịch chi tiết</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#bccac0]">
                <th className="px-6 py-4 text-label-caps text-[#3d4a42]">NGÀY</th>
                <th className="px-6 py-4 text-label-caps text-[#3d4a42]">GHI CHÚ</th>
                <th className="px-6 py-4 text-label-caps text-[#3d4a42]">PHÂN LOẠI</th>
                <th className="px-6 py-4 text-label-caps text-[#3d4a42] text-right">SỐ TIỀN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bccac0]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#3d4a42]">Đang tải...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#3d4a42]">Không có giao dịch nào trong khoảng thời gian này</td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#dce9ff] transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-body-md whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4 text-body-md font-bold text-[#0b1c30]">{tx.note || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#e5eeff] rounded-full text-[10px] text-[#586377]">
                        {tx.category?.name || '—'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-body-md font-bold text-right ${tx.type === 'income' ? 'text-[#006948]' : 'text-[#ba1a1a]'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatVnd(tx.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#bccac0] flex items-center justify-between">
          <p className="text-label-caps text-[#3d4a42]">
            HIỂN THỊ {transactions.length} GIAO DỊCH
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded border border-[#bccac0] flex items-center justify-center hover:bg-[#e5eeff] transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 rounded border border-[#bccac0] flex items-center justify-center bg-[#006948] text-white">
                {page}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded border border-[#bccac0] flex items-center justify-center hover:bg-[#e5eeff] transition-colors disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
