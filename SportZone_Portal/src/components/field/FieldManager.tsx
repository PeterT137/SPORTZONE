/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Header from '../Header';

type Field = {
    id: number;
    fac_id: number;
    category_id: number;
    field_name: string;
    description: string;
    price: number;
    is_booking_enable: boolean;
};

const FieldManager: React.FC = () => {
    const [fields, setFields] = useState<Field[]>([
        { id: 1, fac_id: 1, category_id: 1, field_name: 'Sân 5A', description: 'Sân bóng đá 5 người', price: 500000, is_booking_enable: true },
        { id: 2, fac_id: 2, category_id: 2, field_name: 'Sân 7B', description: 'Sân bóng đá 7 người', price: 800000, is_booking_enable: false },
    ]);
    const [filteredFields, setFilteredFields] = useState<Field[]>(fields);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<Field, 'id'>>({
        fac_id: 0, category_id: 0, field_name: '', description: '', price: 0, is_booking_enable: true,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        Swal.fire({ toast: true, position: 'top-end', icon: type, title: message, showConfirmButton: false, timer: 2500, timerProgressBar: true });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const { name, value, type } = target;

        let val: string | number | boolean;
        if (type === 'checkbox') {
            val = (target as HTMLInputElement).checked; // Ép kiểu rõ ràng cho checkbox
        } else if (type === 'number') {
            val = Number(value);
        } else {
            val = value;
        }

        setFormData(prev => ({ ...prev, [name]: val }));
    };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.field_name || !formData.description || !formData.fac_id || !formData.category_id || !formData.price) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        if (editId !== null) {
            setFields(prev => prev.map(f => (f.id === editId ? { ...f, ...formData } : f)));
            setFilteredFields(prev => prev.map(f => (f.id === editId ? { ...f, ...formData } : f)));
            showToast('Cập nhật thành công!');
        } else {
            const newField: Field = { id: Math.max(...fields.map(f => f.id)) + 1 || 1, ...formData };
            setFields(prev => [...prev, newField]);
            setFilteredFields(prev => [...prev, newField]);
            showToast('Thêm thành công!');
        }
        resetForm();
    };

    const handleEdit = (id: number) => {
        const field = fields.find(f => f.id === id);
        if (field) {
            const { id: _, ...rest } = field;
            setFormData(rest);
            setEditId(id);
            setShowModal(true);
        }
    };

    const handleDelete = () => {
        if (fieldToDelete === null) return;
        setFields(prev => prev.filter(f => f.id !== fieldToDelete));
        setFilteredFields(prev => prev.filter(f => f.id !== fieldToDelete));
        showToast('Xóa thành công!');
        setShowDeleteModal(false);
        setFieldToDelete(null);
    };

    const resetForm = () => {
        setFormData({ fac_id: 0, category_id: 0, field_name: '', description: '', price: 0, is_booking_enable: true });
        setEditId(null);
        setShowModal(false);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKeyword(keyword);
        setCurrentPage(1);
        setFilteredFields(keyword ? fields.filter(f => f.field_name.toLowerCase().includes(keyword) || f.description.toLowerCase().includes(keyword)) : fields);
    };

    const goToPage = (page: number) => setCurrentPage(page);
    const goToPrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);
    const goToNextPage = () => {
        const totalPages = Math.ceil(filteredFields.length / pageSize);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const totalPages = Math.ceil(filteredFields.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredFields.length);
    const currentFields = filteredFields.slice(startIndex, endIndex);

    const renderPaginationNumbers = () => {
        const pages = [];
        let start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + 4);
        if (end - start < 4) start = Math.max(1, end - 4);
        if (start > 1) {
            pages.push(<button key={1} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(1)}>1</button>);
            if (start > 2) pages.push(<span key="start-ellipsis" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
        }
        for (let i = start; i <= end; i++) {
            pages.push(
                <button
                    key={i}
                    className={`px-4 py-2 border ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => goToPage(i)}
                    disabled={i === currentPage}
                >
                    {i}
                </button>
            );
        }
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
            pages.push(<button key={totalPages} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(totalPages)}>{totalPages}</button>);
        }
        return pages;
    };

    return (
        <><Header />
            <div className="min-h-screen flex flex-col bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Sân</h1>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    🔍
                                </div>
                                <input
                                    type="text"
                                    id="search-input"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md pl-10 pr-4 py-2 focus:ring-blue-600 focus:border-blue-600 block w-64"
                                    placeholder="Tìm kiếm sân..."
                                    value={searchKeyword}
                                    onChange={handleSearch}
                                />
                            </div>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                                onClick={() => { setShowModal(true); setEditId(null); }}
                            >
                                <span color='#fff'>➕</span>
                                <span>Thêm mới</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sân</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cơ sở</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại sân</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá (VND)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentFields.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">Không có dữ liệu</td></tr>
                                    ) : (
                                        currentFields.map(field => (
                                            <tr key={field.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.field_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.fac_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.category_id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.price.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{field.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {field.is_booking_enable ? 'Cho phép' : 'Không cho phép'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(field.id)}>
                                                            ✏️
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800" onClick={() => { setFieldToDelete(field.id); setShowDeleteModal(true); }}>
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>⬅️ Trước</button>
                                <span className="text-sm text-gray-700 py-2">{currentPage} / {totalPages}</span>
                                <button className={`px-4 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>Sau ➡️</button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-700">Hiển thị {startIndex + 1} đến {endIndex} của {filteredFields.length}</p>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>
                                        ⬅️
                                    </button>
                                    <div className="flex">{renderPaginationNumbers()}</div>
                                    <button className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                                        ➡️
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </main>

                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">{editId ? 'Chỉnh sửa sân' : 'Thêm sân mới'}</h3>
                                                <button type="button" className="text-gray-400 hover:text-gray-500" onClick={resetForm}>
                                                    ❌
                                                </button>
                                            </div>
                                            <form id="field-form" className="mt-4 space-y-4" onSubmit={handleSubmit}>
                                                <div>
                                                    <label htmlFor="field_name" className="block text-sm font-medium text-gray-700">Tên sân</label>
                                                    <input
                                                        type="text"
                                                        id="field_name"
                                                        name="field_name"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                                                        value={formData.field_name}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="fac_id" className="block text-sm font-medium text-gray-700">ID cơ sở</label>
                                                    <input
                                                        type="number"
                                                        id="fac_id"
                                                        name="fac_id"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                                                        value={formData.fac_id}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">ID loại sân</label>
                                                    <input
                                                        type="number"
                                                        id="category_id"
                                                        name="category_id"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                                                        value={formData.category_id}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá (VND)</label>
                                                    <input
                                                        type="number"
                                                        id="price"
                                                        name="price"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                                                    <textarea
                                                        id="description"
                                                        name="description"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                                                        value={formData.description}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="is_booking_enable"
                                                            checked={formData.is_booking_enable}
                                                            onChange={handleChange}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">Cho phép đặt sân</span>
                                                    </label>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        form="field-form"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto"
                                        onClick={resetForm}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            ⚠️
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">Bạn có chắc chắn muốn xóa?</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto"
                                        onClick={handleDelete}
                                    >
                                        Xóa
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3"
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FieldManager;