/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  parse,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiDownload,
  FiMinus,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../Sidebar";

interface Booking {
  id: number;
  customerName: string;
  date: Date;
  duration: number;
  field: string;
  status: "confirmed" | "pending" | "cancelled";
  contact: string;
  basePrice: number;
  userId?: number | null;
  bookingId?: number | null;
  guestName?: string | null;
  guestPhone?: string | null;
}

interface Service {
  id: number;
  name: string;
  price: number;
  quantity: number;
  icon: string;
  unit: string;
}

interface BookingService extends Service {
  bookingId: number;
}

interface Schedule {
  scheduleId: number;
  fieldId: number;
  fieldName: string;
  bookingId: number;
  bookingTitle: string;
  startTime: string;
  endTime: string;
  date: string;
  notes: string;
  status: string;
  price: number;
}

interface CreateSlotData {
  fieldId: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
}

interface PricingSlot {
  id?: number;
  startTime: string;
  endTime: string;
  price: number;
}

interface Facility {
  id: number;
  name: string;
  openTime: string;
  closeTime: string;
  // Thêm các trường khác nếu cần
}

interface UserInfo {
  uId: number;
  uEmail: string;
  admin?: {
    name: string;
    phone: string;
  };
  customers?: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
  fieldOwner?: {
    name: string;
    phone: string;
  };
  staff?: {
    name: string;
    phone: string;
  };
}

// Interface cho booking detail từ API
interface BookingDetail {
  bookingId: number;
  fieldId: number;
  fieldName?: string;
  facilityName?: string;
  facilityAddress?: string;
  userId?: number | null;
  guestName?: string | null;
  guestPhone?: string | null;
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  statusPayment?: string;
  createAt?: string;
  notes?: string;
  // Thêm các trường mới dựa trên cấu trúc thực tế
  field?: any;
  order?: {
    orderId?: number;
    guestName?: string;
    guestPhone?: string;
    customerName?: string;
    customerPhone?: string;
    totalAmount?: number;
    [key: string]: any;
  };
  bookedSlots?: any[];
  [key: string]: any; // Cho phép các trường khác
}

const API_URL = "https://localhost:7057";

// Hàm ánh xạ tên dịch vụ sang icon và unit
const mapServiceToIconAndUnit = (
  serviceName: string
): { icon: string; unit: string } => {
  const lowerName = serviceName.toLowerCase();
  if (lowerName.includes("áo")) {
    return { icon: "👕", unit: "bộ" };
  } else if (lowerName.includes("giày")) {
    return { icon: "👟", unit: "đôi" };
  } else if (
    lowerName.includes("nước") ||
    lowerName.includes("suối") ||
    lowerName.includes("tăng lực")
  ) {
    return { icon: "🥤", unit: "chai" };
  } else if (lowerName.includes("bóng")) {
    return { icon: "⚽", unit: "quả" };
  } else if (lowerName.includes("khăn")) {
    return { icon: "🏃‍♂️", unit: "chiếc" };
  } else if (lowerName.includes("băng")) {
    return { icon: "🩹", unit: "bộ" };
  } else if (lowerName.includes("tất")) {
    return { icon: "🧦", unit: "đôi" };
  } else if (lowerName.includes("găng")) {
    return { icon: "🧤", unit: "đôi" };
  }
  return { icon: "🛠️", unit: "lần" }; // Mặc định cho các dịch vụ không xác định
};

const BookingCell: React.FC<{
  booking: Booking;
  onClick: (booking: Booking) => void;
}> = ({ booking, onClick }) => {
  // Kiểm tra xem có phải slot trống không
  const isEmpty =
    booking.customerName === "Không có tên" && booking.contact === "Unknown";

  const statusColors = {
    confirmed:
      "bg-gradient-to-br from-green-100 to-green-200 border-green-400 text-green-800 hover:from-green-200 hover:to-green-300 shadow-green-100",
    pending:
      "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-800 hover:from-yellow-200 hover:to-yellow-300 shadow-yellow-100",
    cancelled:
      "bg-gradient-to-br from-red-100 to-red-200 border-red-400 text-red-800 hover:from-red-200 hover:to-red-300 shadow-red-100",
  };

  // Màu cho slot trống (chưa đặt)
  const emptySlotColor =
    "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 text-gray-600 hover:from-gray-150 hover:to-gray-250 shadow-gray-100";

  const statusIcons = {
    confirmed: "✓",
    pending: "⏳",
    cancelled: "✕",
  };

  const statusText = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };

  if (!booking) return null;

  // Xử lý click - chỉ cho phép mở modal nếu không phải slot trống
  const handleClick = () => {
    if (!isEmpty) {
      onClick(booking);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-3 rounded-lg border-2 ${
        isEmpty ? emptySlotColor : statusColors[booking.status]
      } ${
        isEmpty ? "cursor-default" : "cursor-pointer"
      } transition-all duration-200 ${
        isEmpty ? "" : "hover:shadow-lg transform hover:-translate-y-1"
      } group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate group-hover:text-clip">
            {isEmpty ? "Slot trống" : booking.customerName}
          </p>
          <p className="text-xs opacity-75 truncate">
            {format(booking.date, "HH:mm", { locale: vi })}
          </p>
        </div>
        <div className="flex-shrink-0 ml-2">
          <span className="text-sm">
            {isEmpty ? "📅" : statusIcons[booking.status]}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {isEmpty ? (
          <>
            <p className="text-xs font-medium text-gray-500">🕐 Có thể đặt</p>
            <p className="text-xs opacity-60 font-medium text-gray-500">
              Chưa có người đặt
            </p>
            <div className="text-xs opacity-50 text-gray-500">
              {booking.duration}h - {booking.field}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-medium text-gray-700">
              💰 {booking.basePrice.toLocaleString("vi-VN")}đ
            </p>
            <p className="text-xs opacity-60 font-medium">
              {statusText[booking.status]}
            </p>
            <div className="text-xs opacity-50">
              {booking.duration}h - {booking.field}
            </div>
          </>
        )}
      </div>

      {/* Hover effect overlay - chỉ cho slot đã đặt */}
      {!isEmpty && (
        <div className="absolute inset-0 bg-white bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
      )}
    </div>
  );
};

