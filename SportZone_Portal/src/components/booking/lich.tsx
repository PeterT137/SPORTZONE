/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, parse, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
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

const API_URL = "https://localhost:7057";

// Hàm ánh xạ tên dịch vụ sang icon và unit
const mapServiceToIconAndUnit = (serviceName: string): { icon: string; unit: string } => {
  const lowerName = serviceName.toLowerCase();
  if (lowerName.includes("áo")) {
    return { icon: "👕", unit: "bộ" };
  } else if (lowerName.includes("giày")) {
    return { icon: "👟", unit: "đôi" };
  } else if (lowerName.includes("nước") || lowerName.includes("suối") || lowerName.includes("tăng lực")) {
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

const BookingCell: React.FC<{ booking: Booking; onClick: (booking: Booking) => void }> = ({ booking, onClick }) => {
  const statusColors = {
    confirmed: "bg-green-100 border-green-400 text-green-800 hover:bg-green-200",
    pending: "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200",
    cancelled: "bg-red-100 border-red-400 text-red-800 hover:bg-red-200",
  };

  const statusText = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };

  return booking ? (
    <div
      onClick={() => onClick(booking)}
      className={`p-2 rounded-lg border-2 ${statusColors[booking.status]} cursor-pointer transition-all hover:shadow-md transform hover:scale-105`}
    >
      <p className="font-semibold text-xs truncate">{booking.customerName}</p>
      <p className="text-xs truncate opacity-75">{booking.field}</p>
      <p className="text-xs font-medium">{booking.basePrice.toLocaleString("vi-VN")}đ</p>
      <p className="text-xs opacity-60">{statusText[booking.status]}</p>
    </div>
  ) : null;
};

const BookingDetailsModal: React.FC<{
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (booking: Booking, services: BookingService[], paymentMethod: string) => void;
  availableServices: Service[];
}> = ({ booking, onClose, onConfirm, availableServices }) => {
  const [selectedServices, setSelectedServices] = useState<BookingService[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [showAddService, setShowAddService] = useState(false);

  const totalServicePrice = selectedServices.reduce((sum, service) => sum + service.price * service.quantity, 0);
  const totalPrice = (booking?.basePrice || 0) + totalServicePrice;

  const addService = (service: Service) => {
    const existingService = selectedServices.find((s) => s.id === service.id);
    if (existingService) {
      setSelectedServices(selectedServices.map((s) => (s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s)));
    } else {
      setSelectedServices([...selectedServices, { ...service, bookingId: booking?.id || 0 }]);
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
      }),
    );
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter((service) => service.id !== serviceId));
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
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đặt sân</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Tên khách hàng:</span> {booking.customerName}
                </p>
                <p>
                  <span className="font-medium">Số điện thoại:</span> {booking.contact}
                </p>
                <p>
                  <span className="font-medium">Ngày đặt:</span> {format(booking.date, "dd/MM/yyyy", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Giờ đặt:</span> {format(booking.date, "HH:mm", { locale: vi })}
                </p>
                <p>
                  <span className="font-medium">Sân:</span> {booking.field}
                </p>
                <p>
                  <span className="font-medium">Thời gian:</span> {booking.duration} giờ
                </p>
                <p>
                  <span className="font-medium">Trạng thái:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${booking.status === "confirmed"
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
              <h3 className="font-semibold text-gray-700 mb-3">Tổng kết thanh toán</h3>
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
                  <span className="text-green-600">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Phương thức thanh toán</h3>
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
                  onChange={(e) => setPaymentMethod(e.target.value as "transfer")}
                  className="mr-2"
                />
                <span>Chuyển khoản</span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Dịch vụ & đồ cho thuê đã chọn</h3>
              <button
                onClick={() => setShowAddService(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Thêm dịch vụ</span>
              </button>
            </div>

            {selectedServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa chọn dịch vụ nào</p>
            ) : (
              <div className="space-y-3">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-500">
                          {service.price.toLocaleString("vi-VN")}đ/{service.unit}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateServiceQuantity(service.id, -1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">{service.quantity}</span>
                        <button
                          onClick={() => updateServiceQuantity(service.id, 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-medium w-20 text-right">
                        {(service.price * service.quantity).toLocaleString("vi-VN")}đ
                      </span>
                      <button
                        onClick={() => removeService(service.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
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
              <h3 className="text-lg font-semibold">Chọn dịch vụ & đồ cho thuê</h3>
              <button onClick={() => setShowAddService(false)} className="p-1 hover:bg-gray-100 rounded">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableServices
                .filter((service) => !selectedServices.find((s) => s.id === service.id))
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
                          {service.price.toLocaleString("vi-VN")}đ/{service.unit}
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

const WeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/Field/${fieldId}/schedule`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Schedule API error:", response.status, errorText);
        throw new Error(`Lỗi HTTP: ${response.status} - ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log("Schedule API response:", result);

      if (result.success) {
        const mappedBookings: Booking[] = result.data.map((schedule: Schedule) => {
          const startDateTime = parse(
            `${schedule.date} ${schedule.startTime}`,
            "yyyy-MM-dd HH:mm:ss",
            new Date(),
          );
          const endDateTime = parse(
            `${schedule.date} ${schedule.endTime}`,
            "yyyy-MM-dd HH:mm:ss",
            new Date(),
          );
          const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60); // Tính duration theo giờ

          return {
            id: schedule.scheduleId,
            customerName: schedule.bookingTitle,
            date: startDateTime,
            duration: duration,
            field: schedule.fieldName,
            status:
              schedule.status === "Booked"
                ? "confirmed"
                : schedule.status === "Scheduled"
                  ? "pending"
                  : "cancelled",
            contact: "Unknown", // API không cung cấp contact, gán mặc định
            basePrice: schedule.price,
          };
        });

        setBookings(mappedBookings);
        showToast("Lấy lịch sân thành công!", "success");
      } else {
        showToast(result.message || "Không thể lấy lịch sân.", "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy lịch sân";
      console.error("Fetch schedule error:", err);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
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
        throw new Error(`Lỗi khi lấy danh sách dịch vụ: ${response.status} - ${errorText || response.statusText}`);
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
        showToast("Lấy danh sách dịch vụ thành công!", "success");
      } else {
        showToast(result.message || "Không thể lấy danh sách dịch vụ.", "error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định khi lấy danh sách dịch vụ";
      console.error("Fetch services error:", err);
      showToast(errorMessage, "error");
    }
  };

  useEffect(() => {
    if (fieldId && facId) {
      Promise.all([fetchSchedule(), fetchServices()])
        .catch((err) => {
          console.error("Error in useEffect:", err);
          showToast("Lỗi khi tải dữ liệu. Vui lòng thử lại.", "error");
        })
        .finally(() => setLoading(false));
    } else {
      showToast("Không tìm thấy ID sân hoặc cơ sở.", "error");
      navigate(-1);
    }
  }, [fieldId, facId, navigate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 6); // 6AM to 5PM

  const filteredBookings = useMemo(() => {
    return bookings.filter(
      (booking) =>
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.field.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [bookings, searchTerm]);

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const handleBookingConfirm = (booking: Booking, services: BookingService[], paymentMethod: string) => {
    const totalPrice = booking.basePrice + services.reduce((sum, s) => sum + s.price * s.quantity, 0);
    console.log("Đặt sân đã được xác nhận:", { booking, services, paymentMethod });
    showToast(
      `Đặt sân thành công! Tổng tiền: ${totalPrice.toLocaleString("vi-VN")}đ`,
      "success",
    );
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="min-h-screen flex flex-col bg-gray-50 pl-32 pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đang tải...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gray-50 pl-32 pt-16">
        <div className="flex-1 ml-[256px] p-4">
          <div className="max-w-7xl w-full space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <FiChevronLeft className="h-4 w-4" />
                Quay lại
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Lịch sân: {fieldName}</h1>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">
                  {format(weekStart, "dd/MM", { locale: vi })} -{" "}
                  {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
                </h2>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                    placeholder="Tìm kiếm đặt sân..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full lg:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Xuất dữ liệu"
                >
                  <FiDownload className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[768px]">
                  <div className="grid grid-cols-8 gap-1 bg-gray-100 p-1">
                    <div className="bg-white rounded p-2"></div>
                    {daysInWeek.map((day) => (
                      <div key={day.toString()} className="bg-white rounded text-center font-semibold py-3">
                        <div className="text-sm text-gray-600">{format(day, "EEEE", { locale: vi })}</div>
                        <div className="text-lg">{format(day, "dd/MM", { locale: vi })}</div>
                      </div>
                    ))}

                    {timeSlots.map((hour) => (
                      <React.Fragment key={hour}>
                        <div className="bg-white rounded text-right pr-4 py-4 font-medium text-gray-600">
                          {hour}:00
                        </div>
                        {daysInWeek.map((day) => (
                          <div key={`${day}-${hour}`} className="bg-white rounded min-h-[80px] p-1">
                            {filteredBookings
                              .filter((booking) => isSameDay(booking.date, day) && booking.date.getHours() === hour)
                              .map((booking) => (
                                <BookingCell
                                  key={booking.id}
                                  booking={booking}
                                  onClick={setSelectedBooking}
                                />
                              ))}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default WeeklySchedule;