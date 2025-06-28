import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="bg-[#1a3c34] text-white shadow-md sticky top-0 z-50 py-4 px-6 font-inter">
      <nav className="flex items-center justify-between flex-wrap">
        <div className="font-bold text-2xl text-[#1ebd6f] flex items-center gap-2">
          <span>⚽</span> SportZone
        </div>
        <div className="hidden md:flex items-center gap-8 ml-12 flex-grow">
          <a href="#" className="text-white hover:text-[#1ebd6f]">Trang chủ</a>
          <div className="relative group">
            <button className="text-white hover:text-[#1ebd6f]">Đặt sân</button>
            <div className="absolute hidden group-hover:block top-full bg-white text-[#333] rounded shadow-md w-48">
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Tìm sân</a>
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Lịch đặt sân</a>
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Hủy đặt sân</a>
            </div>
          </div>
          <a href="#" className="text-white hover:text-[#1ebd6f]">Quản lý sân</a>
          <a href="#" className="text-white hover:text-[#1ebd6f]">Báo cáo</a>
          <a href="#" className="text-white hover:text-[#1ebd6f]">Liên hệ</a>
        </div>

        <div className="flex items-center gap-4 relative">
          <input
            type="text"
            placeholder="Tìm sân bóng..."
            className="px-4 py-2 rounded-md border text-sm"
          />

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 border border-[#1ebd6f] text-[#1ebd6f] rounded hover:bg-[#e6f6ef]"
            >
              Đăng nhập
            </button>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={user.avatarUrl || "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau.jpeg"}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <div className="absolute right-0 mt-2 hidden group-hover:block bg-white text-[#333] rounded shadow-md w-48 z-50">
                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-[#e6f0ea]"
                >
                  Thông tin tài khoản
                </button>
                <button
                  onClick={() => navigate("/weekly_schedule")}
                  className="block w-full text-left px-4 py-2 hover:bg-[#e6f0ea]"
                >
                  Lịch đặt sân
                </button>
                <hr />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#fbeaea]"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