const BookingDetailsModal: React.FC<{
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (
    booking: Booking,
    services: BookingService[],
    paymentMethod: string
  ) => void;
  availableServices: Service[];
}> = ({ booking, onClose, onConfirm, availableServices }) => {
  const [selectedServices, setSelectedServices] = useState<BookingService[]>(
    []
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">(
    "cash"
  );
  const [showAddService, setShowAddService] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(
    null
  );
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);

  // Function để lấy auth headers
  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  // Function để lấy thông tin user từ API
  const fetchUserInfo = useCallback(
    async (userId: number) => {
      setIsLoadingUserInfo(true);
      try {
        const endpoint = `${API_URL}/get-all-account`;
        console.log(`🔍 Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Response from ${endpoint}:`, result);
          if (result.success && result.data) {
            const user = result.data.find(
              (account: UserInfo) => account.uId === userId
            );
            if (user) {
              setUserInfo(user);
              console.log("Found user info from endpoint:", user);
              return;
            } else {
              console.log("⚠️ Không tìm thấy userId trong danh sách account");
              setUserInfo(null);
            }
          } else {
            console.log(
              "⚠️ API trả về không đúng định dạng hoặc không có data"
            );
            setUserInfo(null);
          }
        } else if (response.status === 403 || response.status === 401) {
          // Không đủ quyền truy cập
          console.log("🚫 Không đủ quyền truy cập endpoint get-all-account");
          setUserInfo({
            uId: userId,
            uEmail: "",
            admin: undefined,
            customers: undefined,
            fieldOwner: undefined,
            staff: undefined,
            // Đánh dấu lỗi quyền
            error:
              "Bạn không có quyền xem thông tin khách hàng. Vui lòng đăng nhập bằng tài khoản admin!",
          } as any);
        } else {
          console.log(`❌ ${endpoint} returned ${response.status}`);
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUserInfo(null);
      } finally {
        setIsLoadingUserInfo(false);
      }
    },
    [getAuthHeaders]
  );

  // Function để lấy thông tin booking chi tiết
  const fetchBookingDetail = useCallback(
    async (bookingId: number) => {
      try {
        console.log("Fetching booking detail for ID:", bookingId);

        const response = await fetch(
          `${API_URL}/api/Booking/GetBookingById/${bookingId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        console.log("Booking detail API response status:", response.status);

        if (response.ok) {
          const result = await response.json();
          console.log("Booking detail response:", result);

          if (result.success && result.data) {
            setBookingDetail(result.data);
            console.log("✅ Set booking detail:", result.data);

            // DEBUG: Log toàn bộ cấu trúc data để hiểu rõ
            console.log("🔍 BookingDetail structure analysis:");
            console.log("- Keys:", Object.keys(result.data));
            console.log("- userId:", result.data.userId);
            console.log("- guestName:", result.data.guestName);
            console.log("- guestPhone:", result.data.guestPhone);
            console.log("- order object:", result.data.order);

            if (result.data.order) {
              console.log("🔍 Order object analysis:");
              console.log("- Order keys:", Object.keys(result.data.order));
              console.log("- Order guestName:", result.data.order.guestName);
              console.log("- Order guestPhone:", result.data.order.guestPhone);
              console.log(
                "- Order customerName:",
                result.data.order.customerName
              );
              console.log(
                "- Order customerPhone:",
                result.data.order.customerPhone
              );
            }

            // CHỈ fetch thông tin user khi thực sự có userId
            if (result.data.userId) {
              console.log(
                "📞 Có userId, đang fetch thông tin user cho userId:",
                result.data.userId
              );
              await fetchUserInfo(result.data.userId);
            } else {
              console.log(
                "🎯 Không có userId - đây là booking guest, sử dụng guestName và guestPhone"
              );
              console.log("Guest info từ booking detail:", {
                guestName: result.data.guestName,
                guestPhone: result.data.guestPhone,
              });
              console.log("Guest info từ order:", {
                guestName: result.data.order?.guestName,
                guestPhone: result.data.order?.guestPhone,
              });
              // Không cần fetch user info cho guest
              setUserInfo(null);
            }
          } else {
            console.log("API response không có success hoặc data:", result);
          }
        } else {
          console.error(
            "Booking detail API error:",
            response.status,
            await response.text()
          );

          // Nếu 404, có nghĩa là booking không tồn tại trong database
          if (response.status === 404) {
            console.log(
              "Booking không tồn tại, có thể là slot trống hoặc dữ liệu không đồng bộ"
            );
            setBookingDetail(null);
          }
        }
      } catch (error) {
        console.error("Error fetching booking detail:", error);
        setBookingDetail(null);
      }
    },
    [fetchUserInfo, getAuthHeaders]
  );

  // Effect để load dữ liệu khi modal mở
  useEffect(() => {
    if (booking && booking.bookingId) {
      // Reset state trước khi fetch
      setUserInfo(null);
      setBookingDetail(null);
      setIsLoadingUserInfo(false);

      // Kiểm tra bookingId hợp lệ (phải là số dương)
      if (booking.bookingId > 0) {
        console.log(
          "Fetching booking detail for valid bookingId:",
          booking.bookingId
        );
        fetchBookingDetail(booking.bookingId);
      } else {
        console.log(
          "Invalid bookingId:",
          booking.bookingId,
          "- skipping fetch"
        );
        // Đây có thể là slot trống hoặc dữ liệu không hợp lệ
        setBookingDetail(null);
      }
    } else {
      console.log("No booking or bookingId provided:", booking);
      // Reset state khi không có booking
      setUserInfo(null);
      setBookingDetail(null);
      setIsLoadingUserInfo(false);
    }
  }, [booking, fetchBookingDetail]);

  // Function để lấy tên hiển thị
  const getDisplayName = (): string => {
    console.log("Getting display name - booking detail:", bookingDetail);
    console.log("Getting display name - userInfo:", userInfo);
    console.log("Getting display name - original booking:", booking);

    // Nếu userInfo có lỗi quyền thì trả về thông báo
    if ((userInfo as any)?.error) {
      return (userInfo as any).error;
    }
    // ƯU TIÊN 1: Thử truy cập guest info từ order object
    if (bookingDetail?.order) {
      const order = bookingDetail.order as any;
      if (order.guestName) return order.guestName;
      if (order.customerName && order.customerName !== "Không có tên")
        return order.customerName;
    }
    // ƯU TIÊN 2: Guest info trực tiếp từ booking detail level
    if (bookingDetail?.guestName) return bookingDetail.guestName;
    // ƯU TIÊN 3: Nếu có userId, dùng thông tin user đã fetch
    if (bookingDetail?.userId && userInfo) {
      const name =
        userInfo.admin?.name ||
        userInfo.customers?.[0]?.name ||
        userInfo.fieldOwner?.name ||
        userInfo.staff?.name;
      if (name) return name;
    }
    // CUỐI CÙNG: Fallback từ booking gốc
    let fallbackName = booking?.customerName || "Khách hàng";
    if (fallbackName.startsWith("Đặt sân "))
      fallbackName = fallbackName.replace("Đặt sân ", "").trim();
    if (fallbackName === booking?.field || fallbackName.includes("Sân "))
      fallbackName = "Khách hàng";
    return fallbackName;
  };

  // Function để lấy số điện thoại hiển thị
  const getDisplayPhone = (): string => {
    console.log("Getting display phone - booking detail:", bookingDetail);
    console.log("Getting display phone - userInfo:", userInfo);

    // ƯUTTIÊN 1: Thử truy cập guest info từ order object
    if (bookingDetail?.order) {
      const order = bookingDetail.order as any;
      console.log("📋 Order object for phone:", order);

      if (order.guestPhone) {
        console.log("🎯 Found guest phone in order:", order.guestPhone);
        return order.guestPhone;
      }

      if (order.customerPhone) {
        console.log("🎯 Found customer phone in order:", order.customerPhone);
        return order.customerPhone;
      }
    }

    // ƯUTTIÊN 2: Guest info trực tiếp từ booking detail level
    if (bookingDetail?.guestPhone) {
      console.log(
        "🎯 Guest booking - Using guest phone from booking detail:",
        bookingDetail.guestPhone
      );
      return bookingDetail.guestPhone;
    }

    // ƯUTTIÊN 3: Nếu có userId, dùng thông tin user đã fetch
    if (bookingDetail?.userId && userInfo) {
      const phone =
        userInfo.admin?.phone ||
        userInfo.customers?.[0]?.phone ||
        userInfo.fieldOwner?.phone ||
        userInfo.staff?.phone;

      if (phone) {
        console.log("👤 User booking - Using user phone:", phone);
        return phone;
      }
    }

    // CUỐI CÙNG: Fallback từ booking gốc
    let fallbackPhone = booking?.contact;
    if (!fallbackPhone || fallbackPhone === "Unknown") {
      fallbackPhone = "Chưa có thông tin";
    }

    console.log("⚠️ Final fallback phone:", fallbackPhone);
    return fallbackPhone;
  };

  // Function để lấy email hiển thị
  const getDisplayEmail = (): string => {
    console.log("Getting display email - userInfo:", userInfo);
    console.log("Getting display email - bookingDetail:", bookingDetail);

    // ƯUTTIÊN 1: Nếu có userId, hiển thị email từ user info
    if (bookingDetail?.userId && userInfo) {
      const email = userInfo.uEmail || userInfo.customers?.[0]?.email;
      if (email) {
        console.log("👤 User booking - Using user email:", email);
        return email;
      }
    }

    // ƯUTTIÊN 2: Guest không có email, luôn hiển thị "Khách vãng lai"
    console.log("🎯 Guest booking or no user info - Using default email");
    return "Khách vãng lai";
  };

  const totalServicePrice = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const totalPrice = (booking?.basePrice || 0) + totalServicePrice;

  const addService = (service: Service) => {
    const existingService = selectedServices.find((s) => s.id === service.id);
    if (existingService) {
      setSelectedServices(
        selectedServices.map((s) =>
          s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setSelectedServices([
        ...selectedServices,
        { ...service, bookingId: booking?.id || 0 },
      ]);
    }
    setShowAddService(false);
  };

  const updateServiceQuantity = (serviceId: number, change: number) => {
    setSelectedServices(
      selectedServices.map((service) => {
        if (service.id === serviceId) {
          const newQuantity = Math.max(1, service.quantity + change);
          return { ...service, quantity: newQuantity };
        }
        return service;
      })
    );
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(
      selectedServices.filter((service) => service.id !== serviceId)
    );
  };

  const handleConfirm = () => {
    if (booking) {
      onConfirm(booking, selectedServices, paymentMethod);
      onClose();
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết đặt sân
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                Thông tin khách hàng
                {isLoadingUserInfo && (
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                )}
              </h3>

              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tên khách hàng:</span>{" "}
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayName()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Số điện thoại:</span>{" "}
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayPhone()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <span className={isLoadingUserInfo ? "text-gray-400" : ""}>
                    {getDisplayEmail()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Loại khách hàng:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      // Kiểm tra userId từ bookingDetail thay vì userInfo
                      bookingDetail?.userId
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {/* Hiển thị loại khách hàng dựa trên userId từ bookingDetail */}
                    {bookingDetail?.userId
                      ? userInfo
                        ? userInfo.admin
                          ? "Quản trị viên"
                          : userInfo.fieldOwner
                          ? "Chủ sân"
                          : userInfo.staff
                          ? "Nhân viên"
                          : userInfo.customers?.[0]
                          ? "Khách hàng thành viên"
                          : "Người dùng"
                        : "Thành viên (đang tải...)"
                      : "Khách vãng lai"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Ngày đặt:</span>{" "}
                  {format(booking.date, "dd/MM/yyyy", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Giờ đặt:</span>{" "}
                  {format(booking.date, "HH:mm", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Sân:</span> {booking.field}
                </p>
                <p>
                  <span className="font-medium">Thời gian:</span>{" "}
                  {booking.duration} giờ
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status === "confirmed"
                      ? "Đã xác nhận"
                      : booking.status === "pending"
                      ? "Chờ xác nhận"
                      : "Đã hủy"}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">
                Tổng kết thanh toán
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tiền thuê sân:</span>
                  <span>{booking.basePrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Dịch vụ & cho thuê:</span>
                  <span>{totalServicePrice.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3">
              Phương thức thanh toán
            </h3>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value as "cash")}
                  className="mr-2"
                />
                <span>Tiền mặt</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "transfer")
                  }
                  className="mr-2"
                />
                <span>Chuyển khoản</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">
                Dịch vụ & đồ cho thuê đã chọn
              </h3>
              <button
                onClick={() => setShowAddService(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Thêm dịch vụ</span>
              </button>
            </div>

            {selectedServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa chọn dịch vụ nào
              </p>
            ) : (
              <div className="space-y-3">
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.price.toLocaleString("vi-VN")}đ/
                          {service.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateServiceQuantity(service.id, -1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Giảm số lượng"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">
                          {service.quantity}
                        </span>
                        <button
                          onClick={() => updateServiceQuantity(service.id, 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Tăng số lượng"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-medium w-20 text-right">
                        {(service.price * service.quantity).toLocaleString(
                          "vi-VN"
                        )}
                        đ
                      </span>
                      <button
                        onClick={() => removeService(service.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Xóa dịch vụ"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Xác nhận đặt sân
            </button>
          </div>
        </div>
      </div>

      {showAddService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Chọn dịch vụ & đồ cho thuê
              </h3>
              <button
                onClick={() => setShowAddService(false)}
                className="p-1 hover:bg-gray-100 rounded"
                title="Đóng modal chọn dịch vụ"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableServices
                .filter(
                  (service) =>
                    !selectedServices.find((s) => s.id === service.id)
                )
                .map((service) => (
                  <div
                    key={service.id}
                    onClick={() => addService(service)}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{service.icon}</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.price.toLocaleString("vi-VN")}đ/
                          {service.unit}
                        </p>
                      </div>
                    </div>
                    <FiPlus className="w-5 h-5 text-blue-500" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateSlotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (slotData: CreateSlotData) => void;
  fieldId: number;
  fieldName: string;
  facility: Facility | null;
}> = ({ isOpen, onClose, onSubmit, fieldId, fieldName, facility }) => {
  const [formData, setFormData] = useState<CreateSlotData>({
    fieldId: fieldId,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    startTime: facility ? facility.openTime.substring(0, 5) : "06:00",
    endTime: facility
      ? `${(parseInt(facility.openTime.split(":")[0], 10) + 1)
          .toString()
          .padStart(2, "0")}:00`
      : "07:00",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate form
    if (
      !formData.startDate ||
      !formData.endDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      Swal.fire("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    // Validate time range
    if (formData.startTime >= formData.endTime) {
      Swal.fire(
        "Lỗi",
        "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc!",
        "error"
      );
      return;
    }

    // Validate date range
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      Swal.fire(
        "Lỗi",
        "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!",
        "error"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form khi thành công
      setFormData({
        fieldId: fieldId,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        startTime: facility ? facility.openTime.substring(0, 5) : "06:00",
        endTime: facility
          ? `${(parseInt(facility.openTime.split(":")[0], 10) + 1)
              .toString()
              .padStart(2, "0")}:00`
          : "07:00",
        notes: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateSlotData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateTimeOptions = () => {
    const times = [];

    // Sử dụng giờ mở cửa và đóng cửa từ facility, hoặc default 6-23
    const startHour = facility
      ? parseInt(facility.openTime.split(":")[0], 10)
      : 6;
    const endHour = facility
      ? parseInt(facility.closeTime.split(":")[0], 10)
      : 23;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Tạo slot đặt sân
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Thông tin sân</h3>
            <p className="text-blue-800">
              <span className="font-medium">Sân:</span> {fieldName}
            </p>
            {facility && (
              <p className="text-blue-800 mt-1">
                <span className="font-medium">Giờ hoạt động:</span>{" "}
                {facility.openTime.substring(0, 5)} -{" "}
                {facility.closeTime.substring(0, 5)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn ngày bắt đầu"
                aria-label="Ngày bắt đầu"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn ngày kết thúc"
                aria-label="Ngày kết thúc"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn thời gian bắt đầu"
                aria-label="Thời gian bắt đầu"
                required
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Chọn thời gian kết thúc"
                aria-label="Thời gian kết thúc"
                required
              >
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ghi chú
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Nhập ghi chú cho slot này..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 Hướng dẫn</h3>
            <div className="text-yellow-800 text-sm space-y-1">
              <p>
                • Chọn ngày bắt đầu và kết thúc để tạo slot cho khoảng thời gian
                đó
              </p>
              <p>
                • Thời gian slot sẽ được tạo từ 30 phút đến nhiều giờ tùy theo
                lựa chọn
              </p>
              <p>
                • Slot sẽ được tạo cho tất cả các ngày trong khoảng thời gian đã
                chọn
              </p>
              <p>• Các slot trùng lặp sẽ không được tạo</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang tạo...
                </>
              ) : (
                "Tạo slot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component quản lý giá đặt theo giờ
const PricingManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  fieldId: number;
  fieldName: string;
  showToast: (message: string, type: "success" | "error") => void;
  fetchSchedule: () => Promise<void>;
  onPricingUpdate?: () => Promise<void>;
}> = ({
  isOpen,
  onClose,
  fieldId,
  fieldName,
  showToast,
  fetchSchedule,
  onPricingUpdate,
}) => {
  const [pricingSlots, setPricingSlots] = useState<PricingSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }, []);

  // Fetch pricing data từ API khi modal mở
  const fetchPricingData = useCallback(async () => {
    console.log("fetchPricingData called for fieldId:", fieldId);
    if (!fieldId) {
      console.log("No fieldId provided");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/api/FieldPricing/byField/${fieldId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fetch pricing API error:", response.status, errorText);
        // Nếu không có dữ liệu, để trống và hiển thị thông báo
        console.log("Setting empty pricing slots due to API error");
        setPricingSlots([]);
        showToast(
          "Chưa có cấu hình giá cho sân này. Vui lòng thêm giá mới.",
          "error"
        );
        return;
      }

      const result = await response.json();
      console.log("Fetch pricing API response:", result);

      if (result && Array.isArray(result) && result.length > 0) {
        // Map dữ liệu từ API và lọc trùng lặp
        const uniquePricings = new Map();
        result.forEach((pricing: any) => {
          const key = `${pricing.startTime}-${pricing.endTime}`;
          if (!uniquePricings.has(key)) {
            uniquePricings.set(key, pricing);
          }
        });

        const mappedPricing: PricingSlot[] = Array.from(
          uniquePricings.values()
        ).map((pricing: any) => {
          console.log("Raw pricing data from API:", pricing);
          return {
            id: pricing.fieldPricingId || pricing.id || pricing.pricingId, // Thử tất cả các trường ID có thể
            startTime: pricing.startTime
              ? pricing.startTime.substring(0, 5)
              : "06:00", // Convert từ "HH:mm:ss" sang "HH:mm"
            endTime: pricing.endTime
              ? pricing.endTime.substring(0, 5)
              : "12:00",
            price: pricing.price || 100000,
          };
        });
        console.log("Setting unique pricing slots from API:", mappedPricing);
        setPricingSlots(mappedPricing);
      } else {
        // Nếu không có dữ liệu, để trống và hiển thị thông báo
        console.log("No pricing data found, setting empty array");
        setPricingSlots([]);
        showToast(
          "Chưa có cấu hình giá cho sân này. Vui lòng thêm giá mới.",
          "error"
        );
      }
    } catch (err) {
      console.error("Fetch pricing error:", err);
      // Để trống khi có lỗi
      console.log("Setting empty pricing slots due to error");
      setPricingSlots([]);
      showToast(
        "Không thể tải dữ liệu giá từ server. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [fieldId, showToast]);

  useEffect(() => {
    if (isOpen && fieldId) {
      // Reset pricing slots trước khi fetch
      setPricingSlots([]);
      setIsLoading(true);
      fetchPricingData();
    } else if (!isOpen) {
      // Reset state khi modal đóng
      setPricingSlots([]);
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }, [isOpen, fieldId, fetchPricingData]);

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate pricing slots
    for (let i = 0; i < pricingSlots.length; i++) {
      const slot = pricingSlots[i];
      if (!slot.startTime || !slot.endTime || slot.price <= 0) {
        Swal.fire(
          "Lỗi",
          `Vui lòng điền đầy đủ thông tin cho khung giờ ${i + 1}!`,
          "error"
        );
        return;
      }
      if (slot.startTime >= slot.endTime) {
        Swal.fire(
          "Lỗi",
          `Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc ở khung giờ ${
            i + 1
          }!`,
          "error"
        );
        return;
      }
    }

    // Kiểm tra trùng lặp khung giờ
    const timeSlotMap = new Map();
    for (let i = 0; i < pricingSlots.length; i++) {
      const slot = pricingSlots[i];
      const key = `${slot.startTime}-${slot.endTime}`;
      if (timeSlotMap.has(key)) {
        Swal.fire(
          "Lỗi",
          `Khung giờ ${slot.startTime} - ${slot.endTime} bị trùng lặp!`,
          "error"
        );
        return;
      }
      timeSlotMap.set(key, i);
    }

    setIsSubmitting(true);
    try {
      // HỆ THỐNG MỚI: Không xóa pricing cũ nữa, chỉ tạo mới/cập nhật
      console.log("🔄 Bắt đầu cập nhật pricing - không xóa dữ liệu cũ");

      // Tạo mới tất cả pricing slots (lọc trùng lặp trước)
      const uniqueSlots = pricingSlots.filter(
        (slot, index, self) =>
          index ===
          self.findIndex(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
          )
      );

      console.log(
        "📊 Đang cập nhật",
        uniqueSlots.length,
        "khung giá:",
        uniqueSlots
      );

      // Tạo từng slot mới (API sẽ xử lý logic overwrite/update)
      const createPromises = uniqueSlots.map(async (slot) => {
        const createData = {
          fieldId: fieldId,
          startTime: slot.startTime, // API sẽ parse "HH:mm" thành TimeOnly
          endTime: slot.endTime,
          price: slot.price,
        };

        console.log("💰 Đang xử lý khung giá:", createData);

        // Chỉ sử dụng POST create và xử lý lỗi duplicate thông minh
        const response = await fetch(`${API_URL}/api/FieldPricing`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(createData),
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Nếu lỗi duplicate, bỏ qua và tiếp tục (không throw error)
          if (
            response.status === 409 ||
            response.status === 400 ||
            errorText.toLowerCase().includes("duplicate") ||
            errorText.toLowerCase().includes("already exists") ||
            errorText.toLowerCase().includes("đã tồn tại") ||
            errorText.toLowerCase().includes("constraint")
          ) {
            console.log(
              `Khung giá ${slot.startTime}-${slot.endTime} đã tồn tại, giữ nguyên`
            );
            return { success: true, message: "Already exists" };
          }

          console.error(" Lỗi tạo pricing:", response.status, errorText);
          throw new Error(
            `Lỗi khi tạo khung giá ${slot.startTime}-${slot.endTime}: ${response.status}`
          );
        }

        const result = await response.json();
        console.log(
          `Tạo thành công khung giá ${slot.startTime}-${slot.endTime}`
        );
        return result;
      });

      const results = await Promise.all(createPromises);

      // Đếm số lượng slot được tạo thành công và đã tồn tại
      const createdCount = results.filter(
        (r) => r && !r.message?.includes("Already exists")
      ).length;
      const existingCount = results.filter(
        (r) => r && r.message?.includes("Already exists")
      ).length;

      console.log(
        `📈 Kết quả: ${createdCount} khung giá mới, ${existingCount} khung giá đã tồn tại`
      );

      let successMessage = "Cập nhật giá thành công!";
      if (createdCount > 0 && existingCount > 0) {
        successMessage = `Đã tạo ${createdCount} khung giá mới và giữ nguyên ${existingCount} khung giá hiện có.`;
      } else if (createdCount > 0) {
        successMessage = `Đã tạo ${createdCount} khung giá mới thành công!`;
      } else if (existingCount > 0) {
        successMessage = `Tất cả khung giá đã được cấu hình trước đó. Không có thay đổi nào.`;
      }

      showToast(successMessage, "success");
      onClose();
      // Reload schedule và cập nhật pricing configuration
      await fetchSchedule();
      if (onPricingUpdate) {
        await onPricingUpdate();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi cập nhật giá";
      console.error("Pricing management error:", err);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePricingSlot = (
    index: number,
    field: keyof PricingSlot,
    value: string | number
  ) => {
    setPricingSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const addPricingSlot = () => {
    console.log("addPricingSlot called, current slots:", pricingSlots.length);

    // Tìm khung giờ không trùng lặp
    let startTime = "06:00";
    let endTime = "12:00";

    // Kiểm tra xem khung giờ này đã tồn tại chưa
    const existingSlot = pricingSlots.find(
      (slot) => slot.startTime === startTime && slot.endTime === endTime
    );

    // Nếu trùng, thử tìm khung giờ khác
    if (existingSlot) {
      startTime = "12:00";
      endTime = "18:00";

      // Kiểm tra lại khung giờ mới
      const existingSlot2 = pricingSlots.find(
        (slot) => slot.startTime === startTime && slot.endTime === endTime
      );

      if (existingSlot2) {
        startTime = "18:00";
        endTime = "22:00";
      }
    }

    setPricingSlots((prev) => {
      const newSlots = [...prev, { startTime, endTime, price: 100000 }];
      console.log("New pricing slots:", newSlots);
      return newSlots;
    });
  };

  const removePricingSlot = (index: number) => {
    if (pricingSlots.length > 1) {
      setPricingSlots((prev) => prev.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Quản lý giá đặt theo giờ
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Đóng modal"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Thông tin sân</h3>
            <p className="text-blue-800">
              <span className="font-medium">Sân:</span> {fieldName}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Nhập giá đặt theo khung giờ
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      title: "Làm mới dữ liệu?",
                      text: "Tải lại cấu hình giá từ server.",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#6b7280",
                      confirmButtonText: "Làm mới",
                      cancelButtonText: "Hủy",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        fetchPricingData();
                        showToast("Đã làm mới dữ liệu", "success");
                      }
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Làm mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      title: "Xóa tất cả giá?",
                      text: "Bạn có chắc muốn xóa tất cả cấu hình giá hiện tại?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#d33",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Xóa tất cả",
                      cancelButtonText: "Hủy",
                    }).then((result) => {
                      if (result.isConfirmed) {
                        setPricingSlots([
                          {
                            startTime: "06:00",
                            endTime: "12:00",
                            price: 100000,
                          },
                        ]);
                        showToast("Đã xóa tất cả cấu hình giá", "success");
                      }
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Xóa tất cả
                </button>
                <button
                  type="button"
                  onClick={addPricingSlot}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Thêm khung giờ
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-4 gap-4 mb-4 text-sm font-medium text-gray-700">
                <div>Giờ bắt đầu</div>
                <div>Giờ kết thúc</div>
                <div>Giá sân (VNĐ)/giờ</div>
                <div>Thao tác</div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-gray-600">
                      Đang tải dữ liệu giá...
                    </span>
                  </div>
                </div>
              ) : pricingSlots.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-yellow-50 rounded-xl p-6 mb-4">
                    <div className="flex items-center justify-center mb-3">
                      <svg
                        className="w-12 h-12 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Chưa có cấu hình giá
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Sân này chưa có cấu hình giá theo khung giờ. Vui lòng thêm
                      ít nhất một khung giá để khách hàng có thể đặt sân.
                    </p>
                    <button
                      type="button"
                      onClick={addPricingSlot}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      <FiPlus className="w-5 h-5" />
                      Thêm khung giá đầu tiên
                    </button>
                  </div>
                </div>
              ) : (
                pricingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 mb-3 items-center"
                  >
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updatePricingSlot(index, "startTime", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label={`Giờ bắt đầu khung giờ ${index + 1}`}
                      title={`Chọn giờ bắt đầu cho khung giờ ${index + 1}`}
                      required
                    >
                      {generateTimeOptions().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updatePricingSlot(index, "endTime", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label={`Giờ kết thúc khung giờ ${index + 1}`}
                      title={`Chọn giờ kết thúc cho khung giờ ${index + 1}`}
                      required
                    >
                      {generateTimeOptions().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={slot.price}
                      onChange={(e) =>
                        updatePricingSlot(
                          index,
                          "price",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="Nhập giá..."
                      min="0"
                      step="1000"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => removePricingSlot(index)}
                      disabled={pricingSlots.length <= 1}
                      className={`p-2 rounded-lg transition-colors ${
                        pricingSlots.length <= 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                      title="Xóa khung giờ"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              📋 Hướng dẫn chủ sân
            </h3>
            <div className="text-yellow-800 text-sm space-y-1">
              <p>
                • Phân loại giá đặt của các khung giờ trong ngày sẽ không giống
                nhau do chỉ phí vận hành cơ sở ở các buổi trong ngày cũng khác
                nhau vậy nên SPORTZONE sẽ hỗ trợ bạn điều chỉnh giá.
              </p>
              <p>
                • Chủ sân sẽ thêm các khung giờ ở bảng bên và nhập giá thuê sân
                tại khung giờ đó và lưu ý các khung giờ phải phù hợp với giờ mở
                cửa và giờ đóng cửa của cơ sở.
              </p>
              <p>• SPORTZONE cảm ơn.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Quay lại trang
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                "Lưu giá đặt"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateSlotModal, setShowCreateSlotModal] =
    useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [hasPricingConfiguration, setHasPricingConfiguration] =
    useState<boolean>(false);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const fieldId = Number(searchParams.get("fieldId")) || 1;
  const fieldName = searchParams.get("fieldName") || "Sân không xác định";
  const facId = Number(searchParams.get("facId")) || 0; // Lấy facId từ searchParams

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
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  };

  // Kiểm tra xem sân đã có cấu hình giá chưa
  const checkPricingConfiguration = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/FieldPricing/byField/${fieldId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const hasConfig = result && Array.isArray(result) && result.length > 0;
        setHasPricingConfiguration(hasConfig);
        console.log("Pricing configuration check:", hasConfig);
      } else {
        setHasPricingConfiguration(false);
      }
    } catch (err) {
      console.error("Error checking pricing configuration:", err);
      setHasPricingConfiguration(false);
    }
  }, [fieldId]);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/Field/${fieldId}/schedule`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Schedule API error:", response.status, errorText);
        throw new Error(
          `Lỗi HTTP: ${response.status} - ${errorText || response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Schedule API response:", result);

      if (result.success) {
        const mappedBookings: Booking[] = result.data.map(
          (schedule: Schedule) => {
            const startDateTime = parse(
              `${schedule.date} ${schedule.startTime}`,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
            const endDateTime = parse(
              `${schedule.date} ${schedule.endTime}`,
              "yyyy-MM-dd HH:mm:ss",
              new Date()
            );
            const duration =
              (endDateTime.getTime() - startDateTime.getTime()) /
              (1000 * 60 * 60); // Tính duration theo giờ

            return {
              id: schedule.scheduleId || 0,
              customerName: schedule.bookingTitle || "Không có tên",
              date: startDateTime,
              duration: Math.max(0, duration),
              field: schedule.fieldName || fieldName || "Không xác định",
              status:
                schedule.status === "Booked"
                  ? "confirmed"
                  : schedule.status === "Scheduled"
                  ? "pending"
                  : "cancelled",
              contact: "Unknown", // Sẽ được cập nhật từ booking detail
              basePrice: schedule.price || 0,
              // Chỉ lưu bookingId nếu nó là số dương và có thể hợp lệ
              bookingId:
                schedule.bookingId && schedule.bookingId > 0
                  ? schedule.bookingId
                  : null,
              userId: null, // Sẽ được cập nhật từ booking detail
              guestName: null, // Sẽ được cập nhật từ booking detail
              guestPhone: null, // Sẽ được cập nhật từ booking detail
            };
          }
        );

        setBookings(mappedBookings);
        // Chỉ hiển thị toast khi fetch lần đầu hoặc có yêu cầu refresh manual
        console.log("Schedule loaded successfully");
      } else {
        showToast(result.message || "Không thể lấy lịch sân.", "error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy lịch sân";
      console.error("Fetch schedule error:", err);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [fieldId, fieldName]);

  const fetchServices = useCallback(async () => {
    if (!facId) {
      showToast("Không tìm thấy facId.", "error");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/Service/facility/${facId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Services API error:", response.status, errorText);
        throw new Error(
          `Lỗi khi lấy danh sách dịch vụ: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      const result = await response.json();
      console.log("Services API response:", result);

      if (result.success) {
        const mappedServices: Service[] = result.data.map((service: any) => {
          const { icon, unit } = mapServiceToIconAndUnit(service.serviceName);
          return {
            id: service.serviceId,
            name: service.serviceName,
            price: service.price,
            quantity: 1, // Mặc định quantity là 1
            icon,
            unit,
          };
        });
        setServices(mappedServices);
        console.log("Services loaded successfully");
      } else {
        showToast(
          result.message || "Không thể lấy danh sách dịch vụ.",
          "error"
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Lỗi không xác định khi lấy danh sách dịch vụ";
      console.error("Fetch services error:", err);
      showToast(errorMessage, "error");
    }
  }, [facId]);

  // Fetch thông tin facility để lấy giờ mở cửa/đóng cửa
  const fetchFacility = useCallback(async () => {
    if (!facId) {
      console.log("No facId provided for facility fetch");
      // Set default values khi không có facId
      setFacility({
        id: 0,
        name: "Cơ sở mặc định",
        openTime: "06:00:00",
        closeTime: "23:00:00",
      });
      return;
    }

    console.log("Fetching facility info for facId:", facId);

    try {
      const response = await fetch(`${API_URL}/api/Facility/${facId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      console.log("Facility API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Facility API error:", response.status, errorText);

        // Nếu là lỗi 404, có thể là endpoint không đúng, thử endpoint khác
        if (response.status === 404) {
          console.log("Trying alternative endpoint...");
          const altResponse = await fetch(
            `${API_URL}/api/Facility/GetById/${facId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
              },
            }
          );

          if (altResponse.ok) {
            const altResult = await altResponse.json();
            console.log("Alternative facility API response:", altResult);

            if (
              altResult &&
              (altResult.success || altResult.data || altResult.id)
            ) {
              const data = altResult.data || altResult;
              const facilityData: Facility = {
                id: data.facilityId || data.id || facId,
                name: data.facilityName || data.name || "Cơ sở không xác định",
                openTime: data.openTime || data.openingTime || "06:00:00",
                closeTime: data.closeTime || data.closingTime || "23:00:00",
              };
              setFacility(facilityData);
              console.log(
                "Facility loaded successfully from alternative endpoint:",
                facilityData
              );
              return;
            }
          }
        }

        // Nếu không thể lấy được thông tin, set default và không hiển thị error
        console.warn("Could not fetch facility info, using defaults");
        setFacility({
          id: facId,
          name: "Cơ sở thể thao",
          openTime: "06:00:00",
          closeTime: "23:00:00",
        });
        return;
      }

      const result = await response.json();
      console.log("Facility API response:", result);
      console.log("Facility response type:", typeof result);
      console.log("Facility response keys:", Object.keys(result));

      // Xử lý nhiều format response khác nhau
      let facilityData: Facility;

      if (result.success && result.data) {
        // Format: { success: true, data: {...} }
        console.log("Using success + data format");
        const data = result.data;
        facilityData = {
          id: data.facilityId || data.id || facId,
          name:
            data.facilityName ||
            data.name ||
            data.facilityAddress ||
            "Cơ sở không xác định",
          openTime: data.openTime || data.openingTime || "06:00:00",
          closeTime: data.closeTime || data.closingTime || "23:00:00",
        };
      } else if (result.success && Array.isArray(result.data)) {
        // Format: { success: true, data: [...] }
        console.log("Using success + array data format");
        const data = result.data[0];
        facilityData = {
          id: data.facilityId || data.id || facId,
          name:
            data.facilityName ||
            data.name ||
            data.facilityAddress ||
            "Cơ sở không xác định",
          openTime: data.openTime || data.openingTime || "06:00:00",
          closeTime: data.closeTime || data.closingTime || "23:00:00",
        };
      } else if (result.id || result.facilityId || result.userId) {
        // Format trực tiếp: { id: ..., name: ... } hoặc { userId: ..., name: ... }
        console.log("Using direct format with userId/id");
        facilityData = {
          id: result.facilityId || result.id || result.userId || facId,
          name:
            result.facilityName ||
            result.name ||
            result.address ||
            "Cơ sở không xác định",
          openTime: result.openTime || result.openingTime || "06:00:00",
          closeTime: result.closeTime || result.closingTime || "23:00:00",
        };
      } else if (Array.isArray(result) && result.length > 0) {
        // Format array: [{ id: ..., name: ... }]
        console.log("Using array format");
        const data = result[0];
        facilityData = {
          id: data.facilityId || data.id || data.userId || facId,
          name:
            data.facilityName ||
            data.name ||
            data.address ||
            "Cơ sở không xác định",
          openTime: data.openTime || data.openingTime || "06:00:00",
          closeTime: data.closeTime || data.closingTime || "23:00:00",
        };
      } else if (result.success) {
        // Format: { success: true, ...other fields directly }
        console.log("Using success direct format");
        facilityData = {
          id: result.facilityId || result.id || result.userId || facId,
          name:
            result.facilityName ||
            result.name ||
            result.address ||
            "Cơ sở không xác định",
          openTime: result.openTime || result.openingTime || "06:00:00",
          closeTime: result.closeTime || result.closingTime || "23:00:00",
        };
      } else if (result.name && (result.openTime || result.closeTime)) {
        // Format đơn giản: { name: ..., openTime: ..., closeTime: ... }
        console.log("Using simple format with name and times");
        facilityData = {
          id: result.facilityId || result.id || result.userId || facId,
          name: result.name || result.address || "Cơ sở không xác định",
          openTime: result.openTime || "06:00:00",
          closeTime: result.closeTime || "23:00:00",
        };
      } else {
        // Fallback: sử dụng default values
        console.log("Unknown response format, using default values");
        console.log("Response structure:", JSON.stringify(result, null, 2));
        facilityData = {
          id: facId,
          name: "Cơ sở thể thao",
          openTime: "06:00:00",
          closeTime: "23:00:00",
        };
      }

      setFacility(facilityData);
      console.log("Facility loaded successfully:", facilityData);
    } catch (err) {
      console.error("Fetch facility error:", err);

      // Không hiển thị toast error, chỉ set default values
      console.log("Setting default facility values due to error");
      setFacility({
        id: facId,
        name: "Cơ sở thể thao",
        openTime: "06:00:00",
        closeTime: "23:00:00",
      });
    }
  }, [facId]);

  useEffect(() => {
    if (fieldId && facId) {
      Promise.all([
        fetchSchedule(),
        fetchServices(),
        fetchFacility(),
        checkPricingConfiguration(),
      ])
        .catch((err) => {
          console.error("Error in useEffect:", err);
          showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
        })
        .finally(() => setLoading(false));
    } else {
      showToast("Không tìm thấy ID sân hoặc cơ sở.", "error");
      navigate(-1);
    }
  }, [
    fieldId,
    facId,
    navigate,
    fetchSchedule,
    fetchServices,
    fetchFacility,
    checkPricingConfiguration,
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Tạo timeSlots dựa trên giờ mở cửa và đóng cửa của facility
  const timeSlots = useMemo(() => {
    if (!facility) {
      // Default: 6AM to 5PM nếu chưa có thông tin facility
      return Array.from({ length: 12 }, (_, i) => i + 6);
    }

    // Parse giờ mở cửa và đóng cửa từ facility
    const openHour = parseInt(facility.openTime.split(":")[0], 10);
    const closeHour = parseInt(facility.closeTime.split(":")[0], 10);

    // Tạo mảng các giờ từ openHour đến closeHour-1
    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(hour);
    }

    console.log(
      `Generated time slots from ${openHour}:00 to ${closeHour - 1}:00:`,
      slots
    );
    return slots;
  }, [facility]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.customerName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        false ||
        booking.field?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false
    );
  }, [bookings, searchTerm]);

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const handleBookingConfirm = (
    booking: Booking,
    services: BookingService[],
    paymentMethod: string
  ) => {
    const totalPrice =
      booking.basePrice +
      services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    console.log("Đặt sân đã được xác nhận:", {
      booking,
      services,
      paymentMethod,
    });
    showToast(
      `Đặt sân thành công! Tổng tiền: ${totalPrice.toLocaleString("vi-VN")}đ`,
      "success"
    );
  };

  const handleCreateSlot = async (slotData: CreateSlotData) => {
    try {
      // Kiểm tra xem sân đã có cấu hình giá chưa
      console.log("Checking pricing configuration for field:", fieldId);
      const pricingResponse = await fetch(
        `${API_URL}/api/FieldPricing/byField/${fieldId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (pricingResponse.ok) {
        const pricingResult = await pricingResponse.json();
        console.log("Pricing check result:", pricingResult);

        if (
          !pricingResult ||
          !Array.isArray(pricingResult) ||
          pricingResult.length === 0
        ) {
          Swal.fire({
            icon: "warning",
            title: "Chưa cấu hình giá",
            text: "Sân này chưa có cấu hình giá theo khung giờ. Vui lòng cấu hình giá trước khi tạo slot.",
            confirmButtonText: "Cấu hình giá ngay",
            showCancelButton: true,
            cancelButtonText: "Hủy bỏ",
          }).then((result) => {
            if (result.isConfirmed) {
              setShowPricingModal(true);
            }
          });
          return;
        }
      } else {
        console.warn("Cannot check pricing, but allowing slot creation");
      }

      // Convert time strings to TimeSpan format (HH:mm:ss)
      const formatTimeSpan = (timeString: string) => {
        return `${timeString}:00`; // Convert "HH:mm" to "HH:mm:ss"
      };

      // Ensure date format is YYYY-MM-DD
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const requestBody = {
        fieldId: Number(slotData.fieldId),
        startDate: formatDate(slotData.startDate),
        endDate: formatDate(slotData.endDate),
        dailyStartTime: formatTimeSpan(slotData.startTime),
        dailyEndTime: formatTimeSpan(slotData.endTime),
        notes: slotData.notes || "",
      };

      console.log("Creating slot with data:", requestBody);

      // API call để tạo slot
      const response = await fetch(
        `${API_URL}/api/FieldBookingSchedule/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Create slot API error:", response.status, errorText);

        // Try to parse error details
        try {
          const errorData = JSON.parse(errorText);
          const errorMessages: string[] = [];

          if (errorData.errors) {
            Object.keys(errorData.errors).forEach((key) => {
              errorData.errors[key].forEach((message: string) => {
                errorMessages.push(`${key}: ${message}`);
              });
            });
          }

          const detailedError =
            errorMessages.length > 0
              ? errorMessages.join("\n")
              : errorData.title || "Lỗi không xác định";

          throw new Error(
            `Lỗi khi tạo slot (${response.status}):\n${detailedError}`
          );
        } catch {
          throw new Error(
            `Lỗi khi tạo slot: ${response.status} - ${
              errorText || response.statusText
            }`
          );
        }
      }

      const result = await response.json();
      console.log("Create slot API response:", result);

      // Kiểm tra cả success và có data
      if (result.success || result.data || response.status === 200) {
        showToast("Tạo slot đặt sân thành công!", "success");
        setShowCreateSlotModal(false);
        // Reload schedule data
        await fetchSchedule();
      } else {
        showToast(result.message || "Không thể tạo slot.", "error");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định khi tạo slot";
      console.error("Create slot error:", err);
      showToast(errorMessage, "error");
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col bg-gray-50 pl-4 pt-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đang tải...
            </h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gray-50 pl-4 pt-4">
        <div className="flex-1 ml-[256px] p-4">
          <div className="max-w-7xl w-full space-y-6">
            {/* Cảnh báo khi chưa có cấu hình giá */}
            {!hasPricingConfiguration && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                      <strong>Cảnh báo:</strong> Sân này chưa có cấu hình giá
                      theo khung giờ. Vui lòng cấu hình giá trước khi tạo slot
                      đặt sân.
                    </p>
                  </div>
                  <div className="ml-3">
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Cấu hình ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  title="Quay lại trang trước"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  Quay lại
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Lịch sân: {fieldName}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Quản lý lịch đặt sân và tạo slot mới
                  </p>
                  {facility && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span>🏢</span>
                        {facility.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🕐</span>
                        {facility.openTime.substring(0, 5)} -{" "}
                        {facility.closeTime.substring(0, 5)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <button
                    onClick={() => {
                      if (hasPricingConfiguration) {
                        setShowCreateSlotModal(true);
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: "Chưa cấu hình giá",
                          text: "Vui lòng cấu hình giá cho sân trước khi tạo slot đặt sân.",
                          confirmButtonText: "Cấu hình giá ngay",
                          showCancelButton: true,
                          cancelButtonText: "Hủy bỏ",
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setShowPricingModal(true);
                          }
                        });
                      }
                    }}
                    disabled={!hasPricingConfiguration}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                      hasPricingConfiguration
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      hasPricingConfiguration
                        ? "Tạo slot đặt sân mới"
                        : "Vui lòng cấu hình giá trước"
                    }
                  >
                    <FiPlus className="w-5 h-5" />
                    Tạo slot
                  </button>
                  {!hasPricingConfiguration && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ⚠️ Chưa cấu hình giá cho sân
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPricingModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  title="Quản lý giá đặt theo giờ"
                >
                  <FiDollarSign className="w-5 h-5" />
                  Quản lý giá
                </button>
                <button
                  className="p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Xuất dữ liệu"
                >
                  <FiDownload className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title="Tuần trước"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    {format(weekStart, "dd/MM", { locale: vi })} -{" "}
                    {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Tuần {format(weekStart, "w", { locale: vi })} năm{" "}
                    {format(weekStart, "yyyy")}
                  </p>
                </div>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  title="Tuần sau"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                  title="Về tuần hiện tại"
                >
                  <FiCalendar className="w-4 h-4" />
                  <span>Hôm nay</span>
                </button>
              </div>

              <div className="flex items-center space-x-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng hoặc sân..."
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg w-full lg:w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Tìm thấy:</span>
                  <span className="font-medium text-blue-600">
                    {filteredBookings.length}
                  </span>
                  <span>đặt sân</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Lịch đặt sân theo tuần
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click vào slot để xem chi tiết và quản lý đặt sân
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[768px]">
                  <div className="grid grid-cols-8 gap-1 bg-gray-100 p-2">
                    <div className="bg-white rounded-lg p-3 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">
                        Giờ
                      </span>
                    </div>
                    {daysInWeek.map((day) => {
                      const isToday = isSameDay(day, new Date());
                      return (
                        <div
                          key={day.toString()}
                          className={`bg-white rounded-lg text-center font-semibold py-4 transition-all duration-200 ${
                            isToday
                              ? "ring-2 ring-blue-500 bg-blue-50 shadow-md"
                              : "hover:shadow-md hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`text-sm ${
                              isToday ? "text-blue-600" : "text-gray-600"
                            }`}
                          >
                            {format(day, "EEEE", { locale: vi })}
                          </div>
                          <div
                            className={`text-lg font-bold ${
                              isToday ? "text-blue-700" : "text-gray-800"
                            }`}
                          >
                            {format(day, "dd/MM", { locale: vi })}
                          </div>
                          {isToday && (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 mt-1">
                              Hôm nay
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {timeSlots.map((hour) => (
                      <React.Fragment key={hour}>
                        <div className="bg-white rounded-lg flex items-center justify-end pr-4 py-4 font-semibold text-gray-700 border-r border-gray-200">
                          <div className="text-right">
                            <div className="text-lg">{hour}:00</div>
                            <div className="text-xs text-gray-500">
                              {hour < 12 ? "SA" : "CH"}
                            </div>
                          </div>
                        </div>
                        {daysInWeek.map((day) => {
                          const dayBookings = filteredBookings.filter(
                            (booking) =>
                              isSameDay(booking.date, day) &&
                              booking.date.getHours() === hour
                          );
                          const isEmpty = dayBookings.length === 0;
                          const isToday = isSameDay(day, new Date());

                          return (
                            <div
                              key={`${day}-${hour}`}
                              className={`bg-white rounded-lg min-h-[100px] p-2 border transition-all duration-200 ${
                                isEmpty
                                  ? `border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 ${
                                      isToday ? "bg-blue-25" : ""
                                    }`
                                  : "border-solid border-gray-100"
                              }`}
                            >
                              {isEmpty ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <div className="text-center">
                                    <div className="text-xs opacity-60">
                                      Trống
                                    </div>
                                    {isToday && (
                                      <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mt-1"></div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {dayBookings.map((booking) => (
                                    <BookingCell
                                      key={booking.id}
                                      booking={booking}
                                      onClick={setSelectedBooking}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                      <span className="text-gray-600">Đã xác nhận</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                      <span className="text-gray-600">Chờ xác nhận</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
                      <span className="text-gray-600">Đã hủy</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
                      <span className="text-gray-600">Chưa đặt</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Giờ hoạt động:{" "}
                    {facility
                      ? `${facility.openTime.substring(
                          0,
                          5
                        )} - ${facility.closeTime.substring(0, 5)}`
                      : "6:00 - 23:00"}
                  </div>
                </div>
              </div>
            </div>

            <BookingDetailsModal
              booking={selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onConfirm={handleBookingConfirm}
              availableServices={services}
            />

            <CreateSlotModal
              isOpen={showCreateSlotModal}
              onClose={() => setShowCreateSlotModal(false)}
              onSubmit={handleCreateSlot}
              fieldId={fieldId}
              fieldName={fieldName}
              facility={facility}
            />

            <PricingManagementModal
              isOpen={showPricingModal}
              onClose={() => setShowPricingModal(false)}
              fieldId={fieldId}
              fieldName={fieldName}
              showToast={showToast}
              fetchSchedule={fetchSchedule}
              onPricingUpdate={checkPricingConfiguration}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklySchedule;
