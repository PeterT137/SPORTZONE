import {
  Bell,
  Building2,
  ClipboardList,
  Home,
  User2,
  Users,
  FileText,
  LogOut,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface User {
  UId: number;
  RoleId: number;
  UEmail: string;
  UStatus?: string;
  UCreateDate?: string;
  IsExternalLogin?: boolean;
  IsVerify?: boolean;
  Admin?: unknown;
  Customer?: unknown;
  FieldOwner?: unknown;
  Staff?: unknown;
  Role?: unknown;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition h-11 ${
      isActive(path)
        ? "bg-[#1ebd6f] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = 3;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User loaded:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isAdmin = user?.RoleId === 3;
  const isFieldOwner = user?.RoleId === 2;
  const isStaff = user?.RoleId === 4;

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 bg-green-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.UEmail?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <div className="text-white">
              <div className="text-sm font-medium">
                {user?.UEmail?.split("@")[0] || "Người dùng"}
              </div>
              <div className="text-xs text-green-100">
                {user?.RoleId === 3
                  ? "Admin"
                  : user?.RoleId === 2
                  ? "Field Owner"
                  : user?.RoleId === 4
                  ? "Staff"
                  : "User"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-white hover:text-green-100 p-1 rounded transition-colors"
            title="Đăng xuất"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 px-2 py-4 flex-1 overflow-y-auto">
        <Link to="/" className={linkClasses("/")}>
          <Home size={18} /> Trang chủ
        </Link>

        {isAdmin && (
          <>
            <Link to="/users_manager" className={linkClasses("/users_manager")}>
              <Users size={18} /> Users
            </Link>
            <Link
              to="/regulation_manager"
              className={linkClasses("/regulation_manager")}
            >
              <FileText size={18} /> Regulation
            </Link>
          </>
        )}

        {/* Menu cho Field Owner (Role 2) */}
        {isFieldOwner && (
          <>
            <Link
              to="/facility_manager"
              className={linkClasses("/facility_manager")}
            >
              <Building2 size={18} /> Cơ sở
            </Link>
            <Link to="/staff_manager" className={linkClasses("/staff_manager")}>
              <User2 size={18} /> Nhân viên
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
                    <p className="text-sm text-gray-600">
                      Thông báo field owner
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm text-gray-800">
                        Đơn đặt sân mới #456
                      </li>
                      <li className="text-sm text-gray-800">
                        Thanh toán hoàn thành #789
                      </li>
                      <li className="text-sm text-gray-800">
                        Yêu cầu hủy đặt sân #123
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            <Link to="/order_manager" className={linkClasses("/order_manager")}>
              <ClipboardList size={18} /> Đơn đặt
            </Link>
          </>
        )}

        {isStaff && (
          <>
            <Link
              to="/facility_manager"
              className={linkClasses("/facility_manager")}
            >
              <Building2 size={18} /> Cơ sở
            </Link>
            <Link to="/order_manager" className={linkClasses("/order_manager")}>
              <ClipboardList size={18} /> Đơn đặt
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
