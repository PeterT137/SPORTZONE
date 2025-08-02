import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../Header";
import BookingConfirmModal from "./BookingConfirmModal";
// import FieldService, { type FieldResponse } from "../../services/fieldService";

// Local interfaces for booking functionality
interface FieldScheduleSlot {
  scheduleId: number;
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Booked" | "Blocked";
  price: number;
}

interface Service {
  serviceId: number;
  serviceName: string;
  description: string;
  price: number;
  facilityId: number;
  status: string;
  image: string;
}

interface BookingPageState {
  field?: FieldResponse;
}

interface BookingFormData {
  fieldId: number;
  date: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestPhone: string;
  notes: string;
  selectedServices: number[];
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingPageState;

  const [fields, setFields] = useState<FieldResponse[]>([]);
  const [selectedField, setSelectedField] = useState<FieldResponse | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<FieldScheduleSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<FieldScheduleSlot[]>([]);
  const [facilityServices, setFacilityServices] = useState<Service[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>("");
  const [formData, setFormData] = useState<BookingFormData>({
    fieldId: 0,
    date: "",
    startTime: "",
    endTime: "",
    guestName: "",
    guestPhone: "",
    notes: "",
    selectedServices: [],
  });

  // Mock data generation functions
  const generateMockSlots = (
    fieldId: number,
    date: string
  ): FieldScheduleSlot[] => {
    const slots: FieldScheduleSlot[] = [];
    let scheduleId = 1;

    // Generate slots from 05:00 to 23:30 (30-minute intervals)
    for (let hour = 5; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const endTime =
          minute === 30
            ? `${(hour + 1).toString().padStart(2, "0")}:00`
            : `${hour.toString().padStart(2, "0")}:30`;

        // Random status for demo (mostly Available)
        const random = Math.random();
        let status: "Available" | "Booked" | "Blocked";
        if (random < 0.7) status = "Available";
        else if (random < 0.9) status = "Booked";
        else status = "Blocked";

        slots.push({
          scheduleId: scheduleId++,
          fieldId,
          date,
          startTime,
          endTime,
          status,
          price: 200000, // Default price per slot
        });
      }
    }

    return slots;
  };

  const generateMockServices = (facilityId: number): Service[] => {
    return [
      {
        serviceId: 1,
        serviceName: "Thuê bóng",
        description: "Bóng đá chất lượng cao",
        price: 50000,
        facilityId,
        status: "Active",
        image: "/api/placeholder/100/100",
      },
      {
        serviceId: 2,
        serviceName: "Nước uống",
        description: "Nước suối, nước ngọt",
        price: 15000,
        facilityId,
        status: "Active",
        image: "/api/placeholder/100/100",
      },
      {
        serviceId: 3,
        serviceName: "Đồ bảo hộ",
        description: "Tất, ống đồng",
        price: 30000,
        facilityId,
        status: "Active",
        image: "/api/placeholder/100/100",
      },
    ];
  };

