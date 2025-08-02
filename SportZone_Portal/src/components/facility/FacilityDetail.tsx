/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiClock, FiEdit, FiEye, FiMapPin, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../Sidebar";
import Swal from 'sweetalert2';

type Field = {
    fieldId: number;
    facId: number;
    facilityAddress: string;
    categoryId: number;
    categoryName: string;
    fieldName: string;
    description: string;
    isBookingEnable: boolean;
};

type Service = {
    serviceId: number;
    facId: number;
    serviceName: string;
    price: number;
    status: string;
    image?: string;
    description: string;
    facilityAddress: string;
};

type Image = {
    imgId: number;
    facId: number;
    imageUrl: string;
};

type Facility = {
    facId: number;
    openTime: string;
    closeTime: string;
    address: string;
    description: string;
    subdescription?: string;
    picture?: string;
    fields: Field[];
    services: Service[];
    images: Image[];
};

type EditField = {
    fieldName?: string;
    categoryId?: number;
    description?: string;
    isBookingEnable?: boolean;
};

type EditService = {
    serviceName: string;
    price: number;
    status: string;
    imageFile: File | null;
    description: string;
    facilityAddress: string;
};

type Category = {
    categoryId: number;
    categoryName: string;
};

const API_URL = "https://localhost:7057";

