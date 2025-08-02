/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiEdit, FiPlus, FiSlash, FiTrash2, FiX } from "react-icons/fi";
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
    status: "Active" | "Inactive";
    facIds: number[];
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
        status: "Active",
        facIds: [],
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [facilities, setFacilities] = useState<{ id: number; name: string }[]>([]);

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
            const userId = user?.UId;

            const facilityList = user?.FieldOwner?.facilities?.map((f: any) => ({
                id: f.facId,
                name: f.name || `Facility ${f.facId}`,
            })) || [];
            setFacilities(facilityList);

            let allStaffs: any[] = [];

            if (roleId === 3) {
                // Admin lấy toàn bộ staff
                const response = await fetch(`https://localhost:7057/api/Staff/GetAll`);
                if (!response.ok) throw new Error(`Lỗi tải tất cả nhân viên (HTTP ${response.status})`);
                const apiResponse = await response.json();
                if (apiResponse.success) allStaffs = apiResponse.data || [];
                else throw new Error(apiResponse.message || "Không thể lấy nhân viên.");
            } else{
                // FieldOwner lấy theo userId
                const response = await fetch(`https://localhost:7057/api/Staff/field-owner/${userId}`);
                if (!response.ok) throw new Error(`Lỗi tải nhân viên chủ sân (HTTP ${response.status})`);
                const apiResponse = await response.json();
                if (apiResponse.success) allStaffs = apiResponse.data || [];
                else throw new Error(apiResponse.message || "Không thể lấy nhân viên.");
            } 

            // Gộp danh sách staff không trùng uId
            const staffMap = new Map<number, Staff>();

            allStaffs.forEach((item: any) => {
                const uId = item.uId;
                const existingStaff = staffMap.get(uId);

                const facId = item.fac?.facId || item.facId;
                const facName = item.fac?.name || "Unknown";

                const userNav = item.uIdNavigation || {};

                if (existingStaff) {
                    if (!existingStaff.facIds.includes(facId)) {
                        existingStaff.facIds.push(facId);
                        existingStaff.facilityNames.push(facName);
                    }
                } else {
                    staffMap.set(uId, {
                        id: uId,
                        name: item.name || "",
                        phone: item.phone || "",
                        dob: item.dob || "",
                        image: userNav.image || "/default-avatar.jpg",
                        startTime: item.startTime || "",
                        endTime: "", // nếu có thì thêm
                        email: userNav.uEmail || "",
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
            const errorMessage = err.message || "Lỗi khi tải danh sách nhân viên. Vui lòng thử lại.";
            setError(errorMessage);
            Swal.fire("Lỗi", errorMessage, "error");
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
                const response = await fetch(`https://localhost:7057/api/Staff/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Lỗi khi xóa nhân viên (HTTP ${response.status}).`);
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
                Swal.fire("Lỗi", errorMessage, "error");
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
                const response = await fetch(`https://localhost:7057/api/staff/${id}/status`, {
                    method: "PATCH",
                    body: JSON.stringify({ status: newStatus }),
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Lỗi khi cập nhật trạng thái (HTTP ${response.status}).`);
                }
                const apiResponse = await response.json();
                if (apiResponse.success) {
                    setStaffs((prev) =>
                        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
                    );
                    Swal.fire(
                        "Thành công",
                        `Nhân viên đã được chuyển thành trạng thái ${newStatus === "Active" ? "Hoạt động" : "Không hoạt động"
                        }.`,
                        "success"
                    );
                } else {
                    throw new Error(apiResponse.error || "Lỗi khi cập nhật trạng thái.");
                }
            } catch (err: any) {
                const errorMessage = err.message || "Lỗi khi cập nhật trạng thái.";
                setError(errorMessage);
                Swal.fire("Lỗi", errorMessage, "error");
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
            status: staff.status,
            facIds: staff.facIds,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.email) {
            Swal.fire("Lỗi", "Vui lòng điền đầy đủ tên, email và SĐT", "error");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("Name", formData.name);
        formDataToSend.append("Phone", formData.phone);
        formDataToSend.append("Email", formData.email);
        if (formData.dob) formDataToSend.append("Dob", formData.dob);
        if (formData.imageFile) formDataToSend.append("ImageFile", formData.imageFile);
        if (formData.facIds.length > 0) formDataToSend.append("FacId", formData.facIds[0].toString());
        if (formData.startTime) formDataToSend.append("StartTime", formData.startTime.split("T")[0]);
        if (formData.endTime) formDataToSend.append("EndTime", formData.endTime.split("T")[0]);

        try {
            if (selectedStaff) {
                const response = await fetch(`https://localhost:7057/api/staff/${selectedStaff.id}`, {
                    method: "PUT",
                    body: formDataToSend,
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Lỗi khi cập nhật nhân viên (HTTP ${response.status}).`);
                }
                const apiResponse = await response.json();
                if (apiResponse.success) {
                    setStaffs((prev) =>
                        prev.map((s) =>
                            s.id === selectedStaff.id
                                ? {
                                    ...s,
                                    ...apiResponse.data,
                                    facIds: apiResponse.data.facIds || [apiResponse.data.facId],
                                    facilityNames:
                                        facilities
                                            .filter((f) =>
                                                (apiResponse.data.facIds || [apiResponse.data.facId]).includes(f.id)
                                            )
                                            .map((f) => f.name) || [apiResponse.data.facilityName],
                                }
                                : s
                        )
                    );
                    Swal.fire("Thành công", "Đã cập nhật nhân viên", "success");
                } else {
                    throw new Error(apiResponse.error || "Lỗi khi cập nhật nhân viên.");
                }
            } else {
                const response = await fetch(`https://localhost:7057/api/staff`, {
                    method: "POST",
                    body: formDataToSend,
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Lỗi khi thêm nhân viên (HTTP ${response.status}).`);
                }
                const apiResponse = await response.json();
                if (apiResponse.success) {
                    setStaffs((prev) => [
                        ...prev,
                        {
                            ...apiResponse.data,
                            facIds: apiResponse.data.facIds || [apiResponse.data.facId],
                            facilityNames:
                                facilities
                                    .filter((f) =>
                                        (apiResponse.data.facIds || [apiResponse.data.facId]).includes(f.id)
                                    )
                                    .map((f) => f.name) || [apiResponse.data.facilityName],
                        },
                    ]);
                    Swal.fire("Thành công", "Đã thêm nhân viên mới", "success");
                } else {
                    throw new Error(apiResponse.error || "Lỗi khi thêm nhân viên.");
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || "Lỗi khi lưu thông tin nhân viên.";
            setError(errorMessage);
            Swal.fire("Lỗi", errorMessage, "error");
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
        const selectedOptions = Array.from(e.target.selectedOptions).map((opt) =>
            Number(opt.value)
        );
        setFormData((prev) => ({ ...prev, facIds: selectedOptions }));
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
            status: "Active",
            facIds: [],
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
                                    status: "Active",
                                    facIds: [],
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

                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, SĐT, ID cơ sở hoặc tên cơ sở..."
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
                                            <td className="p-3">{staff.dob}</td>
                                            <td className="p-3">{staff.email}</td>
                                            <td className="p-3">
                                                {staff.startTime
                                                    ? new Date(staff.startTime).toLocaleString("vi-VN")
                                                    : ""}
                                            </td>
                                            <td className="p-3">{staff.facilityNames.join(", ")}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 rounded text-white ${staff.status === "Active" ? "bg-green-600" : "bg-red-600"
                                                        }`}
                                                >
                                                    {staff.status === "Active" ? "Hoạt động" : "Không hoạt động"}
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
                                maxLength={100}
                            />
                            <input
                                type="text"
                                name="phone"
                                placeholder="SĐT"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="border px-3 py-2 rounded"
                                maxLength={20}
                                minLength={10}
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
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="border px-3 py-2 rounded col-span-2"
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="col-span-2 w-24 h-24 object-cover rounded"
                                />
                            )}
                            <label className="col-span-1 flex flex-col text-sm text-gray-700">
                                Ngày bắt đầu:
                                <input
                                    type="date"
                                    name="startTime"
                                    value={formData.startTime.split("T")[0] || ""}
                                    onChange={handleInputChange}
                                    className="border px-3 py-2 rounded"
                                />
                            </label>
                            <label className="col-span-1 flex flex-col text-sm text-gray-700">
                                Ngày kết thúc:
                                <input
                                    type="date"
                                    name="endTime"
                                    value={formData.endTime.split("T")[0] || ""}
                                    onChange={handleInputChange}
                                    className="border px-3 py-2 rounded"
                                />
                            </label>
                            <select
                                name="facIds"
                                multiple
                                value={formData.facIds.map(String)}
                                onChange={handleFacilityChange}
                                className="border px-3 py-2 rounded col-span-2"
                            >
                                {facilities.map((facility) => (
                                    <option key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
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
                                Hủy
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