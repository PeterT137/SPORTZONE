import React, { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import UsersList from "./UsersList";
import UserSearchBar from "./UserSearchBar";
import CreateUserModal from "./CreateUserModal";
import Pagination from "./Pagination";
import Toast from "../common/Toast";
import type { User } from "./types";

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5; // 5 users per page
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await fetch("https://localhost:7057/get-all-account", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();

      console.log(result);

      if (result.success) {
        const transformedUsers =
          result.data?.map((user: unknown, index: number) => {
            const userObj = user as Record<string, unknown>;
            const customerObj = userObj.customer as Record<string, unknown>;
            const fieldOwnerObj = userObj.fieldOwner as Record<string, unknown>;
            const staffObj = userObj.staff as Record<string, unknown>;

            // Lấy name và phone từ role-specific object
            let name = "";
            let phone = "";
            let facilityId = undefined;

            if (customerObj) {
              name = customerObj.name as string;
              phone = customerObj.phone as string;
            } else if (fieldOwnerObj) {
              name = fieldOwnerObj.name as string;
              phone = fieldOwnerObj.phone as string;
            } else if (staffObj) {
              name = staffObj.name as string;
              phone = staffObj.phone as string;
              facilityId = staffObj.facilityId as number;
            }

            return {
              UId: (userObj.uId as number) || (userObj.UId as number) || index,
              RoleId:
                (userObj.roleId as number) || (userObj.RoleId as number) || 0,
              UEmail:
                (userObj.uEmail as string) || (userObj.UEmail as string) || "",
              UStatus:
                (userObj.uStatus as string) ||
                (userObj.UStatus as string) ||
                "",
              UCreateDate:
                (userObj.uCreateDate as string) ||
                (userObj.UCreateDate as string) ||
                "",
              // Unified name và phone từ role-specific objects
              name,
              phone,
              facilityId:
                facilityId ||
                (userObj.facilityId as number) ||
                (userObj.FacilityId as number),
              customer: customerObj,
              fieldOwner: fieldOwnerObj,
              staff: staffObj,
              roleInfo: userObj.roleInfo as Record<string, unknown>,
            };
          }) || [];

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } else {
        throw new Error(result.message || "Lỗi khi tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      setCurrentPage(1);
    } else {
      const filtered = users.filter((user) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.UEmail?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower) ||
          user.customer?.name?.toLowerCase().includes(searchLower) ||
          user.customer?.phone?.toLowerCase().includes(searchLower) ||
          user.fieldOwner?.name?.toLowerCase().includes(searchLower) ||
          user.fieldOwner?.phone?.toLowerCase().includes(searchLower) ||
          user.staff?.name?.toLowerCase().includes(searchLower) ||
          user.staff?.phone?.toLowerCase().includes(searchLower) ||
          user.roleInfo?.name?.toLowerCase().includes(searchLower)
        );
      });

      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleUserCreated = () => {
    setIsCreateModalOpen(false);
    fetchUsers();
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      console.log(`Updating user ${userId} status to ${newStatus}`);
      console.log(`API URL: https://localhost:7057/api/Admin/update-user-status/${userId}`);

      const requestBody = { status: newStatus };
      console.log("Request body:", requestBody);

      const response = await fetch(`https://localhost:7057/api/Admin/update-user-status/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Success response:", result);

      if (result.success) {
        // Cập nhật trạng thái trong danh sách users
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.UId === userId
              ? { ...user, UStatus: newStatus }
              : user
          )
        );

        setFilteredUsers(prevUsers =>
          prevUsers.map(user =>
            user.UId === userId
              ? { ...user, UStatus: newStatus }
              : user
          )
        );

        // Hiển thị thông báo thành công
        setToast({
          message: "Cập nhật trạng thái thành công!",
          type: "success",
          isVisible: true,
        });
      } else {
        throw new Error(result.message || "Lỗi khi cập nhật trạng thái");
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      setToast({
        message: err instanceof Error ? err.message : "Lỗi không xác định",
        type: "error",
        isVisible: true,
      });
      throw err;
    }
  };

  const getRoleName = (roleId: number): string => {
    switch (roleId) {
      case 1:
        return "Khách hàng";
      case 2:
        return "Chủ sân";
      case 3:
        return "Admin";
      case 4:
        return "Nhân viên";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">SPORTZONE ADMIN PAGE</h1>
              <p className="text-green-100 mt-1">
                Quản lý tài khoản người dùng SPORTZONE
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <UserSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateUser={handleCreateUser}
            totalUsers={filteredUsers.length}
          />

          <UsersList
            users={currentUsers}
            getRoleName={getRoleName}
            onStatusChange={handleStatusChange}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredUsers.length}
            itemsPerPage={usersPerPage}
          />
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={handleCloseCreateModal}
          onUserCreated={handleUserCreated}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default UsersManager;
