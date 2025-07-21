/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Calendar, Clock, CreditCard, MapPin, User } from "lucide-react"
import QRCode from "react-qr-code"
import Header from "../Header"

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
}

interface BookingDetails {
  fieldName: string
  date: string
  time: string
  duration: number
  price: number
  location: string
}

interface PaymentFormData {
  customerName: string
  email: string
  phone: string
  paymentMethod: "credit" | "momo" | "banking"
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
}

const PaymentPage: React.FC = () => {
  const location = useLocation()
  const { field, date, time, duration } = (location.state as {
    field: Field
    date: string
    time: string
    duration: number
  }) || {}

  const bookingDetails: BookingDetails = field
    ? {
        fieldName: field.name,
        date: date || new Date().toISOString().split("T")[0],
        time: time || "19:00",
        duration: duration || 60,
        price: field.price,
        location: field.location,
      }
    : {
        fieldName: "Sân bóng đá mini số 1",
        date: new Date().toISOString().split("T")[0],
        time: "19:00",
        duration: 60,
        price: 300000,
        location: "Quận 1, TP.HCM",
      }

  const [formData, setFormData] = useState<PaymentFormData>({
    customerName: "",
    email: "",
    phone: "",
    paymentMethod: "credit",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  useEffect(() => {
    // Tự động lấy thông tin người dùng từ localStorage (sau khi login)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePaymentMethodChange = (method: "credit" | "momo" | "banking") => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: method,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    alert("Thanh toán thành công!")
  }

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)

  const totalPrice = bookingDetails.price + 15000

  const momoQRData = `momo://pay?phone=0123456789&amount=${totalPrice}&note=Dat san ${bookingDetails.fieldName}`
  const vnpayQRData = `https://img.vietqr.io/image/VCB-1234567890-print.png?amount=${totalPrice}&addInfo=Dat san ${bookingDetails.fieldName} ${formData.phone}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl pt-8 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán đặt sân</h1>
          <p className="text-gray-600">Hoàn tất thông tin để xác nhận đặt sân</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Chi tiết đặt sân</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">{bookingDetails.fieldName}</p>
                    <p className="text-sm text-gray-600">{bookingDetails.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(bookingDetails.date).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600">Ngày đặt sân</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingDetails.time} - {bookingDetails.duration} phút
                    </p>
                    <p className="text-sm text-gray-600">Thời gian</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Giá sân:</span>
                  <span className="font-medium">{formatCurrency(bookingDetails.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-medium">{formatCurrency(15000)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
                    placeholder="Họ và tên"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md"
                    placeholder="Số điện thoại"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md col-span-2"
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Phương thức thanh toán
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {["credit", "momo", "banking"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => handlePaymentMethodChange(method as any)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.paymentMethod === method
                          ? method === "momo"
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : method === "banking"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      { method === "momo" ? (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 bg-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                          </div>
                          <p className="font-medium">MoMo</p>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">₫</span>
                          </div>
                          <p className="font-medium">VNPay</p>
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {formData.paymentMethod === "credit" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Tên trên thẻ"
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Số thẻ"
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="MM/YY"
                      />
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="CVV"
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "momo" && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h3 className="font-medium text-pink-800 mb-2">Thanh toán bằng MoMo</h3>
                    <p className="text-sm text-pink-700 mb-3">
                      Quét mã QR dưới đây để thanh toán {formatCurrency(totalPrice)}
                    </p>
                    <div className="flex justify-center">
                      <QRCode value={momoQRData} size={200} />
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "banking" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-800 mb-2">Thanh toán qua VNPay</h3>
                    <p className="text-sm text-green-700 mb-3">
                      Quét mã QR dưới đây để thanh toán {formatCurrency(totalPrice)}
                    </p>
                    <div className="flex justify-center">
                      <img src={vnpayQRData} alt="VNPay QR" className="h-52 w-auto" />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    `Thanh toán ${formatCurrency(totalPrice)}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
