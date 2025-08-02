/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Types
interface ExternalLogin {
  Id: number;
  UId: number;
  ExternalProvider: string;
  ExternalUserId: string;
  AccessToken: string;
}

interface User {
  UId: number;
  RoleId: number;
  UEmail: string;
  UStatus: string;
  UCreateDate: string;
  IsExternalLogin: boolean;
  IsVerify: boolean;
  Admin: null | any;
  Customers: any[];
  ExternalLogins: ExternalLogin[];
  FieldOwner: null | any;
  Notifications: any[];
  Role: null | any;
  Staff: null | any;
  avatarUrl?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const unreadNotifications = 2; // Mock

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const transformedUser: User = {
          UId: parsedUser.uId || parsedUser.UId,
          RoleId: parsedUser.roleId || parsedUser.RoleId,
          UEmail: parsedUser.uEmail || parsedUser.UEmail,
          UStatus: parsedUser.uStatus || parsedUser.UStatus || "Active",
          UCreateDate: parsedUser.uCreateDate || parsedUser.UCreateDate || new Date().toISOString(),
          IsExternalLogin: parsedUser.isExternalLogin ?? false,
          IsVerify: parsedUser.isVerify ?? false,
          Admin: parsedUser.Admin ?? null,
          Customers: parsedUser.Customers ?? [],
          ExternalLogins: parsedUser.ExternalLogins ?? [],
          FieldOwner: parsedUser.FieldOwner ?? null,
          Notifications: parsedUser.notifications ?? parsedUser.Notifications ?? [],
          Role: parsedUser.Role ?? null,
          Staff: parsedUser.Staff ?? null,
          avatarUrl: parsedUser.avatarUrl || "https://www.vietnamworks.com/hrinsider/wp-content/uploads/2023/12/anh-den-ngau.jpeg",
        };

        if (transformedUser.UId && transformedUser.UEmail) {
          setUser(transformedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser(null);
      }
    }
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
          <a href="/homepage">
            <span>⚽</span> SportZone
          </a>
        </div>
        <div className="hidden md:flex items-center gap-8 ml-12 flex-grow">
          <a href="/homepage" className="text-white hover:text-[#1ebd6f]">Trang chủ</a>
          <div className="relative group">
            <button className="text-white hover:text-[#1ebd6f]">Đặt sân</button>
            <div className="absolute hidden group-hover:block top-full bg-white text-[#333] rounded shadow-md w-48">
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Tìm sân</a>
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Lịch đặt sân</a>
              <a className="block px-4 py-2 hover:bg-[#e6f0ea] hover:text-[#1ebd6f]" href="#">Hủy đặt sân</a>
            </div>
          </div>
          <a href="/field_list" className="text-white hover:text-[#1ebd6f]">Danh sách sân</a>
          {user && (user.RoleId === 2 || user.RoleId === 3 || user.RoleId === 4) && (
            <a href="/facility_manager" className="text-white hover:text-[#1ebd6f]">Quản lý chủ sân</a>
          )}
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
            <div className="flex items-center gap-4 relative">
              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white hover:text-[#1ebd6f]"
                >
                  <span className="relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadNotifications}
                      </span>
                    )}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-[#333] rounded shadow-md z-50">
                    <div className="p-2">
                      <p className="text-sm text-gray-600">Thông báo</p>
                      <ul className="mt-2 space-y-1">
                        <li className="text-sm text-gray-800">Đơn đặt sân #456 đã được xác nhận</li>
                        <li className="text-sm text-gray-800">Nhắc nhở thanh toán đơn #789</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                >
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border"
                  />
                  <span className="text-sm font-medium">{user.UEmail}</span>
                </div>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 bg-white text-[#333] rounded shadow-md w-48 z-50">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#e6f0ea]"
                    >
                      Thông tin tài khoản
                    </button>
                    <button
                      onClick={() => {
                        navigate("/weekly_schedule");
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-[#e6f0ea]"
                    >
                      Lịch đặt sân
                    </button>
                    <hr />
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-[#fbeaea]"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
