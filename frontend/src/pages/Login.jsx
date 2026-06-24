import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Khai báo state để quản lý trạng thái Đăng nhập / Đăng ký và dữ liệu nhập vào
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý chung khi submit Form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự động tải lại trang
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Tự động chọn đúng API endpoint dựa trên trạng thái hiện tại
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          // XỬ LÝ ĐĂNG NHẬP THÀNH CÔNG
          localStorage.setItem('access_token', data.access_token);
          navigate('/transactions/new');
        } else {
          // XỬ LÝ ĐĂNG KÝ THÀNH CÔNG
          setSuccess('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
          setIsLoginMode(true); // Tự động chuyển về giao diện đăng nhập
          setPassword('');      // Xóa sạch mật khẩu cũ để đảm bảo an toàn
        }
      } else {
        // XỬ LÝ KHI BACKEND TRẢ VỀ LỖI
        setError(data.msg || data.error || (isLoginMode ? 'Tài khoản hoặc mật khẩu không chính xác!' : 'Đăng ký thất bại!'));
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#eff4ff]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-[#bccac0]">
        
        {/* Tiêu đề thay đổi động dựa trên trạng thái hiển thị */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-[#006948]">
              {isLoginMode ? 'account_balance' : 'person_add'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#006948]">
            {isLoginMode ? 'Quản lý tài chính' : 'Tạo tài khoản'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLoginMode ? 'Đăng nhập để tiếp tục' : 'Đăng ký thành viên mới'}
          </p>
        </div>

        {/* Khung hiển thị thông báo thành công khi Đăng ký hoàn tất */}
        {success && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* Khung hiển thị lỗi (Nếu có) */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#3d4a42] mb-2">
              Tài khoản
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006948] focus:border-transparent outline-none transition-all"
              placeholder="Nhập tên tài khoản"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d4a42] mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006948] focus:border-transparent outline-none transition-all"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-[#006948] hover:bg-[#005238] text-white rounded-lg font-medium text-lg transition-all flex justify-center items-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              'Đang xử lý...'
            ) : isLoginMode ? (
              <>
                <span>Đăng nhập</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </>
            ) : (
              <>
                <span>Đăng ký</span>
                <span className="material-symbols-outlined text-xl">how_to_reg</span>
              </>
            )}
          </button>
        </form>

        {/* Khung liên kết chuyển đổi giữa Đăng nhập & Đăng ký */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLoginMode ? (
            <p>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-[#006948] font-semibold hover:underline bg-none border-none cursor-pointer outline-none"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-[#006948] font-semibold hover:underline bg-none border-none cursor-pointer outline-none"
              >
                Đăng nhập tại đây
              </button>
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
}