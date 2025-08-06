/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiSlash,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

type Staff = {
  id: number; // uId
  name: string;
  phone: string;
  dob: string; // yyyy-MM-dd
  image: string;
  startTime: string; // ISO string or date string
  endTime?: string; // Optional
  email: string;
  status: "Active" | "Inactive";
  facIds: number[]; // Array of facility IDs
  roleName: string;
  facilityNames: string[]; // Array of facility names
};

type EditStaff = {
  name: string;
  phone: string;
  dob: string;
  image: string;
  imageFile: File | null;
  startTime: string;
  endTime: string;
  email: string;
  password: string;
  status: "Active" | "Inactive";
  facilityId: number | null;
};

const StaffManager: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [filteredStaffs, setFilteredStaffs] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<EditStaff>({
    name: "",
    phone: "",
    dob: "",
    image: "",
    imageFile: null,
    startTime: "",
    endTime: "",
    email: "",
    password: "",
    status: "Active",
    facilityId: null,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>(
    []
  );

  // Format date string for datetime-local input
  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Format date for date input
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch staff data from API
  const fetchStaffs = async () => {
    setLoading(true);
    setError(null);
    try {
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      const roleId = user?.roleId;

      // Get authentication token
      const token = localStorage.getItem("token");
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      const facilityList =
        user?.FieldOwner?.facilities?.map((f: any) => ({
          id: f.facId,
          name: f.name || `Facility ${f.facId}`,
        })) || [];
      setFacilities(facilityList);

      let allStaffs: any[] = [];

      if (roleId === 3) {
        // Admin lấy toàn bộ staff
        const response = await fetch(
          `https://localhost:7057/api/Staff/GetAll`,
          {
            method: "GET",
            headers: authHeaders,
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          throw new Error(`Lỗi tải tất cả nhân viên (HTTP ${response.status})`);
        }
        const apiResponse = await response.json();
        if (apiResponse.success) allStaffs = apiResponse.data || [];
        else throw new Error(apiResponse.message || "Không thể lấy nhân viên.");
      } else {
        // FieldOwner lấy theo từng facility
        for (const facility of facilityList) {
          try {
            const response = await fetch(
              `https://localhost:7057/api/Staff/by-facility/${facility.id}`,
              {
                method: "GET",
                headers: authHeaders,
              }
            );
            if (response.ok) {
              const apiResponse = await response.json();
              if (apiResponse.success && apiResponse.data) {
                allStaffs = allStaffs.concat(apiResponse.data);
              }
              console.log(
                `Nhân viên của facility ${facility.id}:`,
                apiResponse.data
              );
            }
          } catch (err) {
            console.warn(
              `Không thể tải nhân viên cho facility ${facility.id}:`,
              err
            );
          }
        }
      }

      // Gộp danh sách staff không trùng uId
      const staffMap = new Map<number, Staff>();

      allStaffs.forEach((item: any) => {
        const uId = item.uId;
        const facId = item.fac?.facId || item.facId;
        // Ưu tiên lấy tên cơ sở từ API, nếu không có thì lấy từ facilities state
        const facName =
          item.facilityName ||
          facilities.find((f) => f.id === facId)?.name ||
          "Unknown";
        const userNav = item.uIdNavigation || {};

        // Nếu staff đã có trong map, thêm facId và facName nếu chưa có
        if (staffMap.has(uId)) {
          const existing = staffMap.get(uId);
          if (!existing.facIds.includes(facId)) {
            existing.facIds.push(facId);
            existing.facilityNames.push(facName);
          }
        } else {
          // Normalize image URL
          let image = item.image || "/default-avatar.jpg";
          if (image && !image.startsWith("http")) {
            image = `https://localhost:7057${image}`;
          }
          staffMap.set(uId, {
            id: uId,
            name: item.name || "",
            phone: item.phone || "",
            dob: item.dob || "",
            image,
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            email: item.email || "",
            status: userNav.uStatus || "Inactive",
            facIds: [facId],
            roleName: "Nhân viên",
            facilityNames: [facName],
          });
        }
      });

      const mappedStaffs = Array.from(staffMap.values());
      setStaffs(mappedStaffs);
      setFilteredStaffs(mappedStaffs);
    } catch (err: any) {
      const errorMessage =
        err.message || "Lỗi khi tải danh sách nhân viên. Vui lòng thử lại.";
      setError(errorMessage);
      Swal.fire(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredStaffs(
      staffs.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.phone.includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.facIds.some((facId) => facId.toString().includes(term)) ||
          s.facilityNames.some((name) => name.toLowerCase().includes(term))
      )
    );
  }, [searchTerm, staffs]);

  // Delete staff via API
  const deleteStaff = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: `Bạn có chắc muốn xóa nhân viên "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          authHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`https://localhost:7057/api/Staff/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Lỗi khi xóa nhân viên (HTTP ${response.status}).`
          );
        }
        const apiResponse = await response.json();
        if (apiResponse.success) {
          setStaffs((prev) => prev.filter((s) => s.id !== id));
          setFilteredStaffs((prev) => prev.filter((s) => s.id !== id));
          Swal.fire("Thành công", "Đã xóa nhân viên.", "success");
        } else {
          throw new Error(apiResponse.error || "Lỗi khi xóa nhân viên.");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi xóa nhân viên.";
        setError(errorMessage);
        Swal.fire(errorMessage, "error");
      }
    }
  };

  // Toggle staff status via API
  const toggleStatus = async (id: number) => {
    const staff = staffs.find((s) => s.id === id);
    if (!staff) return;

    const newStatus = staff.status === "Active" ? "Inactive" : "Active";

    const result = await Swal.fire({
      title:
        newStatus === "Inactive"
          ? `Bạn có muốn tạm ngưng hoạt động của "${staff.name}"?`
          : `Bạn có muốn kích hoạt lại "${staff.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          authHeaders.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `https://localhost:7057/api/Staff/${id}/status`,
          {
            method: "PATCH",
            headers: authHeaders,
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Lỗi khi cập nhật trạng thái (HTTP ${response.status}).`
          );
        }
        const apiResponse = await response.json();
        if (apiResponse.success) {
          setStaffs((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
          );
          Swal.fire(
            "Thành công",
            `Nhân viên đã được chuyển thành trạng thái ${
              newStatus === "Active" ? "Hoạt động" : "Không hoạt động"
            }.`,
            "success"
          );
        } else {
          throw new Error(apiResponse.error || "Lỗi khi cập nhật trạng thái.");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Lỗi khi cập nhật trạng thái.";
        setError(errorMessage);
        Swal.fire(errorMessage, "error");
      }
    }
  };

  const handleEdit = (staff: Staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      phone: staff.phone,
      dob: formatDate(staff.dob),
      image: staff.image,
      imageFile: null,
      startTime: formatDateTimeLocal(staff.startTime),
      endTime: staff.endTime ? formatDateTimeLocal(staff.endTime) : "",
      email: staff.email,
      password: "", // Do not prefill password on edit
      status: staff.status,
      facilityId: staff.facIds[0] || null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.password
    ) {
      Swal.fire(
        "Vui lòng điền đầy đủ tên, email, SĐT và mật khẩu",
        "",
        "error"
      );
      return;
    }
    if (!formData.facilityId) {
      Swal.fire("Vui lòng chọn cơ sở làm việc", "error");
      return;
    }

    // Chuẩn hóa dữ liệu gửi đi giống CreateUserModal: chỉ gửi image là URL
    const body: any = {
      email: formData.email,
      password: formData.password,
      roleId: 4,
      name: formData.name,
      phone: formData.phone,
      status: formData.status,
      image: formData.image || undefined,
      facilityId: formData.facilityId ?? 0,
      startTime: formData.startTime
        ? new Date(formData.startTime).toISOString()
        : undefined,
      endTime: formData.endTime
        ? new Date(formData.endTime).toISOString()
        : undefined,
    };
    // Debug log
    console.log(
      "[DEBUG] Creating staff: POST https://localhost:7057/create-account"
    );
    console.log("[DEBUG] Request body:", body);

    try {
      const token = localStorage.getItem("token");
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("https://localhost:7057/create-account", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      // Debug log
      console.log("[DEBUG] Response status:", response.status);
      let responseText = await response.text();
      console.log("[DEBUG] Response text:", responseText);
      let apiResponse = {};
      try {
        apiResponse = JSON.parse(responseText);
      } catch (e) {
        apiResponse = { error: responseText };
      }
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
        throw new Error(
          apiResponse.message ||
            apiResponse.error ||
            `Lỗi khi thêm nhân viên (HTTP ${response.status}).`
        );
      }
      if (apiResponse.success) {
        Swal.fire("Thành công", "Đã thêm nhân viên mới", "success");
        fetchStaffs();
      } else {
        throw new Error(
          apiResponse.error || apiResponse.message || "Lỗi khi thêm nhân viên."
        );
      }
    } catch (err: any) {
      const errorMessage = err.message || "Lỗi khi lưu thông tin nhân viên.";
      setError(errorMessage);
      Swal.fire(errorMessage, "error");
    } finally {
      closeModal();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "facilityId" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      image: file ? URL.createObjectURL(file) : prev.image,
    }));
  };

  // Handle multiple facility selection
  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, facilityId: Number(e.target.value) }));
  };

  const closeModal = () => {
    setSelectedStaff(null);
    setFormData({
      name: "",
      phone: "",
      dob: "",
      image: "",
      imageFile: null,
      startTime: "",
      endTime: "",
      email: "",
      password: "",
      status: "Active",
      facilityId: null,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md z-20">
          <Sidebar />
        </div>

        <main className="flex-1 ml-64 max-w-8xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quản lý nhân viên</h2>
            <button
              onClick={() => {
                setSelectedStaff(null);
                setFormData({
                  name: "",
                  phone: "",
                  dob: "",
                  image: "",
                  imageFile: null,
                  startTime: "",
                  endTime: "",
                  email: "",
                  password: "",
                  status: "Active",
                  facilityId: null,
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FiPlus /> Thêm nhân viên
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={fetchStaffs}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}
          <div className="flex items-center mb-6 bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200 h-12">
            <span className="flex items-center justify-center h-full pl-4 pr-2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ display: "block" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT, ID cơ sở hoặc tên cơ sở..."
              className="flex-1 bg-transparent border-none outline-none h-full px-2 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minHeight: "2.5rem" }}
            />
          </div>

          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full bg-white divide-y divide-gray-200 text-sm">
              <thead className="bg-green-200 text-black-700 text-left">
                <tr>
                  <th className="p-3">Ảnh</th>
                  <th className="p-3">Tên</th>
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Giờ bắt đầu</th>
                  <th className="p-3">Cơ sở</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-6">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredStaffs.length > 0 ? (
                  filteredStaffs.map((staff) => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={staff.image}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-3 font-medium">{staff.name}</td>
                      <td className="p-3">{staff.phone}</td>
                      <td className="p-3">{staff.email}</td>
                      <td className="p-3">
                        {staff.startTime
                          ? new Date(staff.startTime).toLocaleString("vi-VN")
                          : ""}
                      </td>
                      <td className="p-3">{staff.facilityNames.join(", ")}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            staff.status === "Active"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {staff.status === "Active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </span>
                      </td>
                      <td className="p-3 space-x-2 flex items-center">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="text-green-600 hover:text-green-800"
                          title="Chỉnh sửa"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => toggleStatus(staff.id)}
                          className={`${
                            staff.status === "Active"
                              ? "text-red-600 hover:text-red-800"
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                          title={
                            staff.status === "Active"
                              ? "Chuyển thành Không hoạt động"
                              : "Kích hoạt lại nhân viên"
                          }
                        >
                          {staff.status === "Active" ? (
                            <FiSlash size={18} />
                          ) : (
                            <FiCheckCircle size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => deleteStaff(staff.id, staff.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa nhân viên"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-gray-500 py-6">
                      Không có nhân viên nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all">
          <div className="relative w-full max-w-lg mx-2 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="text-xl font-bold text-blue-800">
                  {selectedStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-blue-700 transition-colors"
                  title="Đóng"
                >
                  <FiX size={22} />
                </button>
              </div>
              {/* Body */}
              <div className="px-6 py-6 bg-white overflow-y-auto flex-1">
                <form className="grid grid-cols-2 gap-5 text-sm">
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nhập tên nhân viên"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      SĐT <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      maxLength={20}
                      minLength={10}
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      required
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dob"
                      placeholder="Ngày sinh"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày bắt đầu làm việc
                    </label>
                    <input
                      type="date"
                      name="startTime"
                      placeholder="Ngày bắt đầu làm việc"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col col-span-2 sm:col-span-1">
                    <label className="mb-1 font-semibold text-gray-700">
                      Ngày kết thúc làm việc
                    </label>
                    <input
                      type="date"
                      name="endTime"
                      placeholder="Ngày kết thúc làm việc"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label
                      htmlFor="image"
                      className="mb-1 font-semibold text-gray-700"
                    >
                      Ảnh đại diện (URL)
                    </label>
                    <input
                      type="url"
                      id="image"
                      name="image"
                      value={formData.image || ""}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL của ảnh đại diện (không bắt buộc)
                    </p>
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="mt-3 w-24 h-24 object-cover rounded-lg shadow border border-gray-200"
                      />
                    )}
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 font-semibold text-gray-700">
                      Cơ sở <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="facilityId"
                      value={formData.facilityId ?? ""}
                      onChange={handleFacilityChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      title="Chọn cơ sở làm việc"
                      required
                    >
                      <option value="" disabled>
                        Chọn cơ sở
                      </option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <label className="mb-1 font-semibold text-gray-700">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      title="Chọn trạng thái hoạt động"
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Không hoạt động</option>
                    </select>
                  </div>
                </form>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-colors font-medium shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
