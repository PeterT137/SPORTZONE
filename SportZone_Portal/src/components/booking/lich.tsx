"use client"

import { addHours, addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import React, { useMemo, useState } from "react"
import Sidebar from "../../Sidebar"
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiSearch,
  FiX,
  FiPlus,
  FiMinus,
  FiTrash2,
} from "react-icons/fi"

interface Booking {
  id: number
  customerName: string
  date: Date
  duration: number
  field: string
  status: "confirmed" | "pending" | "cancelled"
  contact: string
  basePrice: number
}

interface Service {
  id: number
  name: string
  price: number
  quantity: number
  icon: string
  unit: string
}

interface BookingService extends Service {
  bookingId: number
}

const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = []
  const statuses: ("confirmed" | "pending" | "cancelled")[] = ["confirmed", "pending", "cancelled"]
  const sportFields: string[] = ["Sân bóng đá 1", "Sân bóng đá 2", "Sân Pickleball", "Sân Tennis"]
  const currentDate = new Date()

  for (let i = 0; i < 20; i++) {
    const randomDay = Math.floor(Math.random() * 7)
    const randomHour = Math.floor(Math.random() * 12) + 8
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomField = sportFields[Math.floor(Math.random() * sportFields.length)]

    bookings.push({
      id: i + 1,
      customerName: `Khách hàng ${i + 1}`,
      date: addHours(addWeeks(currentDate, 0), randomDay * 24 + randomHour),
      duration: 1,
      field: randomField,
      status: randomStatus,
      contact: `0${Math.floor(Math.random() * 900000000) + 100000000}`,
      basePrice: 200000,
    })
  }
  return bookings
}

const availableServices: Service[] = [
  { id: 1, name: "Cho thuê áo đấu", price: 30000, quantity: 1, icon: "👕", unit: "bộ" },
  { id: 2, name: "Cho thuê giày đá bóng", price: 50000, quantity: 1, icon: "👟", unit: "đôi" },
  { id: 3, name: "Nước uống", price: 15000, quantity: 1, icon: "🥤", unit: "chai" },
  { id: 4, name: "Khăn lau mồ hôi", price: 10000, quantity: 1, icon: "🏃‍♂️", unit: "chiếc" },
  { id: 5, name: "Cho thuê bóng đá", price: 25000, quantity: 1, icon: "⚽", unit: "quả" },
  { id: 6, name: "Băng bảo vệ", price: 20000, quantity: 1, icon: "🩹", unit: "bộ" },
  { id: 7, name: "Nước tăng lực", price: 25000, quantity: 1, icon: "⚡", unit: "chai" },
  { id: 8, name: "Cho thuê tất đá bóng", price: 15000, quantity: 1, icon: "🧦", unit: "đôi" },
  { id: 9, name: "Găng tay thủ môn", price: 40000, quantity: 1, icon: "🧤", unit: "đôi" },
  { id: 10, name: "Nước suối", price: 10000, quantity: 1, icon: "💧", unit: "chai" },
]

const BookingCell: React.FC<{ booking: Booking; onClick: (booking: Booking) => void }> = ({ booking, onClick }) => {
  const statusColors = {
    confirmed: "bg-green-100 border-green-400 text-green-800 hover:bg-green-200",
    pending: "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200",
    cancelled: "bg-red-100 border-red-400 text-red-800 hover:bg-red-200",
  }

  const statusText = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  }

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
  ) : null
}

