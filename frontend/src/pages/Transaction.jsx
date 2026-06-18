import { useState, useEffect, useRef } from 'react'
import { transactionApi, categoryApi } from '../api/client'

export default function Transaction() {
  const fileInputRef = useRef(null)

  const [txType, setTxType]               = useState('expense')
  const [amount, setAmount]               = useState('')
  const [date, setDate]                   = useState(new Date().toISOString().split('T')[0])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [notes, setNotes]                 = useState('')
  const [previewImage, setPreviewImage]   = useState(null)
  const [submitting, setSubmitting]       = useState(false)
  const [scanning, setScanning]           = useState(false) // Trạng thái quét OCR
  const [error, setError]                 = useState('')

  const [allCategories, setAllCategories] = useState([])

  // Load danh mục (Đã bọc thép an toàn)
  useEffect(() => {
    if (!categoryApi?.getAll) return;
    categoryApi.getAll()
      .then((r) => setAllCategories(r.data?.data || []))
      .catch(console.error)
  }, [])

  const categories = allCategories.filter((c) => c.type === txType)

  // ── XỬ LÝ QUÉT HÓA ĐƠN OCR ─────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Hiển thị ảnh preview ngay lập tức
    setPreviewImage(URL.createObjectURL(file))
    
    // Chuẩn bị dữ liệu gửi lên API
    const formData = new FormData()
    formData.append('receipt', file)

    setScanning(true)
    setError('')

    try {
      const res = await transactionApi.uploadReceipt(formData)
      const scannedAmount = res.data?.data?.amount
      const scannedNote = res.data?.data?.note

      if (scannedAmount > 0) {
        setAmount(scannedAmount)
        if (scannedNote) setNotes(scannedNote)
        alert(`✅ Nhận diện thành công! Tìm thấy số tiền: ${Number(scannedAmount).toLocaleString('vi-VN')} ₫`)
      } else {
        alert('⚠️ Đọc được ảnh nhưng không nhận diện được số tiền. Vui lòng nhập thủ công!')
      }
    } catch (err) {
      setError(err.response?.data?.error || '❌ Lỗi khi quét hóa đơn. Vui lòng thử lại.')
    } finally {
      setScanning(false)
      // Reset input file để có thể chọn lại cùng 1 ảnh nếu cần
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setSelectedCategory(null)
    setNotes('')
    setPreviewImage(null)
    setError('')
  }

  const handleSubmit = async () => {
    // Bắt lỗi rành mạch cho user dễ thấy
    if (!amount || Number(amount) <= 0) {
      setError('⚠️ Vui lòng nhập số tiền hợp lệ (lớn hơn 0).')
      return
    }
    if (!selectedCategory) {
      setError('⚠️ Vui lòng chọn một danh mục ở phía dưới.')
      return
    }
    if (!transactionApi?.create) {
      setError('⚠️ Lỗi hệ thống: Chưa tìm thấy cấu hình API Transaction.')
      return
    }

    setSubmitting(true)
    setError('')
    
    try {
      await transactionApi.create({
        type: txType,
        amount: Number(amount),
        date,
        category_id: selectedCategory,
        note: notes,
      })
      
      alert('✅ Đã lưu giao dịch thành công!')
      handleClear() // Lưu xong xóa form cho sạch
      
    } catch (err) {
      setError(err.response?.data?.error || '❌ Lỗi từ Backend: Không thể lưu giao dịch.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 pb-32">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-display-lg text-[#0b1c30]">
          {txType === 'expense' ? 'Nhập Giao Dịch Chi Tiêu' : 'Nhập Khoản Thu Nhập'}
        </h1>
        <p className="text-body-lg text-[#3d4a42] mt-1">
          Ghi lại các khoản tiền ra vào để hệ thống tự động tổng hợp quỹ cho bạn.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-7 space-y-4">

          {/* Transaction Type Toggle */}
          <div className="bg-white custom-shadow rounded-xl p-4 border border-[#bccac0]">
            <label className="text-label-caps text-[#3d4a42] block mb-3">LOẠI GIAO DỊCH</label>
            <div className="flex p-1 bg-[#dce9ff] rounded-lg">
              <button
                onClick={() => { setTxType('expense'); setSelectedCategory(null); setError('') }}
                className={`flex-1 py-2 text-title-sm rounded-md transition-all ${txType === 'expense' ? 'bg-white text-[#9b3e3b] font-bold shadow-sm' : 'text-[#3d4a42] hover:text-[#0b1c30]'}`}
              >
                Chi tiêu
              </button>
              <button
                onClick={() => { setTxType('income'); setSelectedCategory(null); setError('') }}
                className={`flex-1 py-2 text-title-sm rounded-md transition-all ${txType === 'income' ? 'bg-white text-[#006948] font-bold shadow-sm' : 'text-[#3d4a42] hover:text-[#0b1c30]'}`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="bg-white custom-shadow rounded-xl p-4 border border-[#bccac0]">
            <label className="text-label-caps text-[#3d4a42] block mb-2">SỐ TIỀN (VND)</label>
            <div className={`flex items-center gap-4 border-b-2 py-2 transition-all ${txType === 'expense' ? 'border-[#bccac0] focus-within:border-[#9b3e3b]' : 'border-[#bccac0] focus-within:border-[#006948]'}`}>
              <span className={`text-number-xl ${txType === 'expense' ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>₫</span>
              <input
                type="number"
                autoFocus
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError('') }}
                placeholder="0"
                className={`w-full bg-transparent border-none focus:ring-0 text-number-xl placeholder:text-[#6d7a72] outline-none ${txType === 'expense' ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}
              />
            </div>
          </div>

          {/* Date */}
          <div className="bg-white custom-shadow rounded-xl p-4 border border-[#bccac0]">
            <label className="text-label-caps text-[#3d4a42] block mb-3">NGÀY GIAO DỊCH</label>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#545f73]">calendar_today</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-body-md text-[#0b1c30] outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white custom-shadow rounded-xl p-4 border border-[#bccac0]">
            <label className="text-label-caps text-[#3d4a42] block mb-4">CHỌN DANH MỤC</label>
            {categories.length === 0 ? (
              <p className="text-body-md text-[#6d7a72]">Chưa có danh mục nào. Hãy tạo danh mục trước!</p>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setError('') }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      selectedCategory === cat.id
                        ? (txType === 'expense' ? 'border-[#9b3e3b] bg-[#9b3e3b]/10' : 'border-[#006948] bg-[#006948]/10')
                        : 'border-transparent hover:bg-[#dce9ff]'
                    }`}
                  >
                    <div className={`${selectedCategory === cat.id ? 'bg-white' : 'bg-[#dce9ff]'} p-3 rounded-full shadow-sm`}>
                      <span className={`material-symbols-outlined ${txType === 'expense' ? 'text-[#9b3e3b]' : 'text-[#006948]'}`}>
                        {cat.icon}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-center text-[#0b1c30]">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white custom-shadow rounded-xl p-4 border border-[#bccac0]">
            <label className="text-label-caps text-[#3d4a42] block mb-2">GHI CHÚ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Nhập chi tiết giao dịch..."
              className="w-full bg-transparent border-none focus:ring-0 text-body-md text-[#0b1c30] placeholder:text-[#6d7a72] resize-none outline-none"
            />
          </div>

          {/* HIỂN THỊ LỖI RÕ RÀNG CHO USER */}
          {error && (
            <div className="bg-[#ffdad6] border-l-4 border-[#ba1a1a] p-4 rounded-lg">
              <p className="text-[#ba1a1a] font-semibold text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          {/* OCR Upload */}
          <div className="bg-white custom-shadow rounded-xl border border-[#bccac0] p-4 flex-1 flex flex-col relative overflow-hidden">
            <label className="text-label-caps text-[#3d4a42] block mb-4">TẢI LÊN HOẶC QUÉT HÓA ĐƠN</label>

            {/* Màn hình Loading khi đang quét */}
            {scanning && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                <span className="material-symbols-outlined animate-spin text-[#006948] text-4xl mb-3">progress_activity</span>
                <p className="text-title-sm text-[#006948]">AI đang đọc hóa đơn...</p>
                <p className="text-xs text-[#6d7a72] mt-1">Vui lòng chờ trong giây lát</p>
              </div>
            )}

            {previewImage ? (
              <div className="flex-1 relative rounded-xl overflow-hidden min-h-[200px]">
                <img src={previewImage} alt="Receipt" className="w-full h-full object-cover" />
                {!scanning && (
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={() => !scanning && fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-[#bccac0] rounded-xl flex flex-col items-center justify-center p-6 text-center group hover:border-[#0b1c30] hover:bg-[#f8f9ff] transition-all cursor-pointer min-h-[200px]"
              >
                <div className="bg-[#dce9ff] p-6 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#0b1c30] text-4xl">document_scanner</span>
                </div>
                <h3 className="text-title-sm text-[#0b1c30] mb-1">Quét hóa đơn (AI)</h3>
                <p className="text-body-md text-[#3d4a42] mb-4">Tự động đọc số tiền từ ảnh</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* CTA (Desktop) */}
          <div className="hidden md:flex gap-3">
            <button onClick={handleClear} disabled={scanning || submitting} className="flex-1 bg-[#d3e4fe] text-[#545f73] font-bold py-4 rounded-xl hover:bg-[#bccac0] transition-all active:scale-95 disabled:opacity-50">
              Xóa Trắng
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || scanning}
              className={`flex-[2] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${txType === 'expense' ? 'bg-[#9b3e3b] hover:bg-[#ba1a1a]' : 'bg-[#006948] hover:bg-[#008f63]'}`}
            >
              {submitting ? 'Đang lưu...' : 'Lưu Giao Dịch'}
            </button>
          </div>
        </div>
      </div>

      {/* CTA (Mobile) */}
      <div className="md:hidden fixed bottom-16 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-[#bccac0] flex gap-3 z-40">
        <button onClick={handleClear} disabled={scanning || submitting} className="flex-1 bg-[#d3e4fe] text-[#545f73] font-bold py-3 rounded-lg active:scale-95 transition-all disabled:opacity-50">
          Xóa
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || scanning}
          className={`flex-[2] text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 ${txType === 'expense' ? 'bg-[#9b3e3b]' : 'bg-[#006948]'}`}
        >
          {submitting ? 'Đang lưu...' : 'Lưu Giao Dịch'}
        </button>
      </div>
    </div>
  )
}