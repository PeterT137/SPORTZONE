/* eslint-disable @typescript-eslint/no-unused-vars */
import { Calendar, Clock, Grid, List, MapPin, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Header from "../Header";
interface Field {
    id: number
    name: string
    location: string
    price: number
    rating: number
    reviews: number
    image: string
    type: "football" | "tennis" | "badminton" | "basketball"
    size: "small" | "medium" | "large"
    facilities: string[]
    available: boolean
    facilityName: string
}

const mockFields: Field[] = [
    {
        id: 1,
        name: "Sân bóng đá mini Thể Thao",
        location: "Quận 1, TP.HCM",
        price: 300000,
        rating: 4.8,
        reviews: 124,
        image: "https://hd1.hotdeal.vn/images/uploads/2015/07/22/164334/164334-san-bong-mini-body-%20%288%29.jpg",
        type: "football",
        size: "small",
        facilities: ["Đèn chiếu sáng", "Phòng thay đồ", "Bãi đỗ xe"],
        available: true,
        facilityName: "Hồ Chí Minh"
    },
    {
        id: 2,
        name: "Sân tennis VIP",
        location: "Quận 3, TP.HCM",
        price: 150000,
        rating: 4.6,
        reviews: 89,
        image: "https://dailysonepoxy.com/wp-content/uploads/2023/10/thi-cong-san-tennis-dat-chuan-quoc-te-tai-quan-6.jpg",
        type: "tennis",
        size: "medium",
        facilities: ["Điều hòa", "Phòng thay đồ", "Căng tin"],
        available: true,
        facilityName: "Hồ Chí Minh"

    },
    {
        id: 3,
        name: "Sân cầu lông Hoàng Gia",
        location: "Quận 7, TP.HCM",
        price: 80000,
        rating: 4.5,
        reviews: 67,
        image: "https://theminh1024.wordpress.com/wp-content/uploads/2011/07/caulong-88171639.jpg",
        type: "badminton",
        size: "small",
        facilities: ["Điều hòa", "Đèn LED", "Phòng thay đồ"],
        available: false,
        facilityName: "Hồ Chí Minh"

    },
    {
        id: 4,
        name: "Sân bóng rổ Olympic",
        location: "Quận 5, TP.HCM",
        price: 200000,
        rating: 4.7,
        reviews: 156,
        image: "https://www.myuc.vn/uploads/products/2023/03/24/3.jpg",
        type: "basketball",
        size: "large",
        facilities: ["Đèn chiếu sáng", "Bảng điện tử", "Khán đài"],
        available: true,
        facilityName: "Hồ Chí Minh"

    },
]


const FieldListPage: React.FC = () => {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [selectedType, setSelectedType] = useState<string>("all")
    const [selectedSize, setSelectedSize] = useState<string>("all")
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
    const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [showFilters, setShowFilters] = useState<boolean>(true)
    const [showBookingModal, setShowBookingModal] = useState<boolean>(false)
    const [selectedField, setSelectedField] = useState<Field | null>(null)
    const [bookingDate, setBookingDate] = useState<string>("")
    const [bookingTime, setBookingTime] = useState<string>("")
    const [bookingDuration, setBookingDuration] = useState<string>("60")
    const [selectedFacility, setSelectedFacility] = useState<string>("all")

    const filteredFields = useMemo(() => {
        return mockFields.filter((field) => {
            const matchesSearch =
                field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                field.location.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = selectedType === "all" || field.type === selectedType
            const matchesSize = selectedSize === "all" || field.size === selectedSize
            const matchesPrice = field.price >= priceRange[0] && field.price <= priceRange[1]
            const matchesAvailability = !showAvailableOnly || field.available
            const matchesFacility = selectedFacility === "all" || field.facilityName.toLowerCase() === selectedFacility.toLowerCase()

            return matchesSearch && matchesType && matchesSize && matchesPrice && matchesAvailability && matchesFacility
        })
    }, [searchTerm, selectedType, selectedSize, priceRange, showAvailableOnly, selectedFacility])

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    const getTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            football: "Bóng đá",
            tennis: "Tennis",
            badminton: "Cầu lông",
            basketball: "Bóng rổ",
        }
        return labels[type] || type
    }

    const getSizeLabel = (size: string): string => {
        const labels: Record<string, string> = {
            small: "Nhỏ",
            medium: "Trung bình",
            large: "Lớn",
        }
        return labels[size] || size
    }
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
    const handleBookField = (field: Field) => {
        const user = localStorage.getItem("token");
        if (!user) {
            showToast("Vui lòng đăng nhập để đặt sân!", "error");
            navigate("/login");
        } else {
            setSelectedField(field);
            setShowBookingModal(true);
        }
    };

    const handleConfirmBooking = () => {
        if (selectedField && bookingDate && bookingTime && bookingDuration) {
            navigate("/payment", {
                state: {
                    field: selectedField,
                    date: bookingDate,
                    time: bookingTime,
                    duration: Number(bookingDuration),
                },
            })
            setShowBookingModal(false)
        } else {
            alert("Vui lòng nhập đầy đủ ngày, giờ và thời lượng.")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm sân thể thao</h1>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên sân hoặc địa điểm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex justify-between items-center">

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Hiển thị:</span>
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">

                    <div className="flex-1">
                        <div className="mb-4 flex justify-between items-center">
                            <p className="text-gray-600">Tìm thấy {filteredFields.length} sân phù hợp</p>
                        </div>

                        {viewMode === "grid" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredFields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="relative">
                                            <img
                                                src={field.image || "/placeholder.svg"}
                                                alt={field.name}
                                                className="w-full h-48 object-cover"
                                            />
                                            {!field.available && (
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <span className="text-white font-medium">Đã được đặt</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-2">{field.name}</h3>

                                            <div className="flex items-center text-gray-600 mb-2">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                <span className="text-sm">{field.location}</span>
                                            </div>

                                            <div className="flex items-center mb-2">
                                                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                <span className="text-sm font-medium">{field.rating}</span>
                                                <span className="text-sm text-gray-500 ml-1">({field.reviews} đánh giá)</span>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {getTypeLabel(field.type)}
                                                </span>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                    {getSizeLabel(field.size)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-lg font-bold text-green-600">{formatCurrency(field.price)}/giờ</span>
                                                <button
                                                    disabled={!field.available}
                                                    onClick={() => handleBookField(field)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${field.available
                                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                >
                                                    {field.available ? "Đặt sân" : "Hết chỗ"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === "list" && (
                            <div className="space-y-4">
                                {filteredFields.map((field) => (
                                    <div key={field.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="md:w-48 h-32 relative">
                                                <img
                                                    src={field.image || "/placeholder.svg"}
                                                    alt={field.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                {!field.available && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                                        <span className="text-white font-medium text-sm">Đã được đặt</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-semibold text-xl">{field.name}</h3>
                                                    <span className="text-xl font-bold text-green-600">{formatCurrency(field.price)}/giờ</span>
                                                </div>

                                                <div className="flex items-center text-gray-600 mb-2">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    <span>{field.location}</span>
                                                </div>

                                                <div className="flex items-center mb-3">
                                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                    <span className="font-medium">{field.rating}</span>
                                                    <span className="text-gray-500 ml-1">({field.reviews} đánh giá)</span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                                        {getTypeLabel(field.type)}
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                                                        {getSizeLabel(field.size)}
                                                    </span>
                                                    {field.facilities.map((facility, index) => (
                                                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                                            {facility}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex justify-end">
                                                    <button
                                                        disabled={!field.available}
                                                        onClick={() => handleBookField(field)}
                                                        className={`px-6 py-2 rounded-md font-medium transition-colors ${field.available
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        {field.available ? "Đặt sân ngay" : "Hết chỗ"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {filteredFields.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <Search className="w-16 h-16 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sân phù hợp</h3>
                                <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showBookingModal && selectedField && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Chọn thời gian đặt sân</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày</label>
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ bắt đầu</label>
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                                    <input
                                        type="time"
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng (phút)</label>
                                <select
                                    value={bookingDuration}
                                    onChange={(e) => setBookingDuration(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="60">60 phút</option>
                                    <option value="90">90 phút</option>
                                    <option value="120">120 phút</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowBookingModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FieldListPage