"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiArrowLeft, FiX, FiClock, FiMapPin, FiPlus } from "react-icons/fi"
import Sidebar from "../../Sidebar";

type Field = {
    field_id: number
    fac_id: number
    category_id: number
    field_name: string
    description: string
    is_booking_enable: boolean
    price: number
    images: string
}

type Service = {
    service_id: number
    fac_id: number
    service_name: string
    price: number
    status: string
    image: string
    description: string
}

type Image = {
    img_id: number
    fac_id: number
    imageUrl: string
}

type Facility = {
    fac_id: number
    open_time: string
    close_time: string
    address: string
    description: string
    subdescription?: string
    picture?: string
    fields: Field[]
    services: Service[]
    images: Image[]
}

type EditField = Omit<Field, "field_id" | "fac_id">
type EditService = Omit<Service, "service_id" | "fac_id">

const FacilityDetail: React.FC = () => {
    const { facId } = useParams<{ facId: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const [facility, setFacility] = useState<Facility | null>(null)
    const [activeTab, setActiveTab] = useState<string>("fields")
    const [fields, setFields] = useState<Field[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [filteredFields, setFilteredFields] = useState<Field[]>([])
    const [filteredServices, setFilteredServices] = useState<Service[]>([])
    const [fieldFilter, setFieldFilter] = useState<string>("")
    const [serviceFilter, setServiceFilter] = useState<string>("")
    const [selectedField, setSelectedField] = useState<Field | null>(null)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [editField, setEditField] = useState<Field | null>(null)
    const [editService, setEditService] = useState<Service | null>(null)
    const [fieldFormData, setFieldFormData] = useState<EditField | null>(null)
    const [serviceFormData, setServiceFormData] = useState<EditService | null>(null)
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState<boolean>(false)
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState<boolean>(false)
    const [newFieldFormData, setNewFieldFormData] = useState<EditField>({
        category_id: 1,
        field_name: "",
        description: "",
        is_booking_enable: true,
        price: 0,
        images: ""
    })
    const [newServiceFormData, setNewServiceFormData] = useState<EditService>({
        service_name: "",
        price: 0,
        status: "Active",
        image: "",
        description: ""
    })
    const [error, setError] = useState<string | null>(null)

    // Hàm hiển thị toast (giả định đã được định nghĩa)
    const showToast = (message: string, type: 'success' | 'error') => {
        console.log(`[${type}] ${message}`); // Thay bằng implement toast thực tế
    }

    // Lấy dữ liệu từ API nếu không có state
    useEffect(() => {
        const fetchFacility = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                setError('Yêu cầu xác thực');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Facility/${facId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.log('Lỗi khi lấy chi tiết cơ sở:', response.status, errorText);
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

                const apiFacility = await response.json();
                const mappedFacility: Facility = {
                    fac_id: apiFacility.facId,
                    open_time: apiFacility.openTime.slice(0, 5),
                    close_time: apiFacility.closeTime.slice(0, 5),
                    address: apiFacility.address,
                    description: apiFacility.description,
                    subdescription: apiFacility.subdescription,
                    picture: apiFacility.images[0]?.imageUrl || '',
                    fields: apiFacility.fields || [],
                    services: apiFacility.services || [],
                    images: apiFacility.images.map((img: any) => ({
                        img_id: img.imgId,
                        fac_id: img.facId,
                        imageUrl: img.imageUrl,
                    })),
                };

                setFacility(mappedFacility);
                setFields(mappedFacility.fields);
                setServices(mappedFacility.services);
                setFilteredFields(mappedFacility.fields);
                setFilteredServices(mappedFacility.services);
            } catch (err) {
                showToast('Không thể lấy chi tiết cơ sở. Vui lòng thử lại.', 'error');
                setError(err instanceof Error ? err.message : 'Lỗi không xác định');
            }
        };

        // Kiểm tra dữ liệu từ state (từ handleViewDetails)
        const stateFacility = location.state?.facility as Facility | undefined;
        if (stateFacility && stateFacility.fac_id === Number(facId)) {
            setFacility(stateFacility);
            setFields(stateFacility.fields);
            setServices(stateFacility.services);
            setFilteredFields(stateFacility.fields);
            setFilteredServices(stateFacility.services);
        } else {
            // Nếu không có state hoặc fac_id không khớp, gọi API
            fetchFacility();
        }
    }, [facId, location.state]);

    // Filter effects
    useEffect(() => {
        const lowerCaseFilter = fieldFilter.toLowerCase();
        setFilteredFields(
            fields.filter(
                (field) =>
                    field.field_name.toLowerCase().includes(lowerCaseFilter) ||
                    field.description.toLowerCase().includes(lowerCaseFilter),
            ),
        );
    }, [fieldFilter, fields]);

    useEffect(() => {
        const lowerCaseFilter = serviceFilter.toLowerCase();
        setFilteredServices(
            services.filter(
                (service) =>
                    service.service_name.toLowerCase().includes(lowerCaseFilter) ||
                    service.description.toLowerCase().includes(lowerCaseFilter) ||
                    service.status.toLowerCase().includes(lowerCaseFilter),
            ),
        );
    }, [serviceFilter, services]);

    const handleDeleteField = async (fieldId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sân này?")) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Field/${fieldId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa sân: ${response.statusText}`);
                }

                setFields((prev) => prev.filter((f) => f.field_id !== fieldId));
                setFilteredFields((prev) => prev.filter((f) => f.field_id !== fieldId));
                showToast("Xóa sân thành công!", 'success');
            } catch (err) {
                showToast('Không thể xóa sân. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleDeleteService = async (serviceId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Service/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi xóa dịch vụ: ${response.statusText}`);
                }

                setServices((prev) => prev.filter((s) => s.service_id !== serviceId));
                setFilteredServices((prev) => prev.filter((s) => s.service_id !== serviceId));
                showToast("Xóa dịch vụ thành công!", 'success');
            } catch (err) {
                showToast('Không thể xóa dịch vụ. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleEditField = (field: Field) => {
        setEditField(field);
        setFieldFormData({
            category_id: field.category_id,
            field_name: field.field_name,
            description: field.description,
            is_booking_enable: field.is_booking_enable,
            price: field.price,
            images: field.images,
        });
    };

    const handleEditService = (service: Service) => {
        setEditService(service);
        setServiceFormData({
            service_name: service.service_name,
            price: service.price,
            status: service.status,
            image: service.image,
            description: service.description,
        });
    };

    const handleSaveFieldEdit = async () => {
        if (editField && fieldFormData) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Field/${editField.field_id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...fieldFormData,
                        fac_id: editField.fac_id,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi cập nhật sân: ${response.statusText}`);
                }

                const updatedField = await response.json();
                const mappedField: Field = {
                    field_id: updatedField.fieldId,
                    fac_id: updatedField.facId,
                    category_id: updatedField.categoryId,
                    field_name: updatedField.fieldName,
                    description: updatedField.description,
                    is_booking_enable: updatedField.isBookingEnable,
                    price: updatedField.price,
                    images: updatedField.images,
                };

                setFields((prev) => prev.map((f) => (f.field_id === editField.field_id ? mappedField : f)));
                setFilteredFields((prev) => prev.map((f) => (f.field_id === editField.field_id ? mappedField : f)));
                setEditField(null);
                setFieldFormData(null);
                showToast("Cập nhật sân thành công!", 'success');
            } catch (err) {
                showToast('Không thể cập nhật sân. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleSaveServiceEdit = async () => {
        if (editService && serviceFormData) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Service/${editService.service_id}`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...serviceFormData,
                        fac_id: editService.fac_id,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi cập nhật dịch vụ: ${response.statusText}`);
                }

                const updatedService = await response.json();
                const mappedService: Service = {
                    service_id: updatedService.serviceId,
                    fac_id: updatedService.facId,
                    service_name: updatedService.serviceName,
                    price: updatedService.price,
                    status: updatedService.status,
                    image: updatedService.image,
                    description: updatedService.description,
                };

                setServices((prev) => prev.map((s) => (s.service_id === editService.service_id ? mappedService : s)));
                setFilteredServices((prev) => prev.map((s) => (s.service_id === editService.service_id ? mappedService : s)));
                setEditService(null);
                setServiceFormData(null);
                showToast("Cập nhật dịch vụ thành công!", 'success');
            } catch (err) {
                showToast('Không thể cập nhật dịch vụ. Vui lòng thử lại.', 'error');
            }
        }
    };

    const handleAddField = async () => {
        if (newFieldFormData.field_name && newFieldFormData.price > 0) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Field`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...newFieldFormData,
                        fac_id: Number(facId),
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi thêm sân: ${response.statusText}`);
                }

                const newField = await response.json();
                const mappedField: Field = {
                    field_id: newField.fieldId,
                    fac_id: newField.facId,
                    category_id: newField.categoryId,
                    field_name: newField.fieldName,
                    description: newField.description,
                    is_booking_enable: newField.isBookingEnable,
                    price: newField.price,
                    images: newField.images || "https://via.placeholder.com/100",
                };

                setFields((prev) => [...prev, mappedField]);
                setFilteredFields((prev) => [...prev, mappedField]);
                setIsAddFieldModalOpen(false);
                setNewFieldFormData({
                    category_id: 1,
                    field_name: "",
                    description: "",
                    is_booking_enable: true,
                    price: 0,
                    images: ""
                });
                showToast("Thêm sân thành công!", 'success');
            } catch (err) {
                showToast('Không thể thêm sân. Vui lòng thử lại.', 'error');
            }
        } else {
            showToast("Vui lòng điền đầy đủ tên sân và giá!", 'error');
        }
    };

    const handleAddService = async () => {
        if (newServiceFormData.service_name && newServiceFormData.price > 0) {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Không tìm thấy token xác thực. Vui lòng đăng nhập.', 'error');
                return;
            }

            try {
                const response = await fetch(`https://localhost:7057/api/Service`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...newServiceFormData,
                        fac_id: Number(facId),
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Lỗi khi thêm dịch vụ: ${response.statusText}`);
                }

                const newService = await response.json();
                const mappedService: Service = {
                    service_id: newService.serviceId,
                    fac_id: newService.facId,
                    service_name: newService.serviceName,
                    price: newService.price,
                    status: newService.status,
                    image: newService.image || "https://via.placeholder.com/100",
                    description: newService.description,
                };

                setServices((prev) => [...prev, newService]);
                setFilteredServices((prev) => [...prev, newService]);
                setIsAddServiceModalOpen(false);
                setNewServiceFormData({
                    service_name: "",
                    price: 0,
                    status: "Active",
                    image: "",
                    description: ""
                });
                showToast("Thêm dịch vụ thành công!", 'success');
            } catch (err) {
                showToast('Không thể thêm dịch vụ. Vui lòng thử lại.', 'error');
            }
        } else {
            showToast("Vui lòng điền đầy đủ tên dịch vụ và giá!", 'error');
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFieldFormData((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        [name]: (e.target as HTMLInputElement).checked,
                    };
                }
                return prev;
            });
        } else {
            setFieldFormData((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        [name]: type === "number" ? Number(value) : value,
                    };
                }
                return prev;
            });
        }
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setServiceFormData((prev) => {
            if (prev) {
                return {
                    ...prev,
                    [name]: type === "number" ? Number(value) : value,
                };
            }
            return prev;
        });
    };

    const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setNewFieldFormData((prev) => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked,
            }));
        } else {
            setNewFieldFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? Number(value) : value,
            }));
        }
    };

    const handleNewServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setNewServiceFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const closeModal = () => {
        setSelectedField(null);
        setSelectedService(null);
        setEditField(null);
        setEditService(null);
        setFieldFormData(null);
        setServiceFormData(null);
        setIsAddFieldModalOpen(false);
        setIsAddServiceModalOpen(false);
    };

    if (!facility) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy cơ sở</h2>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Quay lại
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Sidebar />
            <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header với nút quay lại */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Quay lại
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Chi tiết cơ sở</h1>
                    </div>

                    {/* Thông tin cơ sở */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                        <div className="md:flex">
                            <div className="md:w-1/3">
                                <img
                                    src={facility.picture || "https://via.placeholder.com/400x300"}
                                    alt="Facility"
                                    className="w-full h-64 md:h-full object-cover"
                                />
                            </div>
                            <div className="md:w-2/3 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{facility.description}</h2>
                                        <p className="text-gray-600 text-lg">ID: #{facility.fac_id}</p>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        Đang hoạt động
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <FiMapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Địa chỉ</h3>
                                            <p className="text-sm text-gray-600">{facility.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FiClock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Giờ hoạt động</h3>
                                            <p className="text-sm text-gray-600">
                                                {facility.open_time} - {facility.close_time}
                                            </p>
                                        </div>
                                    </div>
                                    {facility.subdescription && (
                                        <div className="md:col-span-2">
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Mô tả thêm</h3>
                                            <p className="text-sm text-gray-600">{facility.subdescription}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{filteredFields.length}</div>
                                            <div className="text-sm text-gray-500">Sân bóng</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{filteredServices.length}</div>
                                            <div className="text-sm text-gray-500">Dịch vụ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Tabs và Tables */}
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                                <div className="flex border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab("fields")}
                                        className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${activeTab === "fields"
                                            ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Danh sách sân ({filteredFields.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("services")}
                                        className={`px-6 py-3 font-medium text-sm transition-colors duration-200 ${activeTab === "services"
                                            ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        Danh sách dịch vụ ({filteredServices.length})
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    {activeTab === "fields" && (
                                        <button
                                            onClick={() => setIsAddFieldModalOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            <FiPlus className="h-4 w-4" />
                                            Thêm sân
                                        </button>
                                    )}
                                    {activeTab === "services" && (
                                        <button
                                            onClick={() => setIsAddServiceModalOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            <FiPlus className="h-4 w-4" />
                                            Thêm dịch vụ
                                        </button>
                                    )}
                                    <div className="relative flex-1 lg:w-80">
                                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder={
                                                activeTab === "fields"
                                                    ? "Tìm kiếm sân theo tên hoặc mô tả..."
                                                    : "Tìm kiếm dịch vụ theo tên, mô tả hoặc trạng thái..."
                                            }
                                            value={activeTab === "fields" ? fieldFilter : serviceFilter}
                                            onChange={(e) =>
                                                activeTab === "fields" ? setFieldFilter(e.target.value) : setServiceFilter(e.target.value)
                                            }
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Fields Tab */}
                            {activeTab === "fields" && (
                                <div className="space-y-4">
                                    {filteredFields.length === 0 ? (
                                        <div className="text-center py-16 text-gray-500">
                                            <div className="text-lg font-medium mb-2">Chưa có sân nào</div>
                                            <div className="text-sm">Hoặc không tìm thấy kết quả phù hợp với từ khóa tìm kiếm</div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            ID
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Tên sân
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Loại
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Mô tả
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Giá
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Trạng thái
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Hình ảnh
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredFields.map((field) => (
                                                        <tr key={field.field_id} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                #{field.field_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                                {field.field_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                Loại {field.category_id}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                                <div className="truncate" title={field.description}>
                                                                    {field.description}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                {field.price.toLocaleString()} VND
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${field.is_booking_enable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                    {field.is_booking_enable ? "Có thể đặt" : "Không thể đặt"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <img
                                                                    src={field.images || "https://via.placeholder.com/48"}
                                                                    alt="Field"
                                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => setSelectedField(field)}
                                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <FiEye className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditField(field)}
                                                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                                                        title="Chỉnh sửa"
                                                                    >
                                                                        <FiEdit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteField(field.field_id)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                                        title="Xóa"
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Services Tab */}
                            {activeTab === "services" && (
                                <div className="space-y-4">
                                    {filteredServices.length === 0 ? (
                                        <div className="text-center py-16 text-gray-500">
                                            <div className="text-lg font-medium mb-2">Chưa có dịch vụ nào</div>
                                            <div className="text-sm">Hoặc không tìm thấy kết quả phù hợp với từ khóa tìm kiếm</div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            ID
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Tên dịch vụ
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Giá
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Trạng thái
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Mô tả
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Hình ảnh
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredServices.map((service) => (
                                                        <tr key={service.service_id} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                #{service.service_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                                {service.service_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                {service.price.toLocaleString()} VND
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${service.status === "Active"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                        }`}
                                                                >
                                                                    {service.status === "Active" ? "Hoạt động" : "Tạm dừng"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                                <div className="truncate" title={service.description}>
                                                                    {service.description}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <img
                                                                    src={service.image || "https://via.placeholder.com/48"}
                                                                    alt="Service"
                                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => setSelectedService(service)}
                                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
                                                                        title="Xem chi tiết"
                                                                    >
                                                                        <FiEye className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditService(service)}
                                                                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors duration-200"
                                                                        title="Chỉnh sửa"
                                                                    >
                                                                        <FiEdit className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteService(service.service_id)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                                        title="Xóa"
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Field Detail Modal */}
                    {selectedField && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">Chi tiết sân: {selectedField.field_name}</h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">ID:</span>
                                            <p className="text-sm text-gray-900">#{selectedField.field_id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Loại:</span>
                                            <p className="text-sm text-gray-900">Loại {selectedField.category_id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Tên sân:</span>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedField.field_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                                        <p className="text-sm text-gray-900">{selectedField.description}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Giá:</span>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedField.price.toLocaleString()} VND</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Trạng thái đặt sân:</span>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedField.is_booking_enable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {selectedField.is_booking_enable ? "Có thể đặt" : "Không thể đặt"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Hình ảnh:</span>
                                        <img
                                            src={selectedField.images || "https://via.placeholder.com/200"}
                                            alt="Field"
                                            className="w-full h-48 object-cover rounded-lg mt-2 border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service Detail Modal */}
                    {selectedService && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Chi tiết dịch vụ: {selectedService.service_name}
                                    </h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">ID:</span>
                                            <p className="text-sm text-gray-900">#{selectedService.service_id}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedService.status === "Active"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {selectedService.status === "Active" ? "Hoạt động" : "Tạm dừng"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Tên dịch vụ:</span>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedService.service_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Giá:</span>
                                        <p className="text-sm text-gray-900 font-semibold">{selectedService.price.toLocaleString()} VND</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                                        <p className="text-sm text-gray-900">{selectedService.description}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Hình ảnh:</span>
                                        <img
                                            src={selectedService.image || "https://via.placeholder.com/200"}
                                            alt="Service"
                                            className="w-full h-48 object-cover rounded-lg mt-2 border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Field Modal */}
                    {editField && fieldFormData && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa sân: {editField.field_name}</h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên sân</label>
                                        <input
                                            type="text"
                                            name="field_name"
                                            value={fieldFormData.field_name}
                                            onChange={handleFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân</label>
                                        <input
                                            type="number"
                                            name="category_id"
                                            value={fieldFormData.category_id}
                                            onChange={handleFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={fieldFormData.description}
                                            onChange={handleFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={fieldFormData.price}
                                            onChange={handleFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="is_booking_enable"
                                            checked={fieldFormData.is_booking_enable}
                                            onChange={handleFieldChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="text-sm font-medium text-gray-700">Cho phép đặt sân</label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                                        <input
                                            type="text"
                                            name="images"
                                            value={fieldFormData.images}
                                            onChange={handleFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveFieldEdit}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Field Modal */}
                    {isAddFieldModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">Thêm sân mới</h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên sân</label>
                                        <input
                                            type="text"
                                            name="field_name"
                                            value={newFieldFormData.field_name}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân</label>
                                        <input
                                            type="number"
                                            name="category_id"
                                            value={newFieldFormData.category_id}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={newFieldFormData.description}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newFieldFormData.price}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="is_booking_enable"
                                            checked={newFieldFormData.is_booking_enable}
                                            onChange={handleNewFieldChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="text-sm font-medium text-gray-700">Cho phép đặt sân</label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                                        <input
                                            type="text"
                                            name="images"
                                            value={newFieldFormData.images}
                                            onChange={handleNewFieldChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleAddField}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Thêm sân
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Service Modal */}
                    {isAddServiceModalOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">Thêm dịch vụ mới</h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên dịch vụ</label>
                                        <input
                                            type="text"
                                            name="service_name"
                                            value={newServiceFormData.service_name}
                                            onChange={handleNewServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={newServiceFormData.price}
                                            onChange={handleNewServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                        <select
                                            name="status"
                                            value={newServiceFormData.status}
                                            onChange={handleNewServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="Active">Hoạt động</option>
                                            <option value="Inactive">Tạm dừng</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={newServiceFormData.description}
                                            onChange={handleNewServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={newServiceFormData.image}
                                            onChange={handleNewServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleAddService}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Thêm dịch vụ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Service Modal */}
                    {editService && serviceFormData && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                            onClick={closeModal}
                        >
                            <div
                                className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                    <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa dịch vụ: {editService.service_name}</h3>
                                    <button
                                        onClick={closeModal}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    >
                                        <FiX className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên dịch vụ</label>
                                        <input
                                            type="text"
                                            name="service_name"
                                            value={serviceFormData.service_name}
                                            onChange={handleServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={serviceFormData.price}
                                            onChange={handleServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                        <select
                                            name="status"
                                            value={serviceFormData.status}
                                            onChange={(e) => setServiceFormData((prev) => (prev ? { ...prev, status: e.target.value } : prev))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        >
                                            <option value="Active">Hoạt động</option>
                                            <option value="Inactive">Tạm dừng</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                        <input
                                            type="text"
                                            name="description"
                                            value={serviceFormData.description}
                                            onChange={handleServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
                                        <input
                                            type="text"
                                            name="image"
                                            value={serviceFormData.image}
                                            onChange={handleServiceChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSaveServiceEdit}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FacilityDetail;