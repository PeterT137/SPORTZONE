import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Layers,
  ClipboardList,
  Wrench,
  Building2,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const linkClasses = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${
      isActive(path)
        ? "bg-[#1ebd6f] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

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
        <Link to="/field_manager" className={linkClasses("/field_manager")}>
          <Layers size={18} /> Sân bóng
        </Link>
        {/* <Link to="/weekly_schedule" className={linkClasses("/weekly_schedule")}>
          <Calendar size={18} /> Lịch đặt sân
        </Link> */}
        <Link to="/order_manager" className={linkClasses("/order_manager")}>
          <ClipboardList size={18} /> Đơn đặt
        </Link>
        <Link to="/service_manager" className={linkClasses("/service_manager")}>
          <Wrench size={18} /> Dịch vụ
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
