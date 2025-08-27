// src/hooks/useFacilityDetail.ts
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

// *********************************************************************************
// TYPE DEFINITIONS
// *********************************************************************************
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

type Discount = {
    discountId: number;
    facId: number;
    discountPercentage: number;
    startDate: string;
    endDate: string;
    description: string;
    isActive: boolean;
    quantity: number;
};

type Image = {
    imgId: number;
    facId: number;
    imageUrl: string;
};

type Regulation = {
    id: number;
    facId: number;
    title: string;
    description: string;
    status: string;
};

type Facility = {
    name: string;
    facId: number;
    openTime: string;
    closeTime: string;
    address: string;
    description: string;
    subdescription?: string;
    picture?: string;
    fields: Field[];
    services: Service[];
    discounts: Discount[];
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
    removeImage?: boolean;
};

type EditDiscount = {
    discountPercentage: number;
    startDate: string;
    endDate: string;
    description: string;
    isActive: boolean;
    quantity: number;
};

type Category = {
    categoryId: number;
    categoryName: string;
};

const API_URL = "https://localhost:7057";

// *********************************************************************************
// CUSTOM HOOK: useFacilityDetail
// *********************************************************************************

export const useFacilityDetail = () => {
    // Regulations State
    const [regulations, setRegulations] = useState<Regulation[]>([]);
    const [regulationFilter, setRegulationFilter] = useState("");
    const [filteredRegulations, setFilteredRegulations] = useState<
        Regulation[]
    >([]);
    const [isAddRegulationModalOpen, setIsAddRegulationModalOpen] =
        useState(false);
    const [editRegulation, setEditRegulation] = useState<Regulation | null>(
        null
    );
    const [newRegulationFormData, setNewRegulationFormData] = useState({
        title: "",
        description: "",
        status: "Active",
    });
    const [regulationFormData, setRegulationFormData] = useState({
        title: "",
        description: "",
        status: "Active",
    });
    const { facId } = useParams<{ facId: string }>();
    const navigate = useNavigate();

    // State Management
    const [facility, setFacility] = useState<Facility | null>(null);
    const [activeTab, setActiveTab] = useState<string>("overview");
    const [fields, setFields] = useState<Field[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [filteredFields, setFilteredFields] = useState<Field[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [filteredDiscounts, setFilteredDiscounts] = useState<Discount[]>([]);
    const [fieldFilter, setFieldFilter] = useState<string>("");
    const [serviceFilter, setServiceFilter] = useState<string>("");
    const [discountFilter, setDiscountFilter] = useState<string>("");
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(
        null
    );
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(
        null
    );
    const [editField, setEditField] = useState<Field | null>(null);
    const [editService, setEditService] = useState<Service | null>(null);
    const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
    const [fieldFormData, setFieldFormData] = useState<EditField | null>(null);
    const [serviceFormData, setServiceFormData] = useState<EditService | null>(
        null
    );
    const [discountFormData, setDiscountFormData] =
        useState<EditDiscount | null>(null);
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] =
        useState<boolean>(false);
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] =
        useState<boolean>(false);
    const [isAddDiscountModalOpen, setIsAddDiscountModalOpen] =
        useState<boolean>(false);
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
    const [newDiscountFormData, setNewDiscountFormData] =
        useState<EditDiscount>({
            discountPercentage: 0,
            startDate: "",
            endDate: "",
            description: "",
            isActive: true,
            quantity: 1,
        });
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [isCarouselPaused, setIsCarouselPaused] = useState<boolean>(false);

    // *********************************************************************************
    // HELPER & UTILITY FUNCTIONS
    // *********************************************************************************

    const showToast = (message: string, type: "success" | "error") => {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener("mouseenter", () => Swal.stopTimer());
                toast.addEventListener("mouseleave", () => Swal.resumeTimer());
            },
        });
    };

    const getAuthHeaders = (): Record<string, string> => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const validateToken = (): boolean => {
        const token = localStorage.getItem("token");
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp && payload.exp >= currentTime;
        } catch (error) {
            return false;
        }
    };

    const getImageUrl = (imageUrl: string | undefined): string => {
        if (!imageUrl) {
            return "https://w7.pngwing.com/pngs/395/283/png-transparent-empty-set-null-set-null-sign-mathematics-mathematics-angle-logo-number.png";
        }
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl;
        }
        const baseUrl = "https://localhost:7057";
        return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    };

    // Normalize status to match backend conventions
    const normalizeStatusValue = (value: string | undefined): string => {
        const v = (value || "").toLowerCase().trim();
        if (v === "active" || v === "hoạt động") return "Active";
        if (
            v === "inactive" ||
            v === "không hoạt động" ||
            v === "khong hoat dong"
        )
            return "Inactive";
        return "Active";
    };

    // *********************************************************************************
    // API FETCHING FUNCTIONS (useCallback for memoization)
    // --- Regulations API ---
    const fetchRegulations = useCallback(async () => {
        if (!facId) return;
        try {
            const response = await fetch(
                `${API_URL}/api/RegulationFacility/facility/${facId}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok)
                throw new Error("Không thể lấy danh sách quy định");
            const result = await response.json();
            const mapped = (Array.isArray(result) ? result : []).map(
                (r: any) => ({
                    id:
                        r.regulationFacilityId ??
                        r.RegulationFacilityId ??
                        r.id ??
                        r.Id ??
                        0,
                    facId: r.facId ?? r.FacId ?? 0,
                    title: r.title ?? r.Title ?? "",
                    description: r.description ?? r.Description ?? "",
                    status: normalizeStatusValue(
                        r.status ?? r.Status ?? "Active"
                    ),
                })
            );
            setRegulations(mapped);
        } catch (err) {
            setRegulations([]);
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, [facId]);

    const addRegulation = useCallback(async () => {
        const facIdNumber = Number(facId);
        if (!facIdNumber || Number.isNaN(facIdNumber) || facIdNumber <= 0) {
            showToast("facId không hợp lệ!", "error");
            return;
        }
        const title = (newRegulationFormData.title || "").trim();
        if (!title) {
            showToast("Tiêu đề quy định là bắt buộc!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/RegulationFacility`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    facId: facIdNumber,
                    title,
                    description: newRegulationFormData.description,
                    status: normalizeStatusValue(newRegulationFormData.status),
                }),
            });
            if (!response.ok) {
                if (response.status >= 500) {
                    throw new Error(
                        "Lỗi máy chủ khi thêm quy định. Hãy kiểm tra facId có tồn tại và thử lại."
                    );
                }
                throw new Error("Lỗi khi thêm quy định");
            }
            await fetchRegulations();
            setIsAddRegulationModalOpen(false);
            setNewRegulationFormData({
                title: "",
                description: "",
                status: "Active",
            });
            showToast("Thêm quy định thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [facId, newRegulationFormData, fetchRegulations]);

    const editRegulationHandler = (regulation: Regulation) => {
        // Ensure we carry the correct id field
        const normalized: Regulation = {
            id:
                (regulation as any).id ??
                (regulation as any).regulationFacilityId,
            facId: regulation.facId,
            title: regulation.title,
            description: regulation.description,
            status: normalizeStatusValue(regulation.status),
        } as Regulation;
        setEditRegulation(normalized);
        setRegulationFormData({
            title: normalized.title,
            description: normalized.description,
            status: normalized.status,
        });
    };

    const saveRegulationEdit = useCallback(async () => {
        if (!editRegulation || !regulationFormData.title) {
            showToast("Tiêu đề quy định là bắt buộc!", "error");
            return;
        }
        const regulationId =
            (editRegulation as any).id ??
            (editRegulation as any).regulationFacilityId;
        if (!regulationId || Number.isNaN(Number(regulationId))) {
            showToast("ID quy định không hợp lệ.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_URL}/api/RegulationFacility/${regulationId}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        facId: Number(facId),
                        title: (regulationFormData.title || "").trim(),
                        description: regulationFormData.description,
                        status: normalizeStatusValue(regulationFormData.status),
                    }),
                }
            );
            if (!response.ok) throw new Error("Lỗi khi cập nhật quy định");
            await fetchRegulations();
            setEditRegulation(null);
            setRegulationFormData({
                title: "",
                description: "",
                status: "Active",
            });
            showToast("Cập nhật quy định thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [facId, editRegulation, regulationFormData, fetchRegulations]);

    const deleteRegulation = useCallback(
        async (id: number) => {
            if (!window.confirm("Bạn có chắc chắn muốn xóa quy định này?"))
                return;
            setIsSubmitting(true);
            try {
                const response = await fetch(
                    `${API_URL}/api/RegulationFacility/${id}`,
                    {
                        method: "DELETE",
                        headers: getAuthHeaders(),
                    }
                );
                if (!response.ok) throw new Error("Lỗi khi xóa quy định");
                await fetchRegulations();
                showToast("Xóa quy định thành công!", "success");
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : "Lỗi không xác định",
                    "error"
                );
            } finally {
                setIsSubmitting(false);
            }
        },
        [fetchRegulations]
    );

    // Filter regulations by search
    useEffect(() => {
        const lower = regulationFilter.toLowerCase();
        setFilteredRegulations(
            regulations.filter(
                (r) =>
                    r.title.toLowerCase().includes(lower) ||
                    r.description.toLowerCase().includes(lower)
            )
        );
    }, [regulationFilter, regulations]);
    // *********************************************************************************

    const fetchFacility = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/Facility/with-details`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
            const allFacilities = await response.json();
            const apiFacility = allFacilities.find(
                (fac: any) => fac.facId === Number(facId)
            );
            if (!apiFacility)
                throw new Error("Không tìm thấy cơ sở với ID này");

            const mappedFacility: Facility = {
                name: apiFacility.name || "Unknown",
                facId: Number(facId),
                openTime: apiFacility.openTime?.slice(0, 5) || "00:00",
                closeTime: apiFacility.closeTime?.slice(0, 5) || "00:00",
                address: apiFacility.address || "Unknown",
                description: apiFacility.description || "No description",
                subdescription: apiFacility.subdescription,
                picture: getImageUrl(apiFacility.imageUrls?.[0]),
                images:
                    apiFacility.imageUrls?.map(
                        (url: string, index: number) => ({
                            imgId: index + 1,
                            facId: Number(facId),
                            imageUrl: getImageUrl(url),
                        })
                    ) || [],
                fields: [],
                services: [],
                discounts: [],
            };
            setFacility(mappedFacility);
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, [facId]);

    const fetchServices = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/Service/facility/${facId}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok)
                throw new Error(
                    `Lỗi khi lấy danh sách dịch vụ: ${response.status}`
                );
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                const mappedServices: Service[] = result.data.map(
                    (service: any) => ({
                        ...service,
                        image: getImageUrl(service.image),
                        facilityAddress:
                            service.facilityAddress ||
                            facility?.address ||
                            "Unknown",
                    })
                );
                setServices(mappedServices);
            } else {
                setServices([]);
                showToast(
                    result.message || "Không thể lấy danh sách dịch vụ.",
                    "error"
                );
            }
        } catch (err) {
            setServices([]);
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, [facId, facility?.address]);

    const fetchDiscounts = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/Discount/facility/${facId}`,
                { headers: getAuthHeaders() }
            );
            if (!response.ok)
                throw new Error(
                    `Lỗi khi lấy danh sách mã giảm giá: ${response.status}`
                );
            const result = await response.json();
            let discountData = [];
            if (Array.isArray(result)) discountData = result;
            else if (result.success && Array.isArray(result.data))
                discountData = result.data;
            else if (result.data && Array.isArray(result.data))
                discountData = result.data;

            if (discountData.length > 0) {
                const mappedDiscounts: Discount[] = discountData.map(
                    (d: any) => ({
                        ...d,
                    })
                );
                setDiscounts(mappedDiscounts);
            } else {
                setDiscounts([]);
            }
        } catch (err) {
            setDiscounts([]);
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, [facId]);

    const fetchFields = useCallback(async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/Field/facility/${facId}`,
                {
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok)
                throw new Error(
                    `Lỗi khi lấy danh sách sân: ${response.status}`
                );
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setFields(result.data);
            } else {
                setFields([]);
                showToast(
                    result.message || "Không thể lấy danh sách sân.",
                    "error"
                );
            }
        } catch (err) {
            setFields([]);
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, [facId]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/CategoryField`, {
                headers: getAuthHeaders(),
            });
            if (!response.ok)
                throw new Error(
                    `Lỗi khi lấy danh sách danh mục: ${response.status}`
                );
            const result = await response.json();
            if (Array.isArray(result)) {
                const mappedCategories: Category[] = result.map(
                    (item: any) => ({
                        categoryId: item.categoryFieldId,
                        categoryName: item.categoryFieldName,
                    })
                );
                setCategories(mappedCategories);
            } else {
                showToast("Định dạng dữ liệu danh mục không hợp lệ.", "error");
            }
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        }
    }, []);

    // const fetchDiscountsByStatus = useCallback(
    //   async (isActive: boolean): Promise<Discount[]> => {
    //     try {
    //       const response = await fetch(
    //         `${API_URL}/api/Discount/status/${isActive}`,
    //         { headers: getAuthHeaders() }
    //       );
    //       if (!response.ok)
    //         throw new Error(
    //           `Lỗi khi lấy mã giảm giá theo trạng thái: ${response.status}`
    //         );
    //       const result = await response.json();
    //       if (!result.success)
    //         throw new Error(result.message || "Lỗi không xác định");
    //       return result.data.map((d: any) => ({ ...d }));
    //     } catch (error) {
    //       console.error("Error fetching discounts by status:", error);
    //       throw error;
    //     }
    //   },
    //   []
    // );

    // const searchDiscounts = useCallback(
    //   async (searchText: string): Promise<Discount[]> => {
    //     try {
    //       const response = await fetch(
    //         `${API_URL}/api/Discount/search/${encodeURIComponent(searchText)}`,
    //         { headers: getAuthHeaders() }
    //       );
    //       if (!response.ok)
    //         throw new Error(`Lỗi khi tìm kiếm mã giảm giá: ${response.status}`);
    //       const result = await response.json();
    //       return result.success && Array.isArray(result.data) ? result.data : [];
    //     } catch (err) {
    //       console.error("Error searching discounts:", err);
    //       return [];
    //     }
    //   },
    //   []
    // );

    // *********************************************************************************
    // EVENT HANDLERS
    // *********************************************************************************

    const closeModal = () => {
        setSelectedField(null);
        setSelectedService(null);
        setSelectedDiscount(null);
        setEditField(null);
        setEditService(null);
        setEditDiscount(null);
        setFieldFormData(null);
        setServiceFormData(null);
        setDiscountFormData(null);
        setIsAddFieldModalOpen(false);
        setIsAddServiceModalOpen(false);
        setIsAddDiscountModalOpen(false);
        setIsAddRegulationModalOpen(false);
        setEditRegulation(null);
        setRegulationFormData({ title: "", description: "", status: "Active" });
        setNewRegulationFormData({
            title: "",
            description: "",
            status: "Active",
        });
    };

    // --- Field Handlers ---
    const handleDeleteField = async (fieldId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sân này?")) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/Field/${fieldId}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });
            if (!response.ok)
                throw new Error(
                    (await response.json()).message || "Lỗi khi xóa sân"
                );
            setFields((prev) => prev.filter((f) => f.fieldId !== fieldId));
            showToast("Xóa sân thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
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

    const handleSaveFieldEdit = async () => {
        if (
            !editField ||
            !fieldFormData?.fieldName ||
            !fieldFormData?.categoryId
        ) {
            showToast("Tên sân và loại sân là bắt buộc!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_URL}/api/Field/${editField.fieldId}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...fieldFormData }),
                }
            );
            const result = await response.json();
            if (!response.ok || !result.success)
                throw new Error(result.message || "Lỗi khi cập nhật sân");
            await fetchFields();
            closeModal();
            showToast("Cập nhật sân thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddField = async () => {
        if (!newFieldFormData.fieldName || !newFieldFormData.categoryId) {
            showToast("Tên sân và loại sân là bắt buộc!", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/Field/Create-Field`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newFieldFormData,
                    facId: Number(facId),
                }),
            });
            if (!response.ok)
                throw new Error(
                    (await response.json()).message || "Lỗi khi thêm sân"
                );
            await fetchFields();
            closeModal();
            setNewFieldFormData({
                categoryId: 1,
                fieldName: "",
                description: "",
                isBookingEnable: true,
            });
            showToast("Thêm sân thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === "checkbox";
        setFieldFormData((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: isCheckbox
                          ? (e.target as HTMLInputElement).checked
                          : name === "categoryId"
                          ? Number(value)
                          : value,
                  }
                : null
        );
    };

    const handleNewFieldChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === "checkbox";
        setNewFieldFormData((prev) => ({
            ...prev,
            [name]: isCheckbox
                ? (e.target as HTMLInputElement).checked
                : name === "categoryId"
                ? Number(value)
                : value,
        }));
    };

    const handleManageField = (fieldId: number, fieldName: string) => {
        navigate(
            `/weekly_schedule?fieldId=${fieldId}&fieldName=${encodeURIComponent(
                fieldName
            )}&facId=${facId}`
        );
    };

    // --- Service Handlers ---
    const handleDeleteService = async (serviceId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_URL}/api/Service/DeleteService/${serviceId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok)
                throw new Error(
                    (await response.json()).message || "Lỗi khi xóa dịch vụ"
                );
            setServices((prev) =>
                prev.filter((s) => s.serviceId !== serviceId)
            );
            showToast("Xóa dịch vụ thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
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
            removeImage: false,
        });
    };

    const handleSaveServiceEdit = async () => {
        if (
            !editService ||
            !serviceFormData ||
            !serviceFormData.serviceName ||
            serviceFormData.price <= 0
        ) {
            showToast("Tên dịch vụ và giá là bắt buộc!", "error");
            return;
        }
        if (!validateToken()) {
            showToast("Token không hợp lệ hoặc hết hạn.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("FacId", editService.facId.toString());
            formData.append("ServiceName", serviceFormData.serviceName);
            formData.append("Price", serviceFormData.price.toString());
            formData.append("Status", serviceFormData.status);
            formData.append("Description", serviceFormData.description);
            if (serviceFormData.imageFile)
                formData.append("ImageFile", serviceFormData.imageFile);
            formData.append(
                "RemoveImage",
                String(!!serviceFormData.removeImage)
            );

            const response = await fetch(
                `${API_URL}/api/Service/UpdateService/${editService.serviceId}`,
                {
                    method: "PUT",
                    headers: getAuthHeaders(),
                    body: formData,
                }
            );

            if (!response.ok)
                throw new Error(
                    (await response.text()) || "Lỗi khi cập nhật dịch vụ"
                );

            await fetchServices();
            closeModal();
            showToast("Cập nhật dịch vụ thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddService = async () => {
        if (!newServiceFormData.serviceName || newServiceFormData.price <= 0) {
            showToast("Tên dịch vụ và giá là bắt buộc!", "error");
            return;
        }
        if (!validateToken()) {
            showToast("Token không hợp lệ hoặc hết hạn.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("serviceName", newServiceFormData.serviceName);
            formData.append("price", newServiceFormData.price.toString());
            formData.append("status", newServiceFormData.status);
            formData.append("description", newServiceFormData.description);
            if (newServiceFormData.imageFile)
                formData.append("imageFile", newServiceFormData.imageFile);
            formData.append("facId", facId || "");

            const response = await fetch(`${API_URL}/api/Service/Add/Service`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData,
            });

            if (!response.ok)
                throw new Error(
                    (await response.text()) || "Lỗi khi thêm dịch vụ"
                );

            await fetchServices();
            closeModal();
            setNewServiceFormData({
                serviceName: "",
                price: 0,
                status: "Active",
                imageFile: null,
                description: "",
                facilityAddress: "",
            });
            showToast("Thêm dịch vụ thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleServiceChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        if (name === "imageFile" && e.target instanceof HTMLInputElement) {
            const file = e.target.files?.[0] || null;
            setServiceFormData((prev) =>
                prev ? { ...prev, imageFile: file, removeImage: false } : null
            );
        } else {
            setServiceFormData((prev) =>
                prev
                    ? {
                          ...prev,
                          [name]: type === "number" ? Number(value) : value,
                      }
                    : null
            );
        }
    };

    const handleNewServiceChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        if (name === "imageFile" && e.target instanceof HTMLInputElement) {
            const file = e.target.files?.[0] || null;
            setNewServiceFormData((prev) => ({ ...prev, imageFile: file }));
        } else {
            setNewServiceFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? Number(value) : value,
            }));
        }
    };

    // --- Discount Handlers ---
    const handleDeleteDiscount = async (discountId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?"))
            return;
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_URL}/api/Discount/${discountId}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders(),
                }
            );
            if (!response.ok)
                throw new Error(
                    (await response.json()).message || "Lỗi khi xóa mã giảm giá"
                );
            setDiscounts((prev) =>
                prev.filter((d) => d.discountId !== discountId)
            );
            showToast("Xóa mã giảm giá thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditDiscount = (discount: Discount) => {
        setEditDiscount(discount);
        setDiscountFormData({
            ...discount,
            startDate: discount.startDate.split("T")[0], // Format for date input
            endDate: discount.endDate.split("T")[0],
        });
    };

    const handleSaveDiscountEdit = async () => {
        if (!editDiscount || !discountFormData) return;
        if (
            !discountFormData.startDate ||
            !discountFormData.endDate ||
            discountFormData.discountPercentage <= 0
        ) {
            showToast("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_URL}/api/Discount/${editDiscount.discountId}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...discountFormData,
                        facId: editDiscount.facId,
                    }),
                }
            );
            if (!response.ok)
                throw new Error(
                    (await response.json()).message ||
                        "Lỗi khi cập nhật mã giảm giá"
                );
            await fetchDiscounts();
            closeModal();
            showToast("Cập nhật mã giảm giá thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPositiveInt = (n: unknown) =>
        Number.isInteger(Number(n)) && Number(n) > 0;

    function validateDiscountForm(data: {
        startDate: string;
        endDate: string;
        discountPercentage: number;
        quantity: number;
    }) {
        const { startDate, endDate, discountPercentage, quantity } = data;

        if (!startDate || !endDate || discountPercentage <= 0) {
            return "Vui lòng điền đầy đủ thông tin bắt buộc.";
        }

        if (discountPercentage < 0) {
            return "Phần trăm giảm giá không được âm.";
        }
        if (!isPositiveInt(quantity)) {
            return "Số lượng mã giảm giá phải là số nguyên dương.";
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return "Ngày bắt đầu/kết thúc không hợp lệ.";
        }

        if (end <= start) {
            return "Thời gian kết thúc phải sau thời gian bắt đầu.";
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDay = new Date(start);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(end);
        endDay.setHours(0, 0, 0, 0);

        if (startDay < today && endDay < today) {
            return "Ngày bắt đầu và ngày kết thúc không được cùng nằm trong quá khứ.";
        }

        return null;
    }

    const handleAddDiscount = async () => {
        const errMsg = validateDiscountForm({
            startDate: newDiscountFormData.startDate,
            endDate: newDiscountFormData.endDate,
            discountPercentage: Number(newDiscountFormData.discountPercentage),
            quantity: Number(newDiscountFormData.quantity),
        });
        if (errMsg) {
            showToast(errMsg, "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/Discount`, {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newDiscountFormData,
                    facId: Number(facId),
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload?.message || "Lỗi khi thêm mã giảm giá");
            }

            await fetchDiscounts();
            closeModal();
            setNewDiscountFormData({
                discountPercentage: 0,
                startDate: "",
                endDate: "",
                description: "",
                isActive: true,
                quantity: 1,
            });
            showToast("Thêm mã giảm giá thành công!", "success");
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : "Lỗi không xác định",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscountChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === "checkbox";
        setDiscountFormData((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: isCheckbox
                          ? (e.target as HTMLInputElement).checked
                          : type === "number"
                          ? Number(value)
                          : value,
                  }
                : null
        );
    };

    const handleNewDiscountChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === "checkbox";
        setNewDiscountFormData((prev) => ({
            ...prev,
            [name]: isCheckbox
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                ? Number(value)
                : value,
        }));
    };

    // --- Carousel Handlers ---
    const nextImage = useCallback(() => {
        if (facility?.images && facility.images.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === facility.images.length - 1 ? 0 : prev + 1
            );
        }
    }, [facility?.images]);

    const prevImage = useCallback(() => {
        if (facility?.images && facility.images.length > 0) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? facility.images.length - 1 : prev - 1
            );
        }
    }, [facility?.images]);

    const goToImage = useCallback((index: number) => {
        setCurrentImageIndex(index);
    }, []);

    // *********************************************************************************
    // SIDE EFFECTS (useEffect)
    // *********************************************************************************

    // Initial Data Fetching
    useEffect(() => {
        if (facId) {
            setLoading(true);
            const fetchAllData = async () => {
                await fetchFacility(); // Fetch facility first to get address for services
                await Promise.all([
                    fetchFields(),
                    fetchServices(),
                    fetchDiscounts(),
                    fetchCategories(),
                    fetchRegulations(),
                ]);
                setLoading(false);
            };
            fetchAllData().catch((err) => {
                console.error("Error fetching all data:", err);
                showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
                setLoading(false);
            });
        } else {
            setLoading(false);
            showToast("Không có facId được cung cấp.", "error");
        }
    }, [
        facId,
        fetchFacility,
        fetchFields,
        fetchServices,
        fetchDiscounts,
        fetchCategories,
    ]);

    // Update services when facility address changes
    useEffect(() => {
        if (facility?.address) {
            fetchServices();
        }
    }, [facility?.address, fetchServices]);

    // Filtering Logic
    useEffect(() => {
        const lowerCaseFilter = fieldFilter.toLowerCase();
        setFilteredFields(
            fields.filter(
                (f) =>
                    f.fieldName.toLowerCase().includes(lowerCaseFilter) ||
                    f.description.toLowerCase().includes(lowerCaseFilter) ||
                    f.categoryName.toLowerCase().includes(lowerCaseFilter)
            )
        );
    }, [fieldFilter, fields]);

    useEffect(() => {
        const lowerCaseFilter = serviceFilter.toLowerCase();
        setFilteredServices(
            services.filter(
                (s) =>
                    s.serviceName.toLowerCase().includes(lowerCaseFilter) ||
                    s.description.toLowerCase().includes(lowerCaseFilter) ||
                    s.status.toLowerCase().includes(lowerCaseFilter)
            )
        );
    }, [serviceFilter, services]);

    useEffect(() => {
        const performDiscountFilter = async () => {
            const lowerCaseFilter = discountFilter.toLowerCase().trim();
            if (!lowerCaseFilter) {
                setFilteredDiscounts(discounts);
                return;
            }

            // Client-side filtering as server-side logic might be complex to integrate here
            setFilteredDiscounts(
                discounts.filter(
                    (d) =>
                        d.description.toLowerCase().includes(lowerCaseFilter) ||
                        d.discountPercentage
                            .toString()
                            .includes(lowerCaseFilter) ||
                        (d.isActive ? "hoạt động" : "không hoạt động").includes(
                            lowerCaseFilter
                        )
                )
            );
        };
        performDiscountFilter();
    }, [discountFilter, discounts]);

    // Carousel Effects
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [facility?.facId]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (facility?.images && facility.images.length > 1) {
                if (event.key === "ArrowLeft") prevImage();
                if (event.key === "ArrowRight") nextImage();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [facility?.images, prevImage, nextImage]);

    useEffect(() => {
        if (
            facility?.images &&
            facility.images.length > 1 &&
            !isCarouselPaused
        ) {
            const interval = setInterval(nextImage, 5000);
            return () => clearInterval(interval);
        }
    }, [facility?.images, isCarouselPaused, nextImage]);

    // *********************************************************************************
    // RETURN VALUE
    // *********************************************************************************

    return {
        // Regulations
        regulations,
        filteredRegulations,
        regulationFilter,
        setRegulationFilter,
        isAddRegulationModalOpen,
        setIsAddRegulationModalOpen,
        editRegulation,
        setEditRegulation,
        newRegulationFormData,
        setNewRegulationFormData,
        regulationFormData,
        setRegulationFormData,
        addRegulation,
        editRegulationHandler,
        saveRegulationEdit,
        deleteRegulation,
        // State & Data
        loading,
        isSubmitting,
        facility,
        navigate,
        activeTab,
        filteredFields,
        filteredServices,
        filteredDiscounts,
        categories,
        fieldFilter,
        serviceFilter,
        discountFilter,

        // Modals & Selected Items State
        selectedField,
        selectedService,
        selectedDiscount,
        editField,
        editService,
        editDiscount,
        isAddFieldModalOpen,
        isAddServiceModalOpen,
        isAddDiscountModalOpen,

        // Form Data
        fieldFormData,
        serviceFormData,
        discountFormData,
        newFieldFormData,
        newServiceFormData,
        newDiscountFormData,

        // Carousel
        currentImageIndex,
        isCarouselPaused,

        // Functions & Handlers
        setActiveTab,
        setFieldFilter,
        setServiceFilter,
        setDiscountFilter,
        setSelectedField,
        setSelectedService,
        setSelectedDiscount,
        setIsAddFieldModalOpen,
        setIsAddServiceModalOpen,
        setIsAddDiscountModalOpen,
        setServiceFormData,

        // CRUD and other actions
        closeModal,
        handleDeleteField,
        handleEditField,
        handleSaveFieldEdit,
        handleAddField,
        handleFieldChange,
        handleNewFieldChange,
        handleManageField,
        handleDeleteService,
        handleEditService,
        handleSaveServiceEdit,
        handleAddService,
        handleServiceChange,
        handleNewServiceChange,
        handleDeleteDiscount,
        handleEditDiscount,
        handleSaveDiscountEdit,
        handleAddDiscount,
        handleDiscountChange,
        handleNewDiscountChange,

        // Carousel Actions
        nextImage,
        prevImage,
        goToImage,
        setIsCarouselPaused,
        getImageUrl,
    };
};
