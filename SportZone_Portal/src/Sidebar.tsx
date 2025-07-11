import {
  Bell,
  Building2,
  ClipboardList,
  Home,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${isActive(path)
      ? "bg-[#1ebd6f] text-white"
      : "text-gray-700 hover:bg-gray-100"
    }`;

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = 3; // Mock unread count; replace with dynamic data if needed

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50">
      <div className="p-4 text-lg font-semibold border-b">⚙️ Quản lý</div>
      <nav className="flex flex-col gap-1 px-2 py-4">
        <Link to="/" className={linkClasses("/")}>
          <Home size={18} /> Trang chủ
        </Link>
        <Link to="/facility_manager" className={linkClasses("/facility_manager")}>
          <Building2 size={18} /> Cơ sở
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`${linkClasses("/notifications")} w-full text-left`}
          >
            <Bell size={18} /> Thông báo
            {unreadNotifications > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="p-2">
                <p className="text-sm text-gray-600">Thông báo admin</p>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm text-gray-800">New facility request received</li>
                  <li className="text-sm text-gray-800">Order #1234 updated</li>
                  <li className="text-sm text-gray-800">Maintenance scheduled</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <Link to="/order_manager" className={linkClasses("/order_manager")}>
          <ClipboardList size={18} /> Đơn đặt
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;