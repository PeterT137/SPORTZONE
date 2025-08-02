import React from "react";
import type {
  DemoField,
  FieldScheduleSlot,
  DemoService,
} from "../../data/demoBookingData";

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: {
    field: DemoField | null;
    slots: FieldScheduleSlot[];
    guestInfo: {
      name: string;
      phone: string;
      notes: string;
    };
    services: DemoService[];
    totalPrice: number;
    date: string;
  };
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeRange = () => {
    if (booking.slots.length === 0) return "";
    const sortedSlots = booking.slots.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    return `${sortedSlots[0].startTime} - ${
      sortedSlots[sortedSlots.length - 1].endTime
    }`;
  };

  const calculateSubtotal = () => {
    return booking.slots.reduce((sum, slot) => sum + slot.price, 0);
  };

  const calculateServicesTotal = () => {
    return booking.services.reduce((sum, service) => sum + service.price, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chi tiết đặt lịch</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Đóng modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Facility and Field Info */}
          {booking.field && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Thông tin sân
              </h3>
              <div className="flex items-start space-x-4">
                <img
                  src={booking.field.image}
                  alt={booking.field.fieldName}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">
                    {booking.field.fieldName}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {booking.field.facilityName}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {booking.field.facilityAddress}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {booking.field.categoryName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Chi tiết đặt lịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ngày đặt
                </label>
                <p className="text-gray-900">{formatDate(booking.date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tổng thời gian
                </label>
                <p className="text-gray-900">{getTimeRange()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Số slot đã chọn
                </label>
                <p className="text-gray-900">
                  {booking.slots.length} slot (30 phút/slot)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Tổng thời lượng
                </label>
                <p className="text-gray-900">
                  {(booking.slots.length * 0.5).toFixed(1)} giờ
                </p>
              </div>
            </div>

            {/* Chi tiết từng slot */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Chi tiết các slot đã chọn
              </label>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {booking.slots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={slot.scheduleId}
                        className="bg-white border border-gray-200 rounded px-3 py-2 text-center"
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {slot.price.toLocaleString()}đ
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Họ tên
                </label>
                <p className="text-gray-900">{booking.guestInfo.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Số điện thoại
                </label>
                <p className="text-gray-900">{booking.guestInfo.phone}</p>
              </div>
              {booking.guestInfo.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ghi chú
                  </label>
                  <p className="text-gray-900">{booking.guestInfo.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {booking.services.length > 0 && (
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Dịch vụ thêm
              </h3>
              <div className="space-y-2">
                {booking.services.map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex justify-between items-center py-2"
                  >
                    <div>
                      <p className="font-medium">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        {service.description}
                      </p>
                    </div>
                    <span className="font-medium text-green-600">
                      {service.price.toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Chi tiết thanh toán
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>
                  Tổng tiền sân ({booking.slots.length} slot × 30 phút)
                </span>
                <span>{calculateSubtotal().toLocaleString()}đ</span>
              </div>

              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <p className="font-bold">Ghi chú:</p>
                <p>• Chưa tính phí dịch vụ mà khách hàng sử dụng tại sân</p>
                <p>• Khách hàng cọc trước 50% tổng tiền sân</p>
              </div>

              {booking.services.length > 0 && (
                <div className="flex justify-between">
                  <span>Dịch vụ thêm</span>
                  <span>{calculateServicesTotal().toLocaleString()}đ</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí dịch vụ hệ thống</span>
                <span>15,000đ</span>
              </div>

              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Tổng cộng</span>
                <span>{(booking.totalPrice + 15000).toLocaleString()}đ</span>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                * Mỗi slot = 30 phút. Tổng thời gian:{" "}
                {(booking.slots.length * 0.5).toFixed(1)} giờ
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Tiếp tục thanh toán cọc
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmModal;
