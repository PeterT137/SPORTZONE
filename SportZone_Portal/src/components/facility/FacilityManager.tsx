/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Sidebar from '../../Sidebar';

type Image = {
  img_id: number;
  fac_id: number;
  imageUrl: string;
};

type Field = {
  field_id: number;
  fac_id: number;
  category_id: number;
  field_name: string;
  description: string;
  is_booking_enable: boolean;
  price: number;
};

type Service = {
  service_id: number;
  fac_id: number;
  service_name: string;
  price: number;
  status: string;
  image: string;
  description: string;
};

type Facility = {
  fac_id: number;
  userId: number;
  name: string;
  open_time: string;
  close_time: string;
  address: string;
  description: string;
  subdescription?: string;
  imageUrls: string[];
  fields: Field[];
  services: Service[];
};

type ApiFacility = {
  userId: number;
  name: string;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription?: string;
  imageUrls: string[];
};

const FacilityManager: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Omit<Facility, 'fac_id' | 'fields' | 'services'> & { imageUrls: string[] }>({
    userId: 0,
    name: '',
    open_time: '08:00',
    close_time: '17:00',
    address: '',
    description: '',
    subdescription: '',
    imageUrls: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchFacilities = async (searchText: string = '') => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
      setError('Yêu cầu xác thực');
      setIsLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const baseUrl = user?.RoleId === 2
      ? `https://localhost:7057/api/Facility?userId=${user.UId}`
      : 'https://localhost:7057/api/Facility';
    const url = searchText ? `${baseUrl}&searchText=${encodeURIComponent(searchText)}` : baseUrl;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || `Lỗi HTTP ${response.status}`);
      }

      const apiData: ApiFacility[] = await response.json();
      const mappedData: Facility[] = apiData.map((fac, index) => ({
        fac_id: index + 1, // Generate a temporary ID since API doesn't provide one
        userId: fac.userId,
        name: fac.name,
        open_time: fac.openTime.slice(0, 5),
        close_time: fac.closeTime.slice(0, 5),
        address: fac.address,
        description: fac.description,
        subdescription: fac.subdescription,
        imageUrls: fac.imageUrls,
        fields: [],
        services: [],
      }));

      setFacilities(mappedData);
      setFilteredFacilities(mappedData);
    } catch (err) {
      showToast('Không thể lấy danh sách cơ sở. Vui lòng thử lại.', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
      setError('Yêu cầu xác thực');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payload = {
      userId: user?.UId || 0,
      name: formData.name,
      openTime: formData.open_time,
      closeTime: formData.close_time,
      address: formData.address,
      description: formData.description,
      subdescription: formData.subdescription,
      imageUrls: formData.imageUrls || [],
    };

    try {
      const response = await fetch(
        editId !== null
          ? `https://localhost:7057/api/Facility/${editId}`
          : 'https://localhost:7057/api/Facility',
        {
          method: editId !== null ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('Mã trạng thái HTTP:', response.status); // Ghi log mã trạng thái

      if (response.status === 204) {
        // Xử lý trường hợp 204 No Content (không có body)
        const mappedFacility: Facility = {
          fac_id: editId || facilities.length + 1,
          userId: payload.userId,
          name: payload.name,
          open_time: payload.openTime.slice(0, 5),
          close_time: payload.closeTime.slice(0, 5),
          address: payload.address,
          description: payload.description,
          subdescription: payload.subdescription,
          imageUrls: payload.imageUrls,
          fields: [],
          services: [],
        };

        if (editId !== null) {
          setFacilities(prev => prev.map(f => (f.fac_id === editId ? mappedFacility : f)));
          setFilteredFacilities(prev => prev.map(f => (f.fac_id === editId ? mappedFacility : f)));
          showToast('Cập nhật cơ sở thành công!');
        } else {
          setFacilities(prev => [...prev, mappedFacility]);
          setFilteredFacilities(prev => [...prev, mappedFacility]);
          showToast('Thêm cơ sở thành công!');
        }
        resetForm();
        return;
      }

      const responseData = await response.json();
      console.log('Phản hồi từ server:', responseData); // Ghi log để kiểm tra cấu trúc

      if (response.ok) {
        // Lấy đối tượng facility từ responseData.data (hoặc responseData.Data)
        const updatedFacility: ApiFacility = responseData.data || responseData.Data || responseData;

        // Kiểm tra dữ liệu hợp lệ
        if (!updatedFacility || !updatedFacility.name) {
          showToast('Dữ liệu từ server không hợp lệ.', 'error');
          return;
        }

        console.log('Cơ sở đã cập nhật:', updatedFacility); // Ghi log để kiểm tra dữ liệu đã cập nhật

        const mappedFacility: Facility = {
          fac_id: editId || facilities.length + 1,
          userId: updatedFacility.userId,
          name: updatedFacility.name,
          open_time: updatedFacility.openTime.slice(0, 5),
          close_time: updatedFacility.closeTime.slice(0, 5),
          address: updatedFacility.address,
          description: updatedFacility.description,
          subdescription: updatedFacility.subdescription,
          imageUrls: updatedFacility.imageUrls,
          fields: [],
          services: [],
        };

        if (editId !== null) {
          setFacilities(prev => prev.map(f => (f.fac_id === editId ? mappedFacility : f)));
          setFilteredFacilities(prev => prev.map(f => (f.fac_id === editId ? mappedFacility : f)));
          showToast('Cập nhật cơ sở thành công!');
        } else {
          setFacilities(prev => [...prev, mappedFacility]);
          setFilteredFacilities(prev => [...prev, mappedFacility]);
          showToast('Thêm cơ sở thành công!');
        }
        resetForm();
      } else {
        const errorMessage = responseData.message || responseData.Message || `Lỗi HTTP ${response.status}`;
        showToast(`Lỗi: ${errorMessage}`, 'error');
      }
    } catch (err) {
      console.error('Lỗi trong handleSubmit:', err); // Ghi log lỗi chi tiết
      showToast('Không thể xử lý yêu cầu. Vui lòng thử lại.', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };
  const handleEdit = (id: number) => {
    const target = facilities.find(f => f.fac_id === id);
    if (target) {
      const { fac_id: _, fields: __, services: ___, ...rest } = target;
      setFormData(rest);
      setEditId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
      setError('Yêu cầu xác thực');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7057/api/Facility/${facilityToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          showToast('Không được phép truy cập. Vui lòng đăng nhập lại.', 'error');
          setError('Không được phép truy cập');
          return;
        } else if (response.status === 403) {
          showToast('Bạn không có quyền thực hiện hành động này.', 'error');
          setError('Bị cấm');
          return;
        }
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      setFacilities(prev => prev.filter(f => f.fac_id !== facilityToDelete));
      setFilteredFacilities(prev => prev.filter(f => f.fac_id !== facilityToDelete));
      showToast('Xóa cơ sở thành công!', 'success');

      const totalPages = Math.ceil(filteredFacilities.length / pageSize);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }

      setShowDeleteModal(false);
      setFacilityToDelete(null);
    } catch (err) {
      showToast('Không thể xóa cơ sở. Vui lòng thử lại.', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  const handleViewDetails = async (facility: Facility) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
      setError('Yêu cầu xác thực');
      return;
    }

    try {
      const response = await fetch(`https://localhost:7057/api/Facility/${facility.fac_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          showToast('Không được phép truy cập. Vui lòng đăng nhập lại.', 'error');
          setError('Không được phép truy cập');
          return;
        } else if (response.status === 403) {
          showToast('Bạn không có quyền truy cập cơ sở này.', 'error');
          setError('Bị cấm');
          return;
        }
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const apiFacility: ApiFacility = await response.json();
      const mappedFacility: Facility = {
        fac_id: facility.fac_id,
        userId: apiFacility.userId,
        name: apiFacility.name,
        open_time: apiFacility.openTime.slice(0, 5),
        close_time: apiFacility.closeTime.slice(0, 5),
        address: apiFacility.address,
        description: apiFacility.description,
        subdescription: apiFacility.subdescription,
        imageUrls: apiFacility.imageUrls,
        fields: [],
        services: [],
      };

      navigate(`/facility/${facility.fac_id}`, { state: { facility: mappedFacility } });
    } catch (err) {
      showToast('Không thể lấy chi tiết cơ sở. Vui lòng thử lại.', 'error');
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: 0,
      name: '',
      open_time: '08:00',
      close_time: '17:00',
      address: '',
      description: '',
      subdescription: '',
      imageUrls: [],
    });
    setEditId(null);
    setShowModal(false);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchKeyword(searchTerm);
    setCurrentPage(1);
    fetchFacilities(searchTerm);
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

  const handleDoubleClickService = (service: Service, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (showModal || showDeleteModal || selectedService)) {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown as unknown as EventListener);
    return () => document.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
  }, [showModal, showDeleteModal, selectedService]);

  const totalPages = Math.ceil(filteredFacilities.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredFacilities.length);
  const currentFacilities = filteredFacilities.slice(startIndex, endIndex);

  useEffect(() => {
    console.log('Danh sách cơ sở hiện tại:', currentFacilities);
  }, [currentFacilities]);

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
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
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
                    userId: 0,
                    name: '',
                    open_time: '08:00',
                    close_time: '17:00',
                    address: '',
                    description: '',
                    subdescription: '',
                    imageUrls: [],
                  });
                  setShowModal(true);
                }}
              >
                ➕ Thêm mới
              </button>
            </div>
          </div>
        </header>

        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4">
            {isLoading ? (
              <div className="text-center py-4">Đang tải...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-600">{error}</div>
            ) : (
              <>
                {/* <p className="text-sm text-gray-500 mb-4">👉 Nhấn đúp vào một cơ sở để xem chi tiết hoặc nhấp vào nút Chi tiết.</p> */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tên
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hình ảnh
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
                            <td
                              colSpan={9}
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              Không tìm thấy cơ sở nào
                            </td>
                          </tr>
                        ) : (
                          currentFacilities.map(fac => (
                            <tr
                              key={fac.fac_id}
                              onDoubleClick={() => handleViewDetails(fac)}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {fac.fac_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fac.name || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <img
                                  src={fac.imageUrls?.[0] || 'https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg'}
                                  alt="Cơ sở"
                                  className="h-12 w-12 object-cover rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fac.open_time || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fac.close_time || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{fac.address || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{fac.description || '-'}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {fac.subdescription || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleEdit(fac.fac_id)}
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => {
                                      setFacilityToDelete(fac.fac_id);
                                      setShowDeleteModal(true);
                                    }}
                                  >
                                    Xóa
                                  </button>
                                  <button
                                    className="text-green-600 hover:text-green-800"
                                    onClick={() => handleViewDetails(fac)}
                                  >
                                    Chi tiết
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </button>
                    <div className="text-sm text-gray-700 py-2">
                      <span>{currentPage}</span> / <span>{totalPages}</span>
                    </div>
                    <button
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap ${currentPage === totalPages || totalPages === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                        }`}
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
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Phân trang"
                      >
                        <button
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Trang trước</span>
                          ⬅️
                        </button>
                        <div className="flex">{renderPaginationNumbers()}</div>
                        <button
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 whitespace-nowrap ${currentPage === totalPages || totalPages === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            }`}
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
              </>
            )}
          </div>
        </main>

        {showModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto" onClick={handleCloseModal}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editId !== null ? 'Chỉnh sửa cơ sở' : 'Thêm cơ sở mới'}
                      </h3>
                      <div className="mt-4">
                        <form id="facility-form" className="space-y-4" onSubmit={handleSubmit}>
                          <input type="hidden" id="facility-id" value={editId || ''} />
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Tên cơ sở
                            </label>
                            <input
                              type="text"
                              id="name"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label
                                htmlFor="open_time"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Giờ mở cửa
                              </label>
                              <input
                                type="time"
                                id="open_time"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                value={formData.open_time}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="close_time"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Giờ đóng cửa
                              </label>
                              <input
                                type="time"
                                id="close_time"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                                value={formData.close_time}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="address"
                              className="block text-sm font-medium text-gray-700"
                            >
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
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700"
                            >
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
                            <label
                              htmlFor="subdescription"
                              className="block text-sm font-medium text-gray-700"
                            >
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
                          <div>
                            <label
                              htmlFor="imageUrls"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Hình ảnh (URLs, phân tách bằng dấu phẩy)
                            </label>
                            <input
                              type="text"
                              id="imageUrls"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                              value={formData.imageUrls?.join(',') || ''}
                              onChange={(e) => {
                                const urls = e.target.value.split(',').map(url => url.trim());
                                setFormData(prev => ({ ...prev, imageUrls: urls }));
                              }}
                            />
                          </div>
                          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                              type="submit"
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
                            >
                              Lưu
                            </button>
                            <button
                              type="button"
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
                              onClick={handleCloseModal}
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-10 overflow-y-auto" onClick={handleCloseModal}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
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
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedService && (
          <div className="fixed inset-0 z-10 overflow-y-auto" onClick={handleCloseModal}>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Chi tiết dịch vụ: {selectedService.service_name}
                      </h3>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          <strong>ID Dịch vụ:</strong> {selectedService.service_id}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Tên dịch vụ:</strong> {selectedService.service_name}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Giá:</strong> {selectedService.price.toLocaleString()} VND
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Trạng thái:</strong> {selectedService.status}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Mô tả:</strong> {selectedService.description}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Hình ảnh:</strong>
                          <img
                            src={selectedService.image || 'https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg'}
                            alt="Dịch vụ"
                            className="h-24 w-24 object-cover rounded mt-2"
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm whitespace-nowrap"
                    onClick={handleCloseModal}
                  >
                    Đóng
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