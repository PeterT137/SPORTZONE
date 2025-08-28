import React from "react";
import { Navigate, Link } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAuth?: boolean;
  allowRoles?: number[];
  blockRoles?: number[];
  message?: string;
  redirectTo?: string;
  loginPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  allowRoles,
  blockRoles,
  message,
  redirectTo = "/",
  loginPath = "/login",
}) => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const roleId: number | undefined = user?.RoleId ?? user?.roleId;
  const userStatus = user?.UStatus ?? user?.uStatus ?? "Active";

  if (requireAuth && (!token || !user)) {
    return <Navigate to={loginPath} replace />;
  }

  // Kiểm tra trạng thái tài khoản
  if (user && userStatus.toLowerCase() !== "active") {
    // Xóa thông tin đăng nhập nếu tài khoản bị khóa
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("facilityInfo");

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold">Tài khoản đã bị khóa</h1>
            <p className="mt-2 text-sm">
              Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.
            </p>
            <div className="mt-6">
              <Link
                to={loginPath}
                className="inline-block bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Về trang đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (typeof roleId === "number") {
    if (Array.isArray(blockRoles) && blockRoles.includes(roleId)) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6 text-center">
              <h1 className="text-2xl font-bold">Không thể truy cập</h1>
              <p className="mt-2 text-sm">
                {message || "Bạn không có quyền truy cập vào trang này."}
              </p>
              <div className="mt-6">
                <Link
                  to={redirectTo}
                  className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Về trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (Array.isArray(allowRoles) && !allowRoles.includes(roleId)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