const FacilityDetail: React.FC = () => {
    const { facId } = useParams<{ facId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [activeTab, setActiveTab] = useState<string>("fields");
    const [fields, setFields] = useState<Field[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [filteredFields, setFilteredFields] = useState<Field[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [fieldFilter, setFieldFilter] = useState<string>("");
    const [serviceFilter, setServiceFilter] = useState<string>("");
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [editField, setEditField] = useState<Field | null>(null);
    const [editService, setEditService] = useState<Service | null>(null);
    const [fieldFormData, setFieldFormData] = useState<EditField | null>(null);
    const [serviceFormData, setServiceFormData] = useState<EditService | null>(null);
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState<boolean>(false);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState<boolean>(false);
    const [newFieldFormData, setNewFieldFormData] = useState<EditField>({
        categoryId: 1,
        fieldName: "",
        description: "",
        isBookingEnable: true,
    });
    const [newServiceFormData, setNewServiceFormData] = useState<EditService>({
        serviceName: "",
        price: 0,
        status: "Active",
        imageFile: null,
        description: "",
        facilityAddress: "",
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const showToast = (message: string, type: "success" | "error") => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', () => Swal.stopTimer());
                toast.addEventListener('mouseleave', () => Swal.resumeTimer());
            }
        });
    };

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
        return {};
    };

    const fetchFacility = async () => {
        console.log("Fetching facility with facId:", facId);
        try {
            const response = await fetch(`${API_URL}/api/Facility/${facId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Facility API error:", response.status, errorText);
                throw new Error(`Lỗi HTTP: ${response.status} - ${errorText || response.statusText}`);
            }

            const apiFacility = await response.json();
            console.log("Facility API response:", apiFacility);

            const mappedFacility: Facility = {
                facId: Number(facId),
                openTime: apiFacility.openTime?.slice(0, 5) || "00:00",
                closeTime: apiFacility.closeTime?.slice(0, 5) || "00:00",
                address: apiFacility.address || "Unknown",
                description: apiFacility.description || "No description",
                subdescription: apiFacility.subdescription,
                picture: apiFacility.imageUrls?.[0] || "default-image.jpg",
                fields: [],
                services: [],
                images: apiFacility.imageUrls?.map((url: string, index: number) => ({
                    imgId: index + 1,
                    facId: Number(facId),
                    imageUrl: url,
                })) || [],
            };

            setFacility(mappedFacility);
            setFields([]);
            setServices([]);
            setFilteredFields([]);
            setFilteredServices([]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy chi tiết cơ sở";
            console.error("Fetch facility error:", err);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        console.log("Fetching services with facId:", facId);
        try {
            const response = await fetch(`${API_URL}/api/Service/facility/${facId}`, {
                headers: getAuthHeaders(),
            });
            console.log("Services API response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Services API error:", response.status, errorText);
                throw new Error(`Lỗi khi lấy danh sách dịch vụ: ${response.status} - ${errorText || response.statusText}`);
            }

            const result = await response.json();
            console.log("Services API response data:", result);

            if (result.success) {
                const mappedServices: Service[] = result.data.map((service: any) => ({
                    serviceId: service.serviceId,
                    facId: service.facId,
                    serviceName: service.serviceName || "Unknown",
                    price: service.price || 0,
                    status: service.status || "Inactive",
                    image: service.image || "default-image.jpg",
                    description: service.description || "",
                    facilityAddress: service.facilityAddress || facility?.address || "Unknown",
                }));
                setServices(mappedServices);
                setFilteredServices(mappedServices);
            } else {
                showToast(result.message || "Không thể lấy danh sách dịch vụ.", "error");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy danh sách dịch vụ";
            console.error("Fetch services error:", err);
            showToast(errorMessage, "error");
        }
    };

    const fetchFields = async () => {
        console.log("Fetching fields with facId:", facId);
        try {
            const response = await fetch(`${API_URL}/api/Field/facility/${facId}`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Fields API error:", response.status, errorText);
                throw new Error(`Lỗi khi lấy danh sách sân: ${response.status} - ${errorText || response.statusText}`);
            }

            const result = await response.json();
            console.log("Fields API response:", result);
            if (result.success) {
                setFields(result.data);
                setFilteredFields(result.data);
            } else {
                showToast(result.message || "Không thể lấy danh sách sân.", "error");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy danh sách sân";
            console.error("Fetch fields error:", err);
            showToast(errorMessage, "error");
        }
    };

    const fetchCategories = async () => {
        console.log("Fetching categories with facId:", facId);
        try {
            const response = await fetch(`${API_URL}/api/Field/category/${facId}`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Category API error:", response.status, errorText);
                throw new Error(`Lỗi khi lấy danh sách danh mục: ${response.status} - ${errorText || response.statusText}`);
            }

            const result = await response.json();
            console.log("Categories API response:", result);
            if (result.success) {
                const mappedCategories: Category[] = result.data.map((item: any) => ({
                    categoryId: item.categoryId,
                    categoryName: item.categoryName,
                }));
                setCategories(mappedCategories);
            } else {
                showToast(result.message || "Không thể lấy danh sách danh mục.", "error");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy danh sách danh mục";
            console.error("Fetch categories error:", err);
            showToast(errorMessage, "error");
        }
    };

    useEffect(() => {
        console.log("useEffect triggered with facId:", facId);
        if (facId) {
            setLoading(true);
            Promise.all([fetchFacility(), fetchFields(), fetchServices(), fetchCategories()])
                .then(() => {
                    const stateFacility = location.state?.facility as Facility | undefined;
                    if (stateFacility && stateFacility.facId === Number(facId)) {
                        console.log("Using state facility data:", stateFacility);
                        setFacility(stateFacility);
                        setFields(stateFacility.fields);
                        setFilteredFields(stateFacility.fields);
                        setServices(stateFacility.services);
                        setFilteredServices(stateFacility.services);
                    }
                })
                .catch((err) => {
                    console.error("Error in useEffect:", err);
                    showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
            showToast("Không có facId được cung cấp.", "error");
        }
    }, [facId, location.state]);

    useEffect(() => {
        const lowerCaseFilter = fieldFilter.toLowerCase();
        setFilteredFields(
            fields.filter(
                (field) =>
                    field.fieldName.toLowerCase().includes(lowerCaseFilter) ||
                    field.description.toLowerCase().includes(lowerCaseFilter) ||
                    field.categoryName.toLowerCase().includes(lowerCaseFilter),
            ),
        );
    }, [fieldFilter, fields]);

    useEffect(() => {
        const lowerCaseFilter = serviceFilter.toLowerCase();
        setFilteredServices(
            services.filter(
                (service) =>
                    service.serviceName.toLowerCase().includes(lowerCaseFilter) ||
                    service.description.toLowerCase().includes(lowerCaseFilter) ||
                    service.status.toLowerCase().includes(lowerCaseFilter),
            ),
        );
    }, [serviceFilter, services]);

    const handleDeleteField = async (fieldId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sân này?")) {
            setIsSubmitting(true);
            try {
                const response = await fetch(`${API_URL}/api/Field/${fieldId}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    const result = await response.json();
                    console.error("Delete field API error:", response.status, result);
                    throw new Error(result.message || `Lỗi khi xóa sân: ${response.status} - ${result.message || response.statusText}`);
                }

                setFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
                setFilteredFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
                showToast("Xóa sân thành công!", "success");
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi xóa sân";
                showToast(errorMessage, "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDeleteService = async (serviceId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) {
            setIsSubmitting(true);
            try {
                const response = await fetch(`${API_URL}/api/Service/DeleteService/${serviceId}`, {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    const result = await response.json();
                    console.error("Delete service API error:", response.status, result);
                    throw new Error(result.message || `Lỗi khi xóa dịch vụ: ${response.status} - ${result.message || response.statusText}`);
                }

                setServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
                setFilteredServices((prev) => prev.filter((s) => s.serviceId !== serviceId));
                showToast("Xóa dịch vụ thành công!", "success");
                fetchServices();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi xóa dịch vụ";
                showToast(errorMessage, "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleEditField = (field: Field) => {
        setEditField(field);
        setFieldFormData({
            fieldName: field.fieldName,
            categoryId: field.categoryId,
            description: field.description,
            isBookingEnable: field.isBookingEnable,
        });
    };

    const handleEditService = (service: Service) => {
        setEditService(service);
        setServiceFormData({
            serviceName: service.serviceName,
            price: service.price,
            status: service.status,
            imageFile: null,
            description: service.description,
            facilityAddress: service.facilityAddress,
        });
    };

    const handleSaveFieldEdit = async () => {
        if (editField && fieldFormData) {
            if (!fieldFormData.fieldName || !fieldFormData.categoryId) {
                showToast("Tên sân và loại sân là bắt buộc!", "error");
                return;
            }
            setIsSubmitting(true);
            try {
                const response = await fetch(`${API_URL}/api/Field/${editField.fieldId}`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        fieldName: fieldFormData.fieldName,
                        categoryId: fieldFormData.categoryId,
                        description: fieldFormData.description,
                        isBookingEnable: fieldFormData.isBookingEnable,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error("Update field API error:", response.status, result);
                    throw new Error(result.message || `Lỗi khi cập nhật sân: ${response.status} - ${result.message || response.statusText}`);
                }

                if (result.success) {
                    const updatedField: Field = {
                        fieldId: editField.fieldId,
                        facId: editField.facId,
                        facilityAddress: editField.facilityAddress,
                        categoryId: fieldFormData.categoryId || editField.categoryId,
                        categoryName: categories.find((c) => c.categoryId === fieldFormData.categoryId)?.categoryName || editField.categoryName,
                        fieldName: fieldFormData.fieldName || editField.fieldName,
                        description: fieldFormData.description || editField.description,
                        isBookingEnable: fieldFormData.isBookingEnable || editField.isBookingEnable,
                    };

                    setFields((prev) => prev.map((f) => (f.fieldId === editField.fieldId ? updatedField : f)));
                    setFilteredFields((prev) => prev.map((f) => (f.fieldId === editField.fieldId ? updatedField : f)));
                    setEditField(null);
                    setFieldFormData(null);
                    showToast("Cập nhật sân thành công!", "success");
                } else {
                    showToast(result.message || "Không thể cập nhật sân.", "error");
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi cập nhật sân";
                showToast(errorMessage, "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleSaveServiceEdit = async () => {
        if (editService && serviceFormData) {
            if (!serviceFormData.serviceName || serviceFormData.price <= 0) {
                showToast("Tên dịch vụ và giá là bắt buộc!", "error");
                return;
            }
            setIsSubmitting(true);
            try {
                const formData = new FormData();
                formData.append("serviceName", serviceFormData.serviceName);
                formData.append("price", serviceFormData.price.toString());
                formData.append("status", serviceFormData.status);
                formData.append("description", serviceFormData.description);
                if (serviceFormData.imageFile) {
                    formData.append("imageFile", serviceFormData.imageFile);
                }

                const response = await fetch(`${API_URL}/api/Service/UpdateService/${editService.serviceId}`, {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: formData,
                });

                if (!response.ok) {
                    const result = await response.json();
                    console.error("Update service API error:", response.status, result);
                    throw new Error(result.message || `Lỗi khi cập nhật dịch vụ: ${response.status} - ${result.message || response.statusText}`);
                }

                const updatedService = await response.json();
                const mappedService: Service = {
                    serviceId: updatedService.serviceId,
                    facId: updatedService.facId,
                    serviceName: updatedService.serviceName || "Unknown",
                    price: updatedService.price || 0,
                    status: updatedService.status || "Inactive",
                    image: updatedService.image || "default-image.jpg",
                    description: updatedService.description || "",
                    facilityAddress: updatedService.facilityAddress || facility?.address || "Unknown",
                };

                setServices((prev) => prev.map((s) => (s.serviceId === editService.serviceId ? mappedService : s)));
                setFilteredServices((prev) => prev.map((s) => (s.serviceId === editService.serviceId ? mappedService : s)));
                setEditService(null);
                setServiceFormData(null);
                showToast("Cập nhật dịch vụ thành công!", "success");
                await fetchServices();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi cập nhật dịch vụ";
                showToast(errorMessage, "error");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleAddField = async () => {
        if (!newFieldFormData.fieldName || (newFieldFormData.categoryId ?? 0) <= 0) {
            showToast("Tên sân và loại sân là bắt buộc!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/Field/Create-Field`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    fieldName: newFieldFormData.fieldName,
                    facId: Number(facId),
                    categoryId: newFieldFormData.categoryId,
                    description: newFieldFormData.description,
                    isBookingEnable: newFieldFormData.isBookingEnable,
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                console.error("Add field API error:", response.status, result);
                throw new Error(result.message || `Lỗi khi thêm sân: ${response.status} - ${result.message || response.statusText}`);
            }

            await fetchFields();
            setIsAddFieldModalOpen(false);
            setNewFieldFormData({
                categoryId: 1,
                fieldName: "",
                description: "",
                isBookingEnable: true,
            });
            showToast("Thêm sân thành công!", "success");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi thêm sân";
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddService = async () => {
        if (!newServiceFormData.serviceName || newServiceFormData.price <= 0) {
            showToast("Tên dịch vụ và giá là bắt buộc!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("serviceName", newServiceFormData.serviceName);
            formData.append("price", newServiceFormData.price.toString());
            formData.append("status", newServiceFormData.status);
            formData.append("description", newServiceFormData.description);
            if (newServiceFormData.imageFile) {
                formData.append("imageFile", newServiceFormData.imageFile);
            }
            formData.append("facId", facId || "");

            const response = await fetch(`${API_URL}/api/Service/Add/Service`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData,
            });

            if (!response.ok) {
                const result = await response.json();
                console.error("Add service API error:", response.status, result);
                throw new Error(result.message || `Lỗi khi thêm dịch vụ: ${response.status} - ${result.message || response.statusText}`);
            }

            const newService = await response.json();
            const mappedService: Service = {
                serviceId: newService.serviceId,
                facId: newService.facId,
                serviceName: newService.serviceName || "Unknown",
                price: newService.price || 0,
                status: newService.status || "Inactive",
                image: newService.image || "default-image.jpg",
                description: newService.description || "",
                facilityAddress: facility?.address || "Unknown",
            };

            setServices((prev) => [...prev, mappedService]);
            setFilteredServices((prev) => [...prev, mappedService]);
            setIsAddServiceModalOpen(false);
            setNewServiceFormData({
                serviceName: "",
                price: 0,
                status: "Active",
                imageFile: null,
                description: "",
                facilityAddress: "",
            });
            showToast("Thêm dịch vụ thành công!", "success");
            await fetchServices();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi thêm dịch vụ";
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFieldFormData((prev) => prev ? { ...prev, [name]: (e.target as HTMLInputElement).checked } : prev);
        } else {
            setFieldFormData((prev) => prev ? { ...prev, [name]: name === "categoryId" ? Number(value) : value } : prev);
        }
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === "imageFile") {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            setServiceFormData((prev) => prev ? { ...prev, imageFile: file } : prev);
        } else {
            setServiceFormData((prev) => prev ? { ...prev, [name]: type === "number" ? Number(value) : value } : prev);
        }
    };

    const handleNewFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setNewFieldFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setNewFieldFormData((prev) => ({ ...prev, [name]: name === "categoryId" ? Number(value) : value }));
        }
    };

    const handleNewServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === "imageFile") {
            const file = (e.target as HTMLInputElement).files?.[0] || null;
            setNewServiceFormData((prev) => ({ ...prev, imageFile: file }));
        } else {
            setNewServiceFormData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
        }
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

   const handleManageField = (fieldId: number, fieldName: string) => {
    navigate(`/weekly_schedule?fieldId=${fieldId}&fieldName=${encodeURIComponent(fieldName)}&facId=${facId}`);
};

    if (loading) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đang tải...</h2>
                    </div>
                </div>
            </>
        );
    }

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

                    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                        <div className="md:flex">
                            <div className="md:w-1/3">
                                <img
                                    src={facility.picture || "default-image.jpg"}
                                    alt="Facility"
                                    className="w-full h-64 md:h-full object-cover"
                                />
                            </div>
                            <div className="md:w-2/3 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{facility.description}</h2>
                                        <p className="text-gray-600 text-lg">ID: #{facility.facId}</p>
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
                                                {facility.openTime} - {facility.closeTime}
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
                                            disabled={isSubmitting}
                                        >
                                            <FiPlus className="h-4 w-4" />
                                            Thêm sân
                                        </button>
                                    )}
                                    {activeTab === "services" && (
                                        <button
                                            onClick={() => setIsAddServiceModalOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                            disabled={isSubmitting}
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
                                                            Địa chỉ
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Trạng thái
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredFields.map((field) => (
                                                        <tr key={field.fieldId} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                #{field.fieldId}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                                {field.fieldName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {field.categoryName}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                                <div className="truncate" title={field.description}>
                                                                    {field.description}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {field.facilityAddress}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${field.isBookingEnable
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                        }`}
                                                                >
                                                                    {field.isBookingEnable ? "Có thể đặt" : "Không thể đặt"}
                                                                </span>
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
                                                                        onClick={() => handleDeleteField(field.fieldId)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                                        title="Xóa"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        <FiTrash2 className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleManageField(field.fieldId, field.fieldName)}
                                                                        className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors duration-200"
                                                                        title="Quản lý"
                                                                    >
                                                                        Quản lý
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
                                                            Địa chỉ
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Thao tác
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {filteredServices.map((service) => (
                                                        <tr key={service.serviceId} className="hover:bg-gray-50 transition-colors duration-150">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                #{service.serviceId}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                                {service.serviceName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                                {service.price.toLocaleString()} VND
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${service.status === "Active" || service.status === "Available"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-gray-100 text-gray-800"
                                                                        }`}
                                                                >
                                                                    {service.status === "Active" || service.status === "Available" ? "Hoạt động" : "Tạm dừng"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                                <div className="truncate" title={service.description}>
                                                                    {service.description}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <img
                                                                    src={service.image}
                                                                    alt="Service"
                                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {service.facilityAddress}
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
                                                                        onClick={() => handleDeleteService(service.serviceId)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                                                                        title="Xóa"
                                                                        disabled={isSubmitting}
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
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                Chi tiết sân: {selectedField.fieldName}
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
                                                    <p className="text-sm text-gray-900">#{selectedField.fieldId}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedField.isBookingEnable
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                            }`}
                                                    >
                                                        {selectedField.isBookingEnable ? "Có thể đặt" : "Không thể đặt"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Tên sân:</span>
                                                <p className="text-sm text-gray-900 font-semibold">{selectedField.fieldName}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Loại:</span>
                                                <p className="text-sm text-gray-900">{selectedField.categoryName}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                                                <p className="text-sm text-gray-900">{selectedField.description}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Địa chỉ:</span>
                                                <p className="text-sm text-gray-900">{selectedField.facilityAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                Chi tiết dịch vụ: {selectedService.serviceName}
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
                                                    <p className="text-sm text-gray-900">#{selectedService.serviceId}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedService.status === "Active" || selectedService.status === "Available"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-800"
                                                            }`}
                                                    >
                                                        {selectedService.status === "Active" || selectedService.status === "Available" ? "Hoạt động" : "Tạm dừng"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Tên dịch vụ:</span>
                                                <p className="text-sm text-gray-900 font-semibold">{selectedService.serviceName}</p>
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
                                                    src={selectedService.image}
                                                    alt="Service"
                                                    className="w-full h-48 object-cover rounded-lg mt-2 border border-gray-200"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Địa chỉ:</span>
                                                <p className="text-sm text-gray-900">{selectedService.facilityAddress}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                            <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa sân: {editField.fieldName}</h3>
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
                                                    name="fieldName"
                                                    value={fieldFormData.fieldName || ""}
                                                    onChange={handleFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    maxLength={50}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân</label>
                                                <select
                                                    name="categoryId"
                                                    value={fieldFormData.categoryId || ""}
                                                    onChange={handleFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Chọn loại sân</option>
                                                    {categories.map((category) => (
                                                        <option key={category.categoryId} value={category.categoryId}>
                                                            {category.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={fieldFormData.description || ""}
                                                    onChange={handleFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    name="isBookingEnable"
                                                    checked={fieldFormData.isBookingEnable || false}
                                                    onChange={handleFieldChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    disabled={isSubmitting}
                                                />
                                                <label className="text-sm font-medium text-gray-700">Cho phép đặt sân</label>
                                            </div>
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleSaveFieldEdit}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                    name="fieldName"
                                                    value={newFieldFormData.fieldName || ""}
                                                    onChange={handleNewFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    maxLength={50}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại sân</label>
                                                <select
                                                    name="categoryId"
                                                    value={newFieldFormData.categoryId || ""}
                                                    onChange={handleNewFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Chọn loại sân</option>
                                                    {categories.map((category) => (
                                                        <option key={category.categoryId} value={category.categoryId}>
                                                            {category.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={newFieldFormData.description || ""}
                                                    onChange={handleNewFieldChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    name="isBookingEnable"
                                                    checked={newFieldFormData.isBookingEnable || false}
                                                    onChange={handleNewFieldChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    disabled={isSubmitting}
                                                />
                                                <label className="text-sm font-medium text-gray-700">Cho phép đặt sân</label>
                                            </div>
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleAddField}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Đang thêm..." : "Thêm sân"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                    name="serviceName"
                                                    value={newServiceFormData.serviceName}
                                                    onChange={handleNewServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                                <select
                                                    name="status"
                                                    value={newServiceFormData.status}
                                                    onChange={handleNewServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                                                <input
                                                    type="file"
                                                    name="imageFile"
                                                    accept="image/*"
                                                    onChange={handleNewServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {newServiceFormData.imageFile && (
                                                <div>
                                                    <img
                                                        src={URL.createObjectURL(newServiceFormData.imageFile)}
                                                        alt="Preview"
                                                        className="w-24 h-24 object-cover rounded-md mt-2"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleAddService}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Đang thêm..." : "Thêm dịch vụ"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                            <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa dịch vụ: {editService.serviceName}</h3>
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
                                                    name="serviceName"
                                                    value={serviceFormData.serviceName}
                                                    onChange={handleServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                                <select
                                                    name="status"
                                                    value={serviceFormData.status}
                                                    onChange={handleServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
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
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                                                <input
                                                    type="file"
                                                    name="imageFile"
                                                    accept="image/*"
                                                    onChange={handleServiceChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            {serviceFormData.imageFile && (
                                                <div>
                                                    <img
                                                        src={URL.createObjectURL(serviceFormData.imageFile)}
                                                        alt="Preview"
                                                        className="w-24 h-24 object-cover rounded-md mt-2"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button
                                                    onClick={closeModal}
                                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={handleSaveServiceEdit}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FacilityDetail;