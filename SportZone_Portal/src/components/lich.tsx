"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  addWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addHours,
  isSameDay,
} from "date-fns";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaSearch,
  FaDownload,
  FaUsers,
  FaClock,
  FaMapPin,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaPlus,
} from "react-icons/fa";

// Types
type BookingStatus = "confirmed" | "pending" | "cancelled";
type FieldType = "soccer" | "tennis" | "pickleball" | "basketball";

interface Booking {
  id: number;
  customerName: string;
  date: Date;
  duration: number;
  field: string;
  fieldType: FieldType;
  status: BookingStatus;
  contact: string;
  email: string;
  players: number;
  notes?: string;
  price: number;
}

interface BookingCellProps {
  booking: Booking;
  onClick: (booking: Booking) => void;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
  onClose: () => void;
}

// Mock data generation
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const statuses: BookingStatus[] = ["confirmed", "pending", "cancelled"];
  const sportFields = [
    { name: "Soccer Field A", type: "soccer" as FieldType },
    { name: "Soccer Field B", type: "soccer" as FieldType },
    { name: "Tennis Court 1", type: "tennis" as FieldType },
    { name: "Tennis Court 2", type: "tennis" as FieldType },
    { name: "Pickleball Court", type: "pickleball" as FieldType },
    { name: "Basketball Court", type: "basketball" as FieldType },
  ];

  const names = ["John Smith", "Sarah Johnson", "Mike Wilson", "Emily Davis", "David Brown", "Lisa Garcia"];
  const currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const randomDay = Math.floor(Math.random() * 7);
    const randomHour = Math.floor(Math.random() * 17) + 7; // 7AM to 12AM
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomField = sportFields[Math.floor(Math.random() * sportFields.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];

    bookings.push({
      id: i + 1,
      customerName: randomName,
      date: addHours(addWeeks(currentDate, 0), randomDay * 24 + randomHour),
      duration: Math.random() > 0.5 ? 1 : 2,
      field: randomField.name,
      fieldType: randomField.type,
      status: randomStatus,
      contact: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${randomName.toLowerCase().replace(" ", ".")}@email.com`,
      players: Math.floor(Math.random() * 10) + 2,
      price: Math.floor(Math.random() * 100) + 50,
      notes: Math.random() > 0.7 ? "Special equipment needed" : undefined,
    });
  }

  return bookings;
};

// Booking cell component
const BookingCell: React.FC<BookingCellProps> = React.memo(({ booking, onClick }) => {
  const statusConfig = {
    confirmed: {
      className: "bg-green-100 border-green-400 text-green-800 hover:bg-green-200",
      icon: FaCheckCircle,
    },
    pending: {
      className: "bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200",
      icon: FaExclamationCircle,
    },
    cancelled: {
      className: "bg-red-100 border-red-400 text-red-800 hover:bg-red-200",
      icon: FaTimesCircle,
    },
  };

  const config = statusConfig[booking.status];
  const StatusIcon = config.icon;

  return (
    <div
      onClick={() => onClick(booking)}
      className={`p-2 rounded-lg border-2 text-xs cursor-pointer transition-all duration-200 ${config.className} shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold truncate flex-1">{booking.customerName}</p>
        <StatusIcon className="w-3 h-3 ml-1" />
      </div>
      <p className="text-xs opacity-75 truncate">{booking.field}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="flex items-center">
          <FaUsers className="w-3 h-3 mr-1" />
          {booking.players}
        </span>
        <span className="flex items-center">
          <FaClock className="w-3 h-3 mr-1" />
          {booking.duration}h
        </span>
      </div>
    </div>
  );
});

// Booking details modal
const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  if (!booking) return null;

  const statusConfig = {
    confirmed: { color: "text-green-600", bg: "bg-green-100", icon: FaCheckCircle },
    pending: { color: "text-yellow-600", bg: "bg-yellow-100", icon: FaExclamationCircle },
    cancelled: { color: "text-red-600", bg: "bg-red-100", icon: FaTimesCircle },
  };

  const config = statusConfig[booking.status];
  const StatusIcon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-4">
          <FaMapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Booking Details</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{booking.customerName}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bg} ${config.color}`}>
              <StatusIcon className="w-3 h-3" />
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{format(booking.date, "PPP")}</p>
                  <p className="text-gray-500">{format(booking.date, "p")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FaMapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{booking.field}</p>
                  <p className="text-gray-500 capitalize">{booking.fieldType}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaClock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">
                    {booking.duration} hour{booking.duration > 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-500">Duration</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FaUsers className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-semibold">{booking.players} players</p>
                  <p className="text-gray-500">Expected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{booking.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{booking.email}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700">Notes:</p>
              <p className="text-sm text-gray-600">{booking.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-lg font-bold text-green-600">${booking.price}</span>
            <span className="text-sm text-gray-500">Total Amount</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <FaEdit className="w-4 h-4" />
            Edit
          </button>
          {booking.status !== "cancelled" && (
            <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2">
              <FaTrashAlt className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component
const SportsBookingSchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const bookings = useMemo(() => generateMockBookings(), []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Business hours (7 AM to 12 AM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 7); // 7 to 24

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = fieldFilter === "all" || booking.fieldType === fieldFilter;
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesField && matchesStatus;
  });

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  // Calculate statistics
  const weekBookings = filteredBookings.filter(
    (booking) => booking.date >= weekStart && booking.date <= weekEnd
  );

  const stats = {
    total: weekBookings.length,
    confirmed: weekBookings.filter((b) => b.status === "confirmed").length,
    pending: weekBookings.filter((b) => b.status === "pending").length,
    cancelled: weekBookings.filter((b) => b.status === "cancelled").length,
    revenue: weekBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.price, 0),
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sports Field Booking</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </h2>
              <button
                onClick={() => navigateWeek(1)}
                className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FaCalendarAlt className="w-4 h-4" />
                Today
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Fields</option>
              <option value="soccer">Soccer</option>
              <option value="tennis">Tennis</option>
              <option value="pickleball">Pickleball</option>
              <option value="basketball">Basketball</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              <FaDownload className="w-4 h-4" />
            </button>

            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FaCalendarAlt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaExclamationCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <FaTimesCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.revenue}</p>
            </div>
            <div className="text-green-500 text-2xl font-bold">$</div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaClock className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-semibold text-center py-2">Time</div>
                {daysInWeek.map((day) => (
                  <div key={day.toString()} className="text-center font-semibold py-2 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">{format(day, "EEE")}</div>
                    <div className="text-lg">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {timeSlots.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="text-center py-3 font-medium text-gray-600 bg-gray-50 rounded-lg">
                    {format(new Date().setHours(hour, 0), "h:mm a")}
                  </div>
                  {daysInWeek.map((day) => (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="min-h-[80px] p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      {filteredBookings
                        .filter((booking) => isSameDay(booking.date, day) && booking.date.getHours() === hour)
                        .map((booking) => (
                          <BookingCell key={booking.id} booking={booking} onClick={setSelectedBooking} />
                        ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
    </div>
  );
};

export default SportsBookingSchedule;