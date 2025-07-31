/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiEdit, FiPlus, FiSlash, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

type Staff = {
    id: number; // Assuming uId is used as id
    name: string;
    phone: string;
    dob: string; // yyyy-MM-dd
    image: string;
    startTime: string; // ISO string or date string
    endTime?: string; // Optional, as API doesn't provide this
    email: string;
    status: "Active" | "Inactive";
    facId: number;
    roleName: string;
    facilityName: string;
};

type EditStaff = Omit<Staff, "id" | "facId" | "roleName" | "facilityName"> & {
    facId?: number; // Optional for new staff
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
        startTime: "",
        endTime: "",
        email: "",
        status: "Active",
        facId: undefined, // Optional for new staff
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Format date string thành 'yyyy-MM-ddTHH:mm' dùng cho datetime-local input
    const formatDateTimeLocal = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const tzOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    };

    // Format ngày sinh 'yyyy-MM-dd' cho input type date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Get auth headers (adjust based on your auth setup)
    // const getAuthHeaders = () => {
    //     const token = localStorage.getItem("token");
    //     return {
    //         "Content-Type": "application/json",
    //         ...(token && { Authorization: `Bearer ${token}` }),
    //     };
    // };

    // Fetch staff data from API and map to Staff type
    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const userString = localStorage.getItem("user");
            const user = userString ? JSON.parse(userString) : null;
            const facId = user?.facId;

            const url = facId
                ? `https://localhost:7057/api/staff?facId=${facId}`
                : `https://localhost:7057/api/staff`;

            const response = await fetch(url); // Không cần headers ở đây

            if (!response.ok) throw new Error("Failed to fetch staff data");

            const data = await response.json();

            const mappedStaffs: Staff[] = data.map((item: any) => ({
                id: item.uId,
                name: item.name || "",
                phone: item.phone || "",
                dob: item.dob || "",
                image: item.image || "",
                startTime: item.startTime || "",
                endTime: "", // Tuỳ chỉnh nếu cần
                email: item.email || "",
                status: item.status || "Inactive",
                facId: item.facId || 0,
                roleName: item.roleName || "Unknown",
                facilityName: item.facilityName || "Unknown",
            }));

            setStaffs(mappedStaffs);
            setFilteredStaffs(mappedStaffs);
        } catch (err) {
            setError("Lỗi khi tải danh sách nhân viên. Vui lòng thử lại.");
            console.error(err);
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
                    s.email.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, staffs]);

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
            cancelButtonText: "Huỷ",
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://localhost:7057/api/staff/${id}/status`, {
                    method: "PATCH",
                    // headers: getAuthHeaders(),
                    body: JSON.stringify({ status: newStatus }),
                });
                if (!response.ok) throw new Error("Failed to update status");
                setStaffs((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
                );
                Swal.fire("Thành công", `Nhân viên đã được chuyển thành trạng thái ${newStatus === "Active" ? "Hoạt động" : "Không hoạt động"}.`, "success");
            } catch (err) {
                setError("Lỗi khi cập nhật trạng thái. Vui lòng thử lại.");
                console.error(err);
                Swal.fire("Lỗi", "Không thể cập nhật trạng thái.", "error");
            }
        }
    };

    const handleEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setFormData({
            ...staff,
            startTime: formatDateTimeLocal(staff.startTime),
            endTime: staff.endTime ? formatDateTimeLocal(staff.endTime) : "",
            dob: formatDate(staff.dob),
            facId: staff.facId, // Include facId if editable
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.email) {
            Swal.fire("Lỗi", "Vui lòng điền đầy đủ tên, email và SĐT", "error");
            return;
        }

        const updatedFormData = {
            ...formData,
            startTime: formData.startTime ? new Date(formData.startTime).toISOString() : "",
            endTime: formData.endTime ? new Date(formData.endTime).toISOString() : "",
            dob: formData.dob, // already in yyyy-MM-dd
            facId: formData.facId || 0, // Default to 0 if not provided
        };

        try {
            if (selectedStaff) {
                const response = await fetch(`https://localhost:7057/api/staff/${selectedStaff.id}`, {
                    method: "PUT",
                    // headers: getAuthHeaders(),
                    body: JSON.stringify(updatedFormData),
                });
                if (!response.ok) throw new Error("Failed to update staff");
                setStaffs((prev) =>
                    prev.map((s) =>
                        s.id === selectedStaff.id ? { ...s, ...updatedFormData, id: selectedStaff.id } : s
                    )
                );
                Swal.fire("Thành công", "Đã cập nhật nhân viên", "success");
            } else {
                const response = await fetch(`https://localhost:7057/api/staff`, {
                    method: "POST",
                    // headers: getAuthHeaders(),
                    body: JSON.stringify(updatedFormData),
                });
                if (!response.ok) throw new Error("Failed to add staff");
                const newStaff = await response.json();
                setStaffs((prev) => [...prev, newStaff]);
                Swal.fire("Thành công", "Đã thêm nhân viên mới", "success");
            }
        } catch (err) {
            setError("Lỗi khi lưu thông tin nhân viên. Vui lòng thử lại.");
            console.error(err);
            Swal.fire("Lỗi", "Không thể lưu thông tin.", "error");
        } finally {
            closeModal();
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const closeModal = () => {
        setSelectedStaff(null);
        setFormData({
            name: "",
            phone: "",
            dob: "",
            image: "",
            startTime: "",
            endTime: "",
            email: "",
            status: "Active",
            facId: undefined,
        });
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex justify-center items-center">
                <p>Đang tải...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16 flex justify-center items-center">
                <div className="text-red-600">{error}</div>
                <button
                    onClick={fetchStaffs}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

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
                                    startTime: "",
                                    endTime: "",
                                    email: "",
                                    status: "Active",
                                    facId: undefined,
                                });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            <FiPlus /> Thêm nhân viên
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
                        className="w-full border px-4 py-2 rounded-md mb-4"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="overflow-x-auto border rounded-md">
                        <table className="min-w-full bg-white divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100 text-gray-700 text-left">
                                <tr>
                                    <th className="p-3">Ảnh</th>
                                    <th className="p-3">Tên</th>
                                    <th className="p-3">SĐT</th>
                                    <th className="p-3">Ngày sinh</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Giờ bắt đầu</th>
                                    <th className="p-3">Trạng thái</th>
                                    <th className="p-3">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.length > 0 ? (
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
                                            <td className="p-3">{staff.dob}</td>
                                            <td className="p-3">{staff.email}</td>
                                            <td className="p-3">
                                                {staff.startTime
                                                    ? new Date(staff.startTime).toLocaleString("vi-VN")
                                                    : ""}
                                            </td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded text-white ${staff.status === "Active"
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
                                                    className={`${staff.status === "Active"
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
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="text-center text-gray-500 py-6">
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
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                            title="Đóng"
                        >
                            <FiX size={20} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">
                            {selectedStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Tên"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="SĐT"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                type="date"
                                name="dob"
                                placeholder="Ngày sinh"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded"
                            />
                            <input
                                type="text"
                                name="image"
                                placeholder="URL ảnh"
                                value={formData.image}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded col-span-2"
                            />
                            <label className="col-span-1 flex flex-col text-sm text-gray-700">
                                Giờ bắt đầu:
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="border px-3 py-2 rounded"
                                />
                            </label>
                            <label className="col-span-1 flex flex-col text-sm text-gray-700">
                                Giờ kết thúc:
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime || ""}
                                    onChange={handleInputChange}
                                    className="border px-3 py-2 rounded"
                                />
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded col-span-2"
                            >
                                <option value="Active">Hoạt động</option>
                                <option value="Inactive">Không hoạt động</option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManager;