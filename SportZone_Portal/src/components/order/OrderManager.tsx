/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Header from '../Header';

type Order = {
    id: number;
    customer_name: string;
    product: string;
    quantity: number;
    total_amount: number;
    status: string;
};

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([
        { id: 1, customer_name: 'Nguyen Van A', product: 'Sân 5A', quantity: 1, total_amount: 500000, status: 'Hoàn thành' },
        { id: 2, customer_name: 'Tran Thi B', product: 'Sân 7B', quantity: 2, total_amount: 1600000, status: 'Chờ xử lý' },
    ]);

    const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
    const [formData, setFormData] = useState<Omit<Order, 'id'>>({
        customer_name: '',
        product: '',
        quantity: 0,
        total_amount: 0,
        status: 'Chờ xử lý',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.customer_name || !formData.product || !formData.quantity || !formData.total_amount) {
            showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return;
        }

        if (editId !== null) {
            setOrders(prev => prev.map(o => (o.id === editId ? { ...o, ...formData } : o)));
            setFilteredOrders(prev => prev.map(o => (o.id === editId ? { ...o, ...formData } : o)));
            showToast('Cập nhật đơn hàng thành công!');
        } else {
            const newOrder: Order = {
                id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
                ...formData,
            };
            setOrders(prev => [...prev, newOrder]);
            setFilteredOrders(prev => [...prev, newOrder]);
            showToast('Thêm đơn hàng thành công!');
        }

        resetForm();
    };

    const handleEdit = (id: number) => {
        const target = orders.find(o => o.id === id);
        if (target) {
            const { id: _, ...rest } = target;
            setFormData(rest);
            setEditId(id);
            setShowModal(true);
        }
    };

    const handleDelete = () => {
        if (orderToDelete === null) return;

        setOrders(prev => prev.filter(o => o.id !== orderToDelete));
        setFilteredOrders(prev => prev.filter(o => o.id !== orderToDelete));
        showToast('Xóa đơn hàng thành công!', 'success');

        const totalPages = Math.ceil(filteredOrders.length / pageSize);
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }

        setShowDeleteModal(false);
        setOrderToDelete(null);
    };

    const resetForm = () => {
        setFormData({ customer_name: '', product: '', quantity: 0, total_amount: 0, status: 'Chờ xử lý' });
        setEditId(null);
        setShowModal(false);
    };

    const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value.toLowerCase();
        setSearchKeyword(searchTerm);
        setCurrentPage(1);

        if (searchTerm.trim() === '') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(
                orders.filter(o =>
                    o.customer_name.toLowerCase().includes(searchTerm) ||
                    o.product.toLowerCase().includes(searchTerm) ||
                    o.status.toLowerCase().includes(searchTerm)
                )
            );
        }
    };

    const goToPage = (page: number) => setCurrentPage(page);
    const goToPrevPage = () => currentPage > 1 && setCurrentPage(prev => prev - 1);
    const goToNextPage = () => {
        const totalPages = Math.ceil(filteredOrders.length / pageSize);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const changePageSize = (e: ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredOrders.length);
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    const renderPaginationNumbers = () => {
        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        if (startPage > 1) {
            pageNumbers.push(<button key={1} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(1)}>1</button>);
            if (startPage > 2) pageNumbers.push(<span key="ellipsis-start" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    className={`px-4 py-2 border text-sm ${i === currentPage ? 'bg-primary text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    onClick={() => goToPage(i)}
                    disabled={i === currentPage}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pageNumbers.push(<span key="ellipsis-end" className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-700">...</span>);
            pageNumbers.push(<button key={totalPages} className="px-4 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50" onClick={() => goToPage(totalPages)}>{totalPages}</button>);
        }

        return pageNumbers;
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
                                <span style={{ color: 'white' }}>➕</span>
                                <span>Thêm mới</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white shadow !rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách hàng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền (VND)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Không tìm thấy đơn hàng nào</td></tr>
                                    ) : (
                                        currentOrders.map(order => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.product}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total_amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.status === 'Hoàn thành' ? <span className="text-green-600">{order.status}</span> : <span className="text-yellow-600">{order.status}</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-primary hover:text-primary/80" onClick={() => handleEdit(order.id)}>Sửa</button>
                                                        <button className="text-red-600 hover:text-red-800" onClick={() => { setOrderToDelete(order.id); setShowDeleteModal(true); }}>Xóa</button>
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
                                <button className={`px-4 py-2 border border-gray-300 text-sm !rounded-button text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>Trước</button>
                                <div className="text-sm text-gray-700 py-2">{currentPage} / {totalPages}</div>
                                <button className={`px-4 py-2 border border-gray-300 text-sm !rounded-button text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>Sau</button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-700">Hiển thị {filteredOrders.length > 0 ? startIndex + 1 : 0} đến {endIndex} của {filteredOrders.length} kết quả</p>
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <label htmlFor="page-size" className="text-sm text-gray-700 mr-2">Hiển thị:</label>
                                        <select id="page-size" className="border border-gray-300 !rounded-button text-sm pr-8 py-1 focus:ring-primary focus:border-primary" value={pageSize} onChange={changePageSize}>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                            <option value="50">50</option>
                                        </select>
                                    </div>
                                    <nav className="relative z-0 inline-flex !rounded-button shadow-sm -space-x-px" aria-label="Pagination">
                                        <button className={`px-2 py-2 !rounded-l-button border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToPrevPage} disabled={currentPage === 1}>←</button>
                                        <div className="flex">{renderPaginationNumbers()}</div>
                                        <button className={`px-2 py-2 !rounded-r-button border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50 ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>→</button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {showModal && (
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block align-bottom bg-white !rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg leading-6 font-medium text-gray-900">{editId !== null ? 'Chỉnh sửa đơn hàng' : 'Thêm đơn hàng mới'}</h3>
                                                <button type="button" className="text-gray-600 hover:text-red-500" onClick={resetForm}>X</button>
                                            </div>
                                            <form id="order-form" className="space-y-4" onSubmit={handleSubmit}>
                                                <div>
                                                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                                                    <input type="text" id="customer_name" name="customer_name" className="mt-1 block w-full border border-gray-300 !rounded-button shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" value={formData.customer_name} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="product" className="block text-sm font-medium text-gray-700">Sản phẩm</label>
                                                    <input type="text" id="product" name="product" className="mt-1 block w-full border border-gray-300 !rounded-button shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" value={formData.product} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
                                                    <input type="number" id="quantity" name="quantity" className="mt-1 block w-full border border-gray-300 !rounded-button shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" value={formData.quantity} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700">Tổng tiền (VND)</label>
                                                    <input type="number" id="total_amount" name="total_amount" className="mt-1 block w-full border border-gray-300 !rounded-button shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" value={formData.total_amount} onChange={handleChange} required />
                                                </div>
                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                                    <select id="status" name="status" className="mt-1 block w-full border border-gray-300 !rounded-button shadow-sm py-2 px-3 focus:ring-primary focus:border-primary" value={formData.status} onChange={handleChange} required>
                                                        <option value="Chờ xử lý">Chờ xử lý</option>
                                                        <option value="Hoàn thành">Hoàn thành</option>
                                                        <option value="Đã hủy">Đã hủy</option>
                                                    </select>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" form="service-form" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">Lưu</button>
                                    <button type="button" className="mt-3 w-full inline-flex justify-center !rounded-button border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto" onClick={resetForm}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 bg-gray-500 opacity-75"></div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
                            <div className="inline-block align-bottom bg-white !rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 !rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <span className="text-red-600">!</span>
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
                                            <div className="mt-2"><p className="text-sm text-gray-500">Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="button" className="w-full inline-flex justify-center !rounded-button border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto" onClick={handleDelete}>Xóa</button>
                                    <button type="button" className="mt-3 w-full inline-flex justify-center !rounded-button border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3" onClick={() => setShowDeleteModal(false)}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderManager;