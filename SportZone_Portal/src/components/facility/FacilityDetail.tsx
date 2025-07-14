"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiArrowLeft, FiX, FiClock, FiMapPin } from "react-icons/fi"
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

type Facility = {
    fac_id: number
    open_time: string
    close_time: string
    address: string
    description: string
    subdescription?: string
    picture?: string
}

type EditField = Omit<Field, "field_id" | "fac_id">
type EditService = Omit<Service, "service_id" | "fac_id">

const FacilityDetail: React.FC = () => {
    const params = useParams()
    const facId = params?.facId as string

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

    // Mock data - trong thực tế sẽ fetch từ API
    const mockFacilities: Facility[] = [
        {
            fac_id: 1,
            open_time: "08:00",
            close_time: "17:00",
            address: "123 Đường A, Hà Nội",
            description: "Cơ sở chính",
            subdescription: "Gần trung tâm",
            picture: "https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg",
        },
        {
            fac_id: 2,
            open_time: "09:00",
            close_time: "18:00",
            address: "456 Đường B, TP.HCM",
            description: "Chi nhánh phía Nam",
            subdescription: "Văn phòng tầng 2",
            picture: "https://co-nhan-tao.com/wp-content/uploads/2020/03/san-co-nhan-tao-1-1024x768.jpg",
        },
    ]

    const mockFields: Field[] = [
        {
            field_id: 1,
            fac_id: 1,
            category_id: 1,
            field_name: "Sân 5",
            description: "Sân cỏ nhân tạo",
            is_booking_enable: true,
            price: 300000,
            images: "https://via.placeholder.com/100",
        },
        {
            field_id: 2,
            fac_id: 1,
            category_id: 2,
            field_name: "Sân 7",
            description: "Sân cỏ tự nhiên",
            is_booking_enable: false,
            price: 500000,
            images: "https://via.placeholder.com/100",
        },
        {
            field_id: 3,
            fac_id: 2,
            category_id: 1,
            field_name: "Sân 11",
            description: "Sân cỏ nhân tạo lớn",
            is_booking_enable: true,
            price: 700000,
            images: "https://via.placeholder.com/100",
        },
    ]

    const mockServices: Service[] = [
        {
            service_id: 1,
            fac_id: 1,
            service_name: "Dịch vụ cho thuê giày",
            price: 50000,
            status: "Active",
            image: "https://via.placeholder.com/100",
            description: "Cho thuê giày đá bóng các loại",
        },
        {
            service_id: 2,
            fac_id: 1,
            service_name: "Dịch vụ nước uống",
            price: 20000,
            status: "Active",
            image: "https://via.placeholder.com/100",
            description: "Cung cấp nước uống và đồ ăn nhẹ",
        },
        {
            service_id: 3,
            fac_id: 2,
            service_name: "Dịch vụ trọng tài",
            price: 200000,
            status: "Inactive",
            image: "https://via.placeholder.com/100",
            description: "Cung cấp trọng tài chuyên nghiệp",
        },
    ]

    useEffect(() => {
        const facIdNum = Number.parseInt(facId || "0", 10)

        // Tìm thông tin cơ sở
        const currentFacility = mockFacilities.find((f) => f.fac_id === facIdNum)
        setFacility(currentFacility || null)

        // Lọc fields và services theo fac_id
        const facilityFields = mockFields.filter((f) => f.fac_id === facIdNum)
        const facilityServices = mockServices.filter((s) => s.fac_id === facIdNum)

        setFields(facilityFields)
        setServices(facilityServices)
        setFilteredFields(facilityFields)
        setFilteredServices(facilityServices)
    }, [facId])

    // Filter effects
    useEffect(() => {
        const lowerCaseFilter = fieldFilter.toLowerCase()
        setFilteredFields(
            fields.filter(
                (field) =>
                    field.field_name.toLowerCase().includes(lowerCaseFilter) ||
                    field.description.toLowerCase().includes(lowerCaseFilter),
            ),
        )
    }, [fieldFilter, fields])

    useEffect(() => {
        const lowerCaseFilter = serviceFilter.toLowerCase()
        setFilteredServices(
            services.filter(
                (service) =>
                    service.service_name.toLowerCase().includes(lowerCaseFilter) ||
                    service.description.toLowerCase().includes(lowerCaseFilter) ||
                    service.status.toLowerCase().includes(lowerCaseFilter),
            ),
        )
    }, [serviceFilter, services])

    const handleDeleteField = (fieldId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sân này?")) {
            setFields((prev) => prev.filter((f) => f.field_id !== fieldId))
            alert("Xóa sân thành công!")
        }
    }

    const handleDeleteService = (serviceId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            setServices((prev) => prev.filter((s) => s.service_id !== serviceId))
            alert("Xóa dịch vụ thành công!")
        }
    }

    const handleEditField = (field: Field) => {
        setEditField(field)
        setFieldFormData({
            category_id: field.category_id,
            field_name: field.field_name,
            description: field.description,
            is_booking_enable: field.is_booking_enable,
            price: field.price,
            images: field.images,
        })
    }

    const handleEditService = (service: Service) => {
        setEditService(service)
        setServiceFormData({
            service_name: service.service_name,
            price: service.price,
            status: service.status,
            image: service.image,
            description: service.description,
        })
    }

    const handleSaveFieldEdit = () => {
        if (editField && fieldFormData) {
            const updatedField = { ...editField, ...fieldFormData } as Field
            setFields((prev) => prev.map((f) => (f.field_id === editField.field_id ? updatedField : f)))
            setEditField(null)
            setFieldFormData(null)
            alert("Cập nhật sân thành công!")
        }
    }

    const handleSaveServiceEdit = () => {
        if (editService && serviceFormData) {
            const updatedService = { ...editService, ...serviceFormData } as Service
            setServices((prev) => prev.map((s) => (s.service_id === editService.service_id ? updatedService : s)))
            setEditService(null)
            setServiceFormData(null)
            alert("Cập nhật dịch vụ thành công!")
        }
    }

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        if (type === "checkbox") {
            setFieldFormData((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        [name]: (e.target as HTMLInputElement).checked,
                    }
                }
                return prev
            })
        } else {
            setFieldFormData((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        [name]: type === "number" ? Number(value) : value,
                    }
                }
                return prev
            })
        }
    }

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target
        setServiceFormData((prev) => {
            if (prev) {
                return {
                    ...prev,
                    [name]: type === "number" ? Number(value) : value,
                }
            }
            return prev
        })
    }

    const closeModal = () => {
        setSelectedField(null)
        setSelectedService(null)
        setEditField(null)
        setEditService(null)
        setFieldFormData(null)
        setServiceFormData(null)
    }

    if (!facility) {

        return (
            <>  <Sidebar />
                <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy cơ sở</h2>
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                        >
                            <FiArrowLeft className="h-4 w-4" />
                            Quay lại
                        </button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>  <Sidebar />

            <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                <div className="max-w-6xl mx-auto">
                    {/* Header với nút quay lại */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => window.history.back()}
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
                            {/* Hình ảnh cơ sở */}
                            <div className="md:w-1/3">
                                <img
                                    src={facility.picture || "https://via.placeholder.com/400x300"}
                                    alt="Facility"
                                    className="w-full h-64 md:h-full object-cover"
                                />
                            </div>

                            {/* Thông tin chi tiết */}
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
                                    {/* Địa chỉ */}
                                    <div className="flex items-start gap-3">
                                        <FiMapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Địa chỉ</h3>
                                            <p className="text-sm text-gray-600">{facility.address}</p>
                                        </div>
                                    </div>

                                    {/* Giờ hoạt động */}
                                    <div className="flex items-start gap-3">
                                        <FiClock className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Giờ hoạt động</h3>
                                            <p className="text-sm text-gray-600">
                                                {facility.open_time} - {facility.close_time}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mô tả phụ */}
                                    {facility.subdescription && (
                                        <div className="md:col-span-2">
                                            <h3 className="text-sm font-medium text-gray-900 mb-1">Mô tả thêm</h3>
                                            <p className="text-sm text-gray-600">{facility.subdescription}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Thống kê nhanh */}
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
                            {/* Tab Navigation & Filter */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                                {/* Tabs */}
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

                                {/* Filter Section */}
                                <div className="flex items-center gap-2 w-full lg:w-auto">
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

                    {/* Modals - giữ nguyên như cũ */}
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
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${selectedField.is_booking_enable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
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

    )
}

export default FacilityDetail
