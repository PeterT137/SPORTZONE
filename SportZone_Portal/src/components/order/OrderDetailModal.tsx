"use client"

import type { Order, OrderServiceType, Service, User } from "../interface"
import { OrderServiceForm } from "./OrderServiceForm"
import { BookingExtensionForm } from "./BookingExtensionForm"
import { MdDelete, MdPerson, MdPhone, MdCalendarToday, MdCreditCard } from "react-icons/md"

interface OrderDetailModalProps {
  order: Order
  orderServices: OrderServiceType[]
  services: Service[]
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddService: (orderService: Omit<OrderServiceType, "order_service_id">) => void
  onUpdateService: (orderServiceId: string, updates: Partial<OrderServiceType>) => void
  onDeleteService: (orderServiceId: string) => void
  onBookExtension: (orderId: string, hours: number, pricePerHour: number) => void
}

export function OrderDetailModal({
  order,
  orderServices,
  services,
  user,
  open,
  onOpenChange,
  onAddService,
  onUpdateService,
  onDeleteService,
  onBookExtension,
}: OrderDetailModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán"
      case "pending":
        return "Chờ thanh toán"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const canModify = user.role === "admin" || order.status_payment === "pending"

  return (
    <div className={`relative ${open ? "block" : "hidden"}`}>
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40" onClick={() => onOpenChange(false)}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng #{order.order_id}</h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status_payment)}`}>
            {getStatusText(order.status_payment)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <MdPerson className="h-5 w-5" />
                Thông tin khách hàng
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MdPerson className="h-4 w-4 text-gray-500" />
                <span>{order.guest_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdPhone className="h-4 w-4 text-gray-500" />
                <span>{order.guest_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdCalendarToday className="h-4 w-4 text-gray-500" />
                <span>{new Date(order.create_at).toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MdCreditCard className="h-4 w-4 text-gray-500" />
                <span>{order.content_payment}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-4">
              <h3 className="text-lg font-semibold">Tổng quan đơn hàng</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono">{order.booking_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Facility ID:</span>
                <span className="font-mono">{order.fac_id}</span>
              </div>
              <hr className="border-t border-gray-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng tiền:</span>
                <span>{order.total_amount.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm mt-6">
          <div className="p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Dịch vụ đã đặt</h3>
            <div className="flex gap-2">
              {canModify && (
                <>
                  <BookingExtensionForm orderId={order.order_id} onBookExtension={onBookExtension} />
                  <OrderServiceForm orderId={order.order_id} services={services} onSubmit={onAddService} />
                </>
              )}
            </div>
          </div>
          <div className="p-4">
            {orderServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có dịch vụ nào được đặt</p>
            ) : (
              <div className="space-y-4">
                {orderServices.map((orderService) => (
                  <div
                    key={orderService.order_service_id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{orderService.service_name}</h4>
                      <p className="text-sm text-gray-500">{orderService.service_description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Số lượng: {orderService.quantity}</span>
                        <span>Đơn giá: {orderService.price.toLocaleString("vi-VN")}đ</span>
                        <span className="font-medium">
                          Thành tiền: {(orderService.quantity * orderService.price).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                    {canModify && (
                      <div className="flex items-center gap-2">
                        <OrderServiceForm
                          orderService={orderService}
                          orderId={order.order_id}
                          services={services}
                          onSubmit={onAddService}
                          onUpdate={onUpdateService}
                          isEdit={true}
                        />
                        <button
                          className="p-2 text-red-600 hover:text-red-700"
                          onClick={() => onDeleteService(orderService.order_service_id)}
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!canModify && (
          <div className="text-sm text-gray-500 text-center p-4 bg-gray-100 rounded-lg mt-4">
            {user.role === "user" && order.status_payment === "paid"
              ? "Đơn hàng đã được thanh toán, không thể chỉnh sửa"
              : "Bạn không có quyền chỉnh sửa đơn hàng này"}
          </div>
        )}
      </div>
    </div>
  )
}