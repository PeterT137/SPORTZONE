/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CheckCircle, Edit3, Trash2, X } from 'lucide-react';
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Header from '../Header';

type Field = {
    id: number; // field_id
    fac_id: number;
    category_id: number;
    field_name: string;
    description: string;
    price: number;
    is_booking_enable: boolean;
};

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
    });
};

const FieldManager: React.FC = () => {
    const [fields, setFields] = useState<Field[]>([
        {
            id: 1,
            fac_id: 101,
            category_id: 1,
            field_name: 'Sân A1',
            description: 'Sân cỏ nhân tạo tiêu chuẩn 5 người, gần khu nhà A',
            price: 150000,
            is_booking_enable: true,
        },
        {
            id: 2,
            fac_id: 101,
            category_id: 2,
            field_name: 'Sân A2',
            description: 'Sân futsal trong nhà, sàn nhựa cao cấp, ánh sáng LED',
            price: 180000,
            is_booking_enable: false,
        },
        {
            id: 3,
            fac_id: 102,
            category_id: 1,
            field_name: 'Sân B1',
            description: 'Sân bóng đá mini ngoài trời, có mái che, thoáng mát',
            price: 120000,
            is_booking_enable: true,
        },
        {
            id: 4,
            fac_id: 102,
            category_id: 3,
            field_name: 'Sân Tennis Cơ sở B',
            description: 'Sân tennis tiêu chuẩn quốc tế, mặt sân cứng, có đèn đêm',
            price: 250000,
            is_booking_enable: true,
        },
        {
            id: 5,
            fac_id: 103,
            category_id: 4,
            field_name: 'Sân Cầu Lông VIP',
            description: 'Sàn gỗ chống trượt, hệ thống đèn LED, điều hòa 2 chiều',
            price: 100000,
            is_booking_enable: false,
        },
        {
            id: 6,
            fac_id: 104,
            category_id: 5,
            field_name: 'Sân Bóng Rổ Trung Tâm',
            description: 'Rổ tiêu chuẩn NBA, khán đài nhỏ, có nhà vệ sinh riêng',
            price: 200000,
            is_booking_enable: true,
        }
    ]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState<Omit<Field, 'id'>>({
        fac_id: 0,
        category_id: 0,
        field_name: '',
        description: '',
        price: 0,
        is_booking_enable: true,
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        const val =
            type === 'checkbox'
                ? target.checked
                : name === 'price' || name.endsWith('_id')
                    ? Number(value)
                    : value;

        setFormData(prev => ({ ...prev, [name]: val }));
    };


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.field_name || !formData.description) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        if (editId !== null) {
            setFields(prev => prev.map(f => (f.id === editId ? { ...f, ...formData } : f)));
            showToast('Cập nhật thành công!');
        } else {
            const newField: Field = {
                id: Date.now(),
                ...formData
            };
            setFields(prev => [...prev, newField]);
            showToast('Thêm thành công!');
        }

        resetForm();
    };

    const handleEdit = (id: number) => {
        const target = fields.find(f => f.id === id);
        if (target) {
            const { id: _, ...rest } = target;
            setFormData(rest);
            setEditId(id);
            setShowPopup(true);
        }
    };

    const handleDelete = (id: number) => {
        const target = fields.find(f => f.id === id);
        if (!target) return;

        Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có chắc chắn muốn xóa sân "${target.field_name}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#e53e3e',
        }).then((result) => {
            if (result.isConfirmed) {
                setFields(prev => prev.filter(f => f.id !== id));
                showToast('Đã xóa!', 'success');
            }
        });
    };

    const resetForm = () => {
        setFormData({
            fac_id: 0,
            category_id: 0,
            field_name: '',
            description: '',
            price: 0,
            is_booking_enable: true
        });
        setEditId(null);
        setShowPopup(false);
    };

    const filteredFields = fields.filter(f =>
        f.field_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        f.description.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <>
            <Header />
            <div className="min-h-screen p-6 text-gray-800 max-w-6xl mx-auto font-[Poppins]">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-green-700 mb-6">📋 Quản lý Sân</h1>
                    <input
                        type="text"
                        placeholder="🔍 Tìm theo tên hoặc mô tả..."
                        className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-lg"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </header>

                <section className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 mb-10">
                    <h2 className="text-2xl font-semibold text-green-700 mb-6">➕ Thêm Sân</h2>
                    <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
                        <input name="field_name" required placeholder="⚽ Tên sân" value={formData.field_name} onChange={handleChange}
                            className="px-4 py-3 border rounded-md" />
                        <input name="fac_id" type="number" required placeholder="🏢 ID cơ sở" value={formData.fac_id} onChange={handleChange}
                            className="px-4 py-3 border rounded-md" />
                        <input name="category_id" type="number" required placeholder="📂 ID loại sân" value={formData.category_id} onChange={handleChange}
                            className="px-4 py-3 border rounded-md" />
                        <input name="price" type="number" required placeholder="💰 Giá thuê" value={formData.price} onChange={handleChange}
                            className="px-4 py-3 border rounded-md" />
                        <textarea name="description" required placeholder="📝 Mô tả" value={formData.description} onChange={handleChange}
                            className="md:col-span-2 px-4 py-3 border rounded-md resize-none" />
                        <label className="flex items-center gap-2 col-span-2">
                            <input type="checkbox" name="is_booking_enable" checked={formData.is_booking_enable} onChange={handleChange} />
                            Cho phép đặt sân
                        </label>
                        <button type="submit"
                            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <CheckCircle size={20} /> {editId !== null ? 'Cập nhật' : 'Thêm Sân'}
                        </button>
                    </form>
                </section>

                <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredFields.map(field => (
                        <div
                            key={field.id}
                            className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 border-l-4 
                ${field.is_booking_enable ? 'border-green-500' : 'border-red-500'} hover:shadow-lg transition-all`}
                        >
                            <h3 className="text-green-700 font-semibold text-xl mb-2 truncate">
                                ⚽ {field.field_name}
                            </h3>

                            <div className="text-sm text-gray-700 space-y-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500">🏢</span> <span>Cơ sở: <b>{field.fac_id}</b></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500">📂</span> <span>Loại sân: <b>{field.category_id}</b></span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500">💰</span> <span>{field.price.toLocaleString()} VND</span>
                                </div>
                                <div
                                    className="text-gray-600 truncate"
                                    title={field.description}
                                >
                                    📝 {field.description.length > 50
                                        ? field.description.slice(0, 50) + '...'
                                        : field.description}
                                </div>
                                <div
                                    className={`font-semibold ${field.is_booking_enable ? 'text-green-600' : 'text-red-500'
                                        }`}
                                >
                                    {field.is_booking_enable ? 'Đang cho phép đặt sân' : 'Không cho phép đặt sân'}
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => handleEdit(field.id)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <Edit3 size={16} /> Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(field.id)}
                                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </section>


                {showPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold text-green-700">🛠️ Chỉnh sửa Sân</h2>
                                <button onClick={() => resetForm()} className="text-gray-600 hover:text-red-500 text-xl font-bold">
                                    <X />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="grid gap-4">
                                <input name="field_name" required value={formData.field_name} onChange={handleChange}
                                    className="px-4 py-2 border rounded-md" placeholder="Tên sân" />
                                <input name="fac_id" type="number" required value={formData.fac_id} onChange={handleChange}
                                    className="px-4 py-2 border rounded-md" placeholder="ID cơ sở" />
                                <input name="category_id" type="number" required value={formData.category_id} onChange={handleChange}
                                    className="px-4 py-2 border rounded-md" placeholder="ID loại sân" />
                                <input name="price" type="number" required value={formData.price} onChange={handleChange}
                                    className="px-4 py-2 border rounded-md" placeholder="Giá" />
                                <textarea name="description" required value={formData.description} onChange={handleChange}
                                    className="px-4 py-2 border rounded-md resize-none" placeholder="Mô tả" />
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" name="is_booking_enable" checked={formData.is_booking_enable} onChange={handleChange} />
                                    Cho phép đặt sân
                                </label>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={resetForm}
                                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
                                        Đóng
                                    </button>
                                    <button type="submit"
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FieldManager;
