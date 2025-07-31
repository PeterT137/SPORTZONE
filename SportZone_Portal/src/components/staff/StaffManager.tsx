"use client";

import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheckCircle, FiSlash } from "react-icons/fi";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

type Staff = {
    id: number;
    name: string;
    phone: string;
    dob: string; // yyyy-MM-dd
    image: string;
    start_time: string; // ISO string
    end_time: string; // ISO string
    email: string;
    status: "Active" | "Inactive";
};

type EditStaff = Omit<Staff, "id">;

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
        start_time: "",
        end_time: "",
        email: "",
        status: "Active",
    });

    // Format ISO string thành 'yyyy-MM-ddTHH:mm' dùng cho datetime-local input
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

    const mockStaffs: Staff[] = [
        {
            id: 1,
            name: "Nguyen Van A",
            phone: "0901234567",
            dob: "1995-05-10",
            image: "https://i.pravatar.cc/150?img=1",
            start_time: "2025-07-21T08:00:00",
            end_time: "2025-07-21T17:00:00",
            email: "a.nguyen@example.com",
            status: "Active",
        },
        {
            id: 2,
            name: "Tran Thi B",
            phone: "0912345678",
            dob: "1992-09-15",
            image: "https://i.pravatar.cc/150?img=2",
            start_time: "2025-07-21T08:30:00",
            end_time: "2025-07-21T17:30:00",
            email: "b.tran@example.com",
            status: "Inactive",
        },
    ];

    useEffect(() => {
        setStaffs(mockStaffs);
        setFilteredStaffs(mockStaffs);
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

    // Hàm toggle trạng thái Active/Inactive
    const toggleStatus = (id: number) => {
        const staff = staffs.find((s) => s.id === id);
        if (!staff) return;

        const newStatus = staff.status === "Active" ? "Inactive" : "Active";

        Swal.fire({
            title:
            newStatus === "Inactive"
              ? `Bạn có muốn tạm ngưng hoạt động của "${staff.name}"?`
              : `Bạn có muốn kích hoạt lại "${staff.name}"?`,

            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Đồng ý",
            cancelButtonText: "Huỷ",
        }).then((result) => {
            if (result.isConfirmed) {
                setStaffs((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
                );
                Swal.fire(
                    "Thành công",
                    `Nhân viên đã được chuyển thành trạng thái ${newStatus === "Active" ? "Hoạt động" : "Không hoạt động"}.`,
                    "success"
                );
            }
        });
    };

    const handleEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setFormData({
            ...staff,
            start_time: formatDateTimeLocal(staff.start_time),
            end_time: formatDateTimeLocal(staff.end_time),
            dob: formatDate(staff.dob),
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.phone || !formData.email) {
            Swal.fire("Lỗi", "Vui lòng điền đầy đủ tên, email và SĐT", "error");
            return;
        }

        const updatedFormData = {
            ...formData,
            start_time: formData.start_time ? new Date(formData.start_time).toISOString() : "",
            end_time: formData.end_time ? new Date(formData.end_time).toISOString() : "",
            dob: formData.dob, // đã ở dạng yyyy-MM-dd
        };

        if (selectedStaff) {
            setStaffs((prev) =>
                prev.map((s) =>
                    s.id === selectedStaff.id ? { ...s, ...updatedFormData } : s
                )
            );
            Swal.fire("Thành công", "Đã cập nhật nhân viên", "success");
        } else {
            const newStaff: Staff = {
                id: staffs.length ? Math.max(...staffs.map((s) => s.id)) + 1 : 1,
                ...updatedFormData,
            };
            setStaffs((prev) => [...prev, newStaff]);
            Swal.fire("Thành công", "Đã thêm nhân viên mới", "success");
        }

        closeModal();
    };

    // Dùng chung cho tất cả input/select trong modal
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
            start_time: "",
            end_time: "",
            email: "",
            status: "Active",
        });
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="flex min-h-[calc(100vh-64px)]">
                <div className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white shadow-md z-20">
                    <Sidebar />
                </div>

                <main className="flex-1 ml-64 max-w-7xl mx-auto px-6 py-6">
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
                                    start_time: "",
                                    end_time: "",
                                    email: "",
                                    status: "Active",
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
                                                {staff.start_time
                                                    ? new Date(staff.start_time).toLocaleString("vi-VN")
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
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                    className="border px-3 py-2 rounded"
                                />
                            </label>
                            <label className="col-span-1 flex flex-col text-sm text-gray-700">
                                Giờ kết thúc:
                                <input
                                    type="datetime-local"
                                    name="end_time"
                                    value={formData.end_time}
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
