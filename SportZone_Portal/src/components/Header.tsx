// src/components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

const Header: React.FC = () => {
  const navigate = useNavigate(); // ✅ Khởi tạo navigate

  return (
    <header className="bg-[#1a3c34] text-white shadow-md sticky top-0 z-50 py-4 px-6 font-inter">
      <nav className="flex items-center justify-between flex-wrap">
        <div className="font-bold text-2xl text-[#1ebd6f] flex items-center gap-2">
          <span>⚽</span> Wesport
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
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm sân bóng..."
            className="px-4 py-2 rounded-md border text-sm"
          />
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 border border-[#1ebd6f] text-[#1ebd6f] rounded hover:bg-[#e6f6ef]"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2 bg-[#1ebd6f] text-white rounded hover:bg-[#17a55d]"
          >
            Đăng ký
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
