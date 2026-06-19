import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // Khai báo state để lưu trữ dữ liệu người dùng nhập vào
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý khi người dùng bấm nút "Đăng nhập"
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt tự động tải lại trang
    setError('');
    setIsLoading(true);

    try {
      // Gọi API đến Backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Đăng nhập thành công -> Lưu token vào localStorage
        localStorage.setItem('access_token', data.access_token);
        // Điều hướng vào màn hình Giao dịch
        navigate('/transactions/new');
      } else {
        // Đăng nhập thất bại -> Hiển thị lỗi (vd: Sai mật khẩu)
        setError(data.msg || 'Tài khoản hoặc mật khẩu không chính xác!');
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
        
        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-[#006948]">account_balance</span>
          </div>
          <h1 className="text-3xl font-bold text-[#006948]">Quản lý tài chính</h1>
          <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
        </div>

        {/* Khung hiển thị lỗi (Nếu có) */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Form nhập liệu */}
        <form onSubmit={handleLogin} className="space-y-6">
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
            ) : (
              <>
                <span>Đăng nhập</span>
                <span className="material-symbols-outlined text-xl">login</span>
              </>
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
}