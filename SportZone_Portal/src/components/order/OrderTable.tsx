import React, { useState } from 'react';
import Sidebar from '../../Sidebar';

interface Order {
  id: number;
  facility: string;
  customer: string;
  amount: number;
  status: string;
  paymentStatus: string;
  date: string;
  action: string;
}

const OrdersTable: React.FC = () => {
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dữ liệu mẫu
  const orders: Order[] = [
    { id: 1, facility: 'Sân bóng MT Minh Trung', customer: 'Nguyễn Văn A', amount: 450000, status: 'Nợ dư thanh toán', paymentStatus: 'Đã cọc', date: '13/07/2025', action: 'Chi tiết' },
    { id: 2, facility: 'Sân bóng MT Minh Trung', customer: 'Trần Thị B', amount: 470000, status: 'Về trước chuyển khoản', paymentStatus: 'Đã thanh toán', date: '20/07/2025', action: 'Chi tiết' },
    { id: 3, facility: 'Sân bóng MT Quận Mình', customer: 'Lê Văn C', amount: 430000, status: 'Tiến mãi tài sản', paymentStatus: 'Đã thanh toán', date: '14/07/2025', action: 'Chi tiết' },
    { id: 4, facility: 'Sân bóng MT Minh Trung', customer: 'Phạm Thị D', amount: 470000, status: 'Về trước chuyển khoản', paymentStatus: 'Đã thanh toán', date: '21/07/2025', action: 'Chi tiết' },
    { id: 5, facility: 'Sân đấu MT Minh Trung', customer: 'Hoàng Văn E', amount: 370000, status: 'Cọc xong khoản chốt', paymentStatus: 'Chưa thanh toán', date: '21/07/2025', action: 'Chi tiết' },
    { id: 6, facility: 'Sân pic MT Minh Trung', customer: 'Đặng Thị F', amount: 450000, status: 'Về trước chuyển khoản', paymentStatus: 'Chưa thanh toán', date: '13/07/2025', action: 'Chi tiết' },
    { id: 7, facility: 'Sân pic MT Minh Trung', customer: 'Vũ Văn G', amount: 470000, status: 'Cọc 50%', paymentStatus: 'Đã thanh toán', date: '20/07/2025', action: 'Chi tiết' },
    { id: 8, facility: 'Sân đấu MT Quận Mình', customer: 'Ngô Thị H', amount: 430000, status: 'Cọc xong khoản chốt', paymentStatus: 'Chưa thanh toán', date: '14/07/2025', action: 'Chi tiết' },
    { id: 9, facility: 'Sân bóng MT Minh Trung', customer: 'Trịnh Văn I', amount: 470000, status: 'Về trước chuyển khoản', paymentStatus: 'Đã thanh toán', date: '21/07/2025', action: 'Chi tiết' },
    { id: 10, facility: 'Sân đấu MT Minh Trung', customer: 'Phan Thị J', amount: 370000, status: 'Cọc xong khoản chốt', paymentStatus: 'Chưa thanh toán', date: '21/07/2025', action: 'Chi tiết' },
  ];

  // Tính phân trang
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-800';
      case 'Chưa thanh toán':
        return 'bg-red-100 text-red-800';
      case 'Đã cọc':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 pl-64 pt-10 pr-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-lg font-semibold mb-3">Quản lý đơn đặt sân</h2>

          {/* Filters */}
          <div className="flex space-x-2 mb-4 text-xs font-medium text-gray-500 select-none">
            <button className="px-3 py-1 border border-gray-300 rounded bg-gray-100 cursor-default">
              FILTERS
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">
              CƠ SỞ
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">
              KHÁCH HÀNG
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">
              TỔNG GIÁ
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">
              TRẠNG THÁI THANH TOÁN
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 cursor-pointer">
              NGÀY
            </button>
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Cơ sở</th>
                  <th className="px-3 py-2 text-left">Khách hàng</th>
                  <th className="px-3 py-2 text-left">Tổng giá</th>
                  <th className="px-3 py-2 text-left">Nội dung thanh toán</th>
                  <th className="px-3 py-2 text-left">Trạng thái thanh toán</th>
                  <th className="px-3 py-2 text-left">Ngày đặt</th>
                  <th className="px-3 py-2 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 py-2">{order.id}</td>
                    <td className="px-3 py-2">{order.facility}</td>
                    <td className="px-3 py-2">{order.customer}</td>
                    <td className="px-3 py-2">{order.amount.toLocaleString()}đ</td>
                    <td className="px-3 py-2">{order.status}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-[11px] font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2">{order.date}</td>
                    <td className="px-3 py-2">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-[2px] rounded text-[11px]">
                        {order.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center space-x-3 mt-4">
            {/* Dropdown số lượng */}
            <div className="flex items-center space-x-1">
              <label htmlFor="ordersPerPage" className="text-sm font-medium text-gray-700">
                Hiển thị:
              </label>
              <select
                id="ordersPerPage"
                value={ordersPerPage}
                onChange={(e) => {
                  setOrdersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* Nút back */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 flex items-center justify-center rounded border border-gray-300 ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Trang trước"
            >
              &larr;
            </button>

            {/* Trang hiện tại */}
            <button
              className="bg-green-600 text-white w-8 h-8 rounded text-center font-semibold"
              aria-label="Trang hiện tại"
            >
              {currentPage}
            </button>

            {/* Nút next */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded border border-gray-300 ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Trang tiếp"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersTable;