  // Tạo danh sách 7 ngày tới
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("vi-VN", { weekday: "short" }),
        dayNumber: date.getDate(),
        month: date.getMonth() + 1,
      });
    }
    return days;
  };

  const next7Days = getNext7Days();

  // Validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all spaces and special characters
    const cleanPhone = phone.replace(/[\s\-().]/g, "");

    // Vietnamese phone number pattern: exactly 10 digits starting with 0
    const phonePattern = /^0[0-9]{9}$/;

    return phonePattern.test(cleanPhone);
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, guestPhone: value }));

    if (value.trim() === "") {
      setPhoneError("");
    } else if (!validatePhoneNumber(value)) {
      setPhoneError("Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0");
    } else {
      setPhoneError("");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load fields
        const fieldsData = await FieldService.getAllFields();
        setFields(fieldsData);

        // Nếu có field từ state, tìm field đó
        if (state?.field) {
          const field = fieldsData.find(
            (f) => f.fieldId === state.field!.fieldId
          );
          if (field) {
            setSelectedField(field);
            setFormData((prev) => ({ ...prev, fieldId: field.fieldId }));

            // Load services của facility
            const services = generateMockServices(field.facId);
            setFacilityServices(services);
          }
        } else if (fieldsData.length > 0) {
          // Mặc định chọn field đầu tiên
          setSelectedField(fieldsData[0]);
          setFormData((prev) => ({ ...prev, fieldId: fieldsData[0].fieldId }));

          const services = generateMockServices(fieldsData[0].facId);
          setFacilityServices(services);
        }

        // Mặc định chọn ngày hôm nay
        const today = new Date().toISOString().split("T")[0];
        setSelectedDate(today);
        setFormData((prev) => ({ ...prev, date: today }));
      } catch (err) {
        console.error("Error loading booking data:", err);
        setError("Failed to load booking data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [state]);

  useEffect(() => {
    if (selectedField && selectedDate) {
      // Generate mock slots for the selected field and date
      const slots = generateMockSlots(selectedField.fieldId, selectedDate);
      setAvailableSlots(slots);
    }
  }, [selectedField, selectedDate]);

  const handleFieldChange = (fieldId: number) => {
    const field = fields.find((f) => f.fieldId === fieldId);
    if (field) {
      setSelectedField(field);
      setFormData((prev) => ({ ...prev, fieldId: field.fieldId }));

      // Load services của facility mới
      const services = generateMockServices(field.facId);
      setFacilityServices(services);

      // Reset selected slots
      setSelectedSlots([]);
      setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, date }));
    setSelectedSlots([]);
    setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
  };

  const handleSlotClick = (slot: FieldScheduleSlot) => {
    // Chỉ cho phép click vào slot Available
    if (slot.status !== "Available") return;

    const isSelected = selectedSlots.some(
      (s) => s.scheduleId === slot.scheduleId
    );

    if (isSelected) {
      // Bỏ chọn slot
      const newSlots = selectedSlots.filter(
        (s) => s.scheduleId !== slot.scheduleId
      );
      setSelectedSlots(newSlots);
    } else {
      // Thêm slot (chỉ cho phép chọn liên tiếp)
      const newSlots = [...selectedSlots, slot].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      setSelectedSlots(newSlots);
    }
  };

  useEffect(() => {
    // Cập nhật start time và end time dựa trên slots được chọn
    if (selectedSlots.length > 0) {
      const sortedSlots = selectedSlots.sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      );
      setFormData((prev) => ({
        ...prev,
        startTime: sortedSlots[0].startTime,
        endTime: sortedSlots[sortedSlots.length - 1].endTime,
      }));
    } else {
      setFormData((prev) => ({ ...prev, startTime: "", endTime: "" }));
    }
  }, [selectedSlots]);

  const handleServiceToggle = (serviceId: number) => {
    const isSelected = formData.selectedServices.includes(serviceId);
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(
          (id) => id !== serviceId
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedServices: [...prev.selectedServices, serviceId],
      }));
    }
  };

  const calculateTotalPrice = () => {
    const slotsPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
    const servicesPrice = formData.selectedServices.reduce((sum, serviceId) => {
      const service = facilityServices.find((s) => s.serviceId === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    return slotsPrice + servicesPrice;
  };

  const handleSubmit = () => {
    if (selectedSlots.length === 0) {
      alert("Vui lòng chọn ít nhất một khung giờ");
      return;
    }

    if (!formData.guestName || !formData.guestPhone) {
      alert("Vui lòng nhập đầy đủ thông tin liên hệ");
      return;
    }

    if (!validatePhoneNumber(formData.guestPhone)) {
      alert("Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBooking = () => {
    // Chuyển đến trang payment với thông tin booking
    navigate("/payment", {
      state: {
        booking: {
          field: selectedField
            ? {
                fieldId: selectedField.fieldId,
                facilityId: selectedField.facId,
                facilityName: "SportZone Facility", // placeholder
                fieldName: selectedField.fieldName,
                categoryId: selectedField.categoryId,
                categoryName: selectedField.categoryName,
                image: "/api/placeholder/400/300", // placeholder
                openTime: "05:30:00",
                closeTime: "22:30:00",
                description: selectedField.description,
                isBookingEnable: selectedField.isBookingEnable,
                facilityAddress: selectedField.facilityAddress,
                pricing: [], // placeholder pricing array
              }
            : null,
          slots: selectedSlots,
          guestInfo: {
            name: formData.guestName,
            phone: formData.guestPhone,
            notes: formData.notes,
          },
          services: formData.selectedServices
            .map((id) => facilityServices.find((s) => s.serviceId === id))
            .filter(Boolean),
          totalPrice: calculateTotalPrice(),
          date: selectedDate,
        },
      },
    });
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const renderTimeSlots = () => {
    // Tạo mảng thời gian từ 5:00 đến 24:00 (30 phút mỗi slot)
    const timeSlots: { time: string; hour: number; minute: number }[] = [];
    for (let hour = 5; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push({
          time: `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`,
          hour,
          minute,
        });
      }
    }

    // Lấy tất cả sân để hiển thị - sử dụng tất cả fields vì chưa có thông tin facility group
    const fieldsToShow = fields;

    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        {/* Header với các legend */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Đặt lịch ngày nhanh gọn</h3>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span>Còn trống</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-700 rounded"></div>
              <span>Đang chọn</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Đã đặt</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Bị khóa</span>
            </div>
          </div>
        </div>

        {/* Date selector */}
        <div className="mb-4 flex items-center">
          <span className="text-sm font-medium mr-4">Ngày:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            title="Chọn ngày"
            aria-label="Chọn ngày"
          />
        </div>

        {/* Time slots grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            {/* Time headers */}
            <div className="grid grid-cols-[120px_repeat(38,minmax(40px,1fr))] gap-px bg-gray-200 mb-px">
              <div className="bg-green-700 text-white text-xs font-medium p-2 flex items-center">
                Sân bóng đá
              </div>
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-green-700 text-white text-xs font-medium p-1 text-center"
                >
                  {slot.time}
                </div>
              ))}
            </div>

            {/* Field rows */}
            {fieldsToShow.map((field, fieldIndex) => (
              <div
                key={field.fieldId}
                className="grid grid-cols-[120px_repeat(38,minmax(40px,1fr))] gap-px bg-gray-200 mb-px"
              >
                <div className="bg-gray-100 text-xs font-medium p-2 flex items-center">
                  Sân {fieldIndex + 1}
                </div>
                {timeSlots.map((timeSlot, slotIndex) => {
                  // Tìm slot tương ứng trong dữ liệu
                  const slot = availableSlots.find(
                    (s) =>
                      s.fieldId === field.fieldId &&
                      s.startTime === timeSlot.time
                  );

                  const isSelected = selectedSlots.some(
                    (s) =>
                      s.fieldId === field.fieldId &&
                      s.startTime === timeSlot.time
                  );

                  // Xác định trạng thái và màu sắc
                  let bgColor = "bg-gray-100"; // Mặc định - không có lịch
                  let textColor = "text-gray-500";
                  let isClickable = false;

                  if (slot) {
                    if (isSelected) {
                      bgColor = "bg-green-700"; // Đang chọn - màu đậm hơn
                      textColor = "text-white";
                      isClickable = true;
                    } else if (slot.status === "Available") {
                      bgColor = "bg-green-400"; // Còn trống
                      textColor = "text-white";
                      isClickable = true;
                    } else if (slot.status === "Booked") {
                      bgColor = "bg-red-500"; // Đã đặt
                      textColor = "text-white";
                      isClickable = false;
                    } else if (slot.status === "Blocked") {
                      bgColor = "bg-gray-400"; // Bị khóa
                      textColor = "text-white";
                      isClickable = false;
                    }
                  }

                  return (
                    <button
                      key={slotIndex}
                      onClick={() =>
                        slot && isClickable ? handleSlotClick(slot) : undefined
                      }
                      disabled={!isClickable}
                      className={`
                        ${bgColor} ${textColor} h-8 text-xs font-medium transition-colors
                        ${
                          isClickable
                            ? "hover:opacity-80 cursor-pointer"
                            : "cursor-not-allowed"
                        }
                      `}
                      title={
                        slot
                          ? `${timeSlot.time} - ${slot.status}`
                          : `${timeSlot.time} - Không có lịch`
                      }
                      aria-label={`Khung giờ ${timeSlot.time} cho ${field.fieldName}`}
                    >
                      {/* Hiển thị nội dung nếu cần */}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Total price display */}
        {selectedSlots.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="bg-green-600 text-white px-4 py-2 rounded font-medium">
              Tổng tiền: {calculateTotalPrice().toLocaleString()} VND
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Đang tải dữ liệu...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-600 text-lg">{error}</div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đặt lịch ngày nhanh gọn
              </h1>
              <p className="text-gray-600">
                Chọn sân, thời gian và hoàn tất đặt sân chỉ trong vài bước
              </p>
            </div>

            <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main booking area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Field information */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">
                    {state?.field ? "Thông tin sân đã chọn" : "Chọn sân"}
                  </h3>

                  {state?.field ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 rounded-lg bg-green-200 flex items-center justify-center">
                            <span className="text-green-700 font-bold text-lg">
                              ⚽
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-green-800 mb-2">
                              {state.field.fieldName}
                            </h4>
                            <p className="text-green-700 mb-1">
                              {state.field.facilityAddress}
                            </p>
                            <p className="text-green-600 text-sm mb-1">
                              05:30 - 22:30 (Giờ mặc định)
                            </p>
                            <p className="text-green-600 text-sm">
                              {state.field.description ||
                                "Sân 7 người, thoáng, sát khu học viện."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Hiển thị dropdown selector như cũ khi không có state
                    <>
                      <select
                        title="Chọn sân"
                        value={selectedField?.fieldId || ""}
                        onChange={(e) =>
                          handleFieldChange(parseInt(e.target.value))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {fields.map((field) => (
                          <option key={field.fieldId} value={field.fieldId}>
                            {field.fieldName} ({field.categoryName})
                          </option>
                        ))}
                      </select>

                      {selectedField && (
                        <div className="mt-4 flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-lg bg-green-200 flex items-center justify-center">
                            <span className="text-green-700 font-bold">⚽</span>
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {selectedField.fieldName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {selectedField.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedField.facilityAddress}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Date selector */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Chọn ngày</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {next7Days.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => handleDateChange(day.date)}
                        className={`
                      p-3 rounded-lg text-center transition-colors
                      ${
                        selectedDate === day.date
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-green-100"
                      }
                    `}
                      >
                        <div className="text-xs font-medium">{day.dayName}</div>
                        <div className="text-lg font-bold">{day.dayNumber}</div>
                        <div className="text-xs">Th{day.month}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                {renderTimeSlots()}

                {/* Services */}
                {facilityServices.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Dịch vụ thêm</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilityServices.map((service) => (
                        <label
                          key={service.serviceId}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(
                              service.serviceId
                            )}
                            onChange={() =>
                              handleServiceToggle(service.serviceId)
                            }
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {service.serviceName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {service.description}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              {service.price.toLocaleString()}đ
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking form sidebar */}
              <div className="space-y-6">
                {/* Guest info */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.guestName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            guestName: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Nhập họ tên"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.guestPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                          phoneError ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Nhập 10 số điện thoại (VD: 0901234567)"
                      />
                      {phoneError && (
                        <p className="mt-1 text-sm text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                        placeholder="Ghi chú thêm (tùy chọn)"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking summary */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">
                    Tóm tắt đặt sân
                  </h3>

                  {selectedField && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sân:</span>
                        <span className="font-medium">
                          {selectedField.fieldName}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày:</span>
                        <span className="font-medium">
                          {selectedDate &&
                            new Date(selectedDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">
                          {formData.startTime && formData.endTime
                            ? `${formData.startTime} - ${formData.endTime}`
                            : "Chưa chọn"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Thời lượng:</span>
                        <span className="font-medium">
                          {selectedSlots.length} giờ
                        </span>
                      </div>

                      <hr className="my-3" />

                      <div className="flex justify-between text-lg font-bold text-green-600">
                        <span>Tổng tiền:</span>
                        <span>{calculateTotalPrice().toLocaleString()}đ</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      selectedSlots.length === 0 ||
                      !formData.guestName ||
                      !formData.guestPhone ||
                      phoneError !== "" ||
                      !validatePhoneNumber(formData.guestPhone)
                    }
                    className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            </form>

            {/* Booking Confirm Modal */}
            <BookingConfirmModal
              isOpen={showConfirmModal}
              onClose={handleCloseModal}
              onConfirm={handleConfirmBooking}
              booking={{
                field: selectedField
                  ? {
                      fieldId: selectedField.fieldId,
                      facilityId: selectedField.facId,
                      facilityName: "SportZone Facility", // placeholder
                      fieldName: selectedField.fieldName,
                      categoryId: selectedField.categoryId,
                      categoryName: selectedField.categoryName,
                      image: "/api/placeholder/400/300", // placeholder
                      openTime: "05:30:00",
                      closeTime: "22:30:00",
                      description: selectedField.description,
                      isBookingEnable: selectedField.isBookingEnable,
                      facilityAddress: selectedField.facilityAddress,
                      pricing: [], // placeholder pricing array
                    }
                  : null,
                slots: selectedSlots,
                guestInfo: {
                  name: formData.guestName,
                  phone: formData.guestPhone,
                  notes: formData.notes,
                },
                services: formData.selectedServices
                  .map((id) => facilityServices.find((s) => s.serviceId === id))
                  .filter(Boolean) as Service[],
                totalPrice: calculateTotalPrice(),
                date: selectedDate,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
