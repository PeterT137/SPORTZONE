/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import Header from '../Header';

type Facility = {
  id: number;
  open_time: string;
  close_time: string;
  address: string;
  description: string;
  subdescription?: string;
};

const FacilityManager: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 1,
      open_time: '08:00',
      close_time: '17:00',
      address: '123 Đường A, Hà Nội',
      description: 'Cơ sở chính',
      subdescription: 'Gần trung tâm',
    },
    {
      id: 2,
      open_time: '09:00',
      close_time: '18:00',
      address: '456 Đường B, TP.HCM',
      description: 'Chi nhánh phía Nam',
      subdescription: 'Văn phòng tầng 2',
    },
  ]);

  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Facility, 'id'>>({
    open_time: '08:00',
    close_time: '17:00',
    address: '',
    description: '',
    subdescription: '',
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.open_time || !formData.close_time || !formData.address || !formData.description) {
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
      return;
    }

    if (editId !== null) {
      setFacilities(prev =>
        prev.map(item => (item.id === editId ? { ...item, ...formData } : item))
      );
      setFilteredFacilities(prev =>
        prev.map(item => (item.id === editId ? { ...item, ...formData } : item))
      );
      showToast('Cập nhật cơ sở thành công!');
    } else {
      const newFacility: Facility = {
        id: facilities.length > 0 ? Math.max(...facilities.map(f => f.id)) + 1 : 1,
        ...formData,
      };
      setFacilities(prev => [...prev, newFacility]);
      setFilteredFacilities(prev => [...prev, newFacility]);
      showToast('Thêm cơ sở thành công!');
    }

    resetForm();
  };

  const handleEdit = (id: number) => {
    const target = facilities.find(f => f.id === id);
    if (target) {
      const { id: _, ...rest } = target;
      setFormData(rest);
      setEditId(id);
      setShowModal(true);
    }
  };

  const handleDelete = () => {
    if (facilityToDelete === null) return;

    setFacilities(prev => prev.filter(f => f.id !== facilityToDelete));
    setFilteredFacilities(prev => prev.filter(f => f.id !== facilityToDelete));
    showToast('Xóa cơ sở thành công!', 'success');

    const totalPages = Math.ceil(filteredFacilities.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    setShowDeleteModal(false);
    setFacilityToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      open_time: '08:00',
      close_time: '17:00',
      address: '',
      description: '',
      subdescription: '',
    });
    setEditId(null);
    setShowModal(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchKeyword(searchTerm);
    setCurrentPage(1);

    if (searchTerm.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      setFilteredFacilities(
        facilities.filter(
          f =>
            f.address.toLowerCase().includes(searchTerm) ||
            f.description.toLowerCase().includes(searchTerm) ||
            (f.subdescription && f.subdescription.toLowerCase().includes(searchTerm))
        )
      );
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(filteredFacilities.length / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const changePageSize = (e: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredFacilities.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredFacilities.length);
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex);

  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap"
          onClick={() => goToPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span
            key="ellipsis-start"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium whitespace-nowrap ${i === currentPage
            ? 'z-10 bg-blue-600 border-blue-600 text-white'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            }`}
          onClick={() => goToPage(i)}
          disabled={i === currentPage}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span
            key="ellipsis-end"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý Cơ sở</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  🔍
                </div>
                <input
                  type="text"
                  id="search-input"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md pl-10 pr-4 py-2 focus:ring-blue-600 focus:border-blue-600 block w-64"
                  placeholder="Tìm kiếm cơ sở..."
                  value={searchKeyword}
                  onChange={handleSearch}
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    open_time: '08:00',
                    close_time: '17:00',
                    address: '',
                    description: '',
                    subdescription: '',
                  });
                  setShowModal(true);
                }}
              >
                <span style={{ color: 'white' }}>➕</span>
                <span>Thêm mới</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ mở cửa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ đóng cửa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa chỉ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả phụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentFacilities.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Không tìm thấy cơ sở nào
                      </td>
                    </tr>
                  ) : (
                    currentFacilities.map(fac => (
                      <tr key={fac.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fac.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fac.open_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fac.close_time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{fac.address}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{fac.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {fac.subdescription || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEdit(fac.id)}
                            >
                              ✏️
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                setFacilityToDelete(fac.id);
                                setShowDeleteModal(true);
                              }}
                            >
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
                <button
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                <div className="text-sm text-gray-700 py-2">
                  <span>{currentPage}</span> / <span>{totalPages}</span>
                </div>
                <button
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span>{filteredFacilities.length > 0 ? startIndex + 1 : 0}</span> đến{' '}
                    <span>{endIndex}</span> của <span>{filteredFacilities.length}</span> kết quả
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <label htmlFor="page-size" className="text-sm text-gray-700 mr-2">
                      Hiển thị:
                    </label>
                    <select
                      id="page-size"
                      className="border border-gray-300 rounded-md text-sm pr-8 py-1 focus:ring-blue-600 focus:border-blue-600"
                      value={pageSize}
                      onChange={changePageSize}
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Trang trước</span>
                      ⬅️
                    </button>
                    <div className="flex">{renderPaginationNumbers()}</div>
                    <button
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <span className="sr-only">Trang sau</span>
                      ➡️
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">

              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editId !== null ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
                      </h3>
                      <div className="mt-4">
                        <form id="facility-form" className="space-y-4" onSubmit={handleSubmit}>
                          <input type="hidden" id="facility-id" value={editId || ''} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="open-time" className="block text-sm font-medium text-gray-700">
                                Giờ mở cửa
                              </label>
                              <input
                                type="time"
                                id="open-time"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm time-picker"
                                value={formData.open_time}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="close-time" className="block text-sm font-medium text-gray-700">
                                Giờ đóng cửa
                              </label>
                              <input
                                type="time"
                                id="close-time"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm time-picker"
                                value={formData.close_time}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                              Địa chỉ
                            </label>
                            <input
                              type="text"
                              id="address"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                              value={formData.address}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Mô tả
                            </label>
                            <textarea
                              id="description"
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                              value={formData.description}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="subdescription" className="block text-sm font-medium text-gray-700">
                              Mô tả phụ
                            </label>
                            <textarea
                              id="subdescription"
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                              value={formData.subdescription || ''}
                              onChange={handleChange}
                            />
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    form="facility-form"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
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
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">

              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      ⚠️
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận xóa</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Bạn có chắc chắn muốn xóa cơ sở này? Hành động này không thể hoàn tác.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
                    onClick={handleDelete}
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
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

export default FacilityManager;