const BookingDetailsModal: React.FC<{
  booking: Booking | null
  onClose: () => void
  onConfirm: (booking: Booking, services: BookingService[], paymentMethod: string) => void
}> = ({ booking, onClose, onConfirm }) => {
  const [selectedServices, setSelectedServices] = useState<BookingService[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash")
  const [showAddService, setShowAddService] = useState(false)

  const totalServicePrice = selectedServices.reduce((sum, service) => sum + service.price * service.quantity, 0)
  const totalPrice = (booking?.basePrice || 0) + totalServicePrice

  const addService = (service: Service) => {
    const existingService = selectedServices.find((s) => s.id === service.id)
    if (existingService) {
      setSelectedServices(selectedServices.map((s) => (s.id === service.id ? { ...s, quantity: s.quantity + 1 } : s)))
    } else {
      setSelectedServices([...selectedServices, { ...service, bookingId: booking?.id || 0 }])
    }
    setShowAddService(false)
  }

  const updateServiceQuantity = (serviceId: number, change: number) => {
    setSelectedServices(
      selectedServices.map((service) => {
        if (service.id === serviceId) {
          const newQuantity = Math.max(1, service.quantity + change)
          return { ...service, quantity: newQuantity }
        }
        return service
      }),
    )
  }

  const removeService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter((service) => service.id !== serviceId))
  }

  const handleConfirm = () => {
    if (booking) {
      onConfirm(booking, selectedServices, paymentMethod)
      onClose()
    }
  }

  if (!booking) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Chi tiết đặt sân</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Booking Information */}
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

          {/* Payment Method */}
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

          {/* Selected Services */}
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

          {/* Action Buttons */}
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

      {/* Add Service Modal */}
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
  )
}

const WeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSport, setSelectedSport] = useState<"soccer" | "pickleball" | "tennis">("soccer")

  const bookings = useMemo(() => generateMockBookings(), [])

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 6) // 6AM to 5PM

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.field.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedSport === "soccer"
        ? booking.field.toLowerCase().includes("bóng đá")
        : selectedSport === "pickleball"
          ? booking.field.toLowerCase().includes("pickleball")
          : booking.field.toLowerCase().includes("tennis")),
  )

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction))
  }

  const handleBookingConfirm = (booking: Booking, services: BookingService[], paymentMethod: string) => {
    console.log("Đặt sân đã được xác nhận:", { booking, services, paymentMethod })
    alert(
      `Đặt sân thành công! Tổng tiền: ${(booking.basePrice + services.reduce((sum, s) => sum + s.price * s.quantity, 0)).toLocaleString("vi-VN")}đ`,
    )
  }

  return (
    <>
      <Sidebar  />
<div className="min-h-screen flex flex-col bg-gray-50 pl-32 pt-16">
      {/* Sidebar */}
      
      {/* Main Content */}
      <div className="flex-1 ml-[256px] p-4">
        <div className="max-w-7xl w-full space-y-6">
          {/* Sport Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button
              onClick={() => setSelectedSport("soccer")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedSport === "soccer"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ⚽ Sân bóng đá
            </button>
            <button
              onClick={() => setSelectedSport("pickleball")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedSport === "pickleball"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🏓 Sân Pickleball
            </button>
            <button
              onClick={() => setSelectedSport("tennis")}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedSport === "tennis"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🎾 Sân Tennis
            </button>
          </div>

          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigateWeek(-1)} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {format(weekStart, "dd/MM", { locale: vi })} - {format(weekEnd, "dd/MM/yyyy", { locale: vi })}
              </h2>
              <button onClick={() => navigateWeek(1)} className="p-3 rounded-full hover:bg-gray-100 transition-colors">
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
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Xuất dữ liệu">
                <FiDownload className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
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
                      <div className="bg-white rounded text-right pr-4 py-4 font-medium text-gray-600">{hour}:00</div>
                      {daysInWeek.map((day) => (
                        <div key={`${day}-${hour}`} className="bg-white rounded min-h-[80px] p-1">
                          {filteredBookings
                            .filter((booking) => isSameDay(booking.date, day) && booking.date.getHours() === hour)
                            .map((booking) => (
                              <BookingCell key={booking.id} booking={booking} onClick={setSelectedBooking} />
                            ))}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Modal */}
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onConfirm={handleBookingConfirm}
          />
        </div>
      </div>
    </div>
    </>
  )
}

export default WeeklySchedule