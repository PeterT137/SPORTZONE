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
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiSearch,
  FiDownload,
} from "react-icons/fi";

// Types
type BookingStatus = "confirmed" | "pending" | "cancelled";

type Booking = {
  id: number;
  customerName: string;
  date: Date;
  duration: number;
  field: string;
  status: BookingStatus;
  contact: string;
};

type BookingCellProps = {
  booking: Booking;
  onClick: (booking: Booking) => void;
};

type BookingDetailsModalProps = {
  booking: Booking | null;
  onClose: () => void;
};

// Mock data
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const statuses: BookingStatus[] = ["confirmed", "pending", "cancelled"];
  const sportFields = [
    "Soccer Field 1",
    "Soccer Field 2",
    "Pickleball Court",
    "Tennis Court",
  ];
  const currentDate = new Date();

  for (let i = 0; i < 20; i++) {
    const randomDay = Math.floor(Math.random() * 7);
    const randomHour = Math.floor(Math.random() * 12) + 8;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomField =
      sportFields[Math.floor(Math.random() * sportFields.length)];

    bookings.push({
      id: i + 1,
      customerName: `Customer ${i + 1}`,
      date: addHours(addWeeks(currentDate, 0), randomDay * 24 + randomHour),
      duration: 1,
      field: randomField,
      status: randomStatus,
      contact: `+1234567${i.toString().padStart(4, "0")}`,
    });
  }
  return bookings;
};

// Booking Cell
const BookingCell: React.FC<BookingCellProps> = React.memo(
  ({ booking, onClick }) => {
    const statusColors: Record<BookingStatus, string> = {
      confirmed: "bg-green-200 border-green-500 text-green-800",
      pending: "bg-yellow-200 border-yellow-500 text-yellow-800",
      cancelled: "bg-red-200 border-red-500 text-red-800",
    };

    return (
      <div
        onClick={() => onClick(booking)}
        className={`p-2 rounded-md border ${statusColors[booking.status]} cursor-pointer transition-all hover:shadow-lg`}
      >
        <p className="font-semibold truncate">{booking.customerName}</p>
        <p className="text-sm truncate">{booking.field}</p>
      </div>
    );
  }
);

// Modal
const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <p>
            <span className="font-semibold">Customer:</span>{" "}
            {booking.customerName}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {format(booking.date, "PPP")}
          </p>
          <p>
            <span className="font-semibold">Time:</span>{" "}
            {format(booking.date, "p")}
          </p>
          <p>
            <span className="font-semibold">Field:</span> {booking.field}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {booking.status}
          </p>
          <p>
            <span className="font-semibold">Contact:</span> {booking.contact}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Component
const WeeklySchedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSchedule, setActiveSchedule] = useState<"morning" | "afternoon">(
    "morning"
  );
  const [selectedSport, setSelectedSport] = useState<
    "soccer" | "pickleball" | "tennis"
  >("soccer");

  const bookings = useMemo(() => generateMockBookings(), []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const morningSlots = Array.from({ length: 5 }, (_, i) => i + 8);
  const afternoonSlots = Array.from({ length: 5 }, (_, i) => i + 13);

  const filteredBookings = bookings.filter(
    (booking) =>
      (booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.field.toLowerCase().includes(searchTerm.toLowerCase())) &&
      booking.field.toLowerCase().includes(selectedSport)
  );

  const navigateWeek = (direction: number) => {
    setCurrentDate((prev) => addWeeks(prev, direction));
  };

  const renderTimeSlots = (timeSlots: number[], label: string) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      <div className="grid grid-cols-8 gap-2">
        <div className="sticky left-0 bg-white z-10"></div>
        {daysInWeek.map((day) => (
          <div key={day.toISOString()} className="text-center font-semibold py-2">
            {format(day, "EEE")}
            <br />
            {format(day, "d")}
          </div>
        ))}
        {timeSlots.map((hour) => (
          <React.Fragment key={hour}>
            <div className="sticky left-0 bg-white z-10 text-right pr-4 py-2">
              {format(new Date().setHours(hour, 0, 0, 0), "ha")}
            </div>
            {daysInWeek.map((day) => (
              <div
                key={`${day.toISOString()}-${hour}`}
                className="border rounded-md h-20 p-1"
              >
                {filteredBookings
                  .filter(
                    (booking) =>
                      isSameDay(booking.date, day) &&
                      booking.date.getHours() === hour
                  )
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
  );

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Sport type selection */}
      <div className="flex space-x-4 mb-6">
        {(["soccer", "pickleball", "tennis"] as const).map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-4 py-2 rounded-lg ${
              selectedSport === sport ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {sport.charAt(0).toUpperCase() + sport.slice(1)}{" "}
            {sport === "soccer" ? "Fields" : "Courts"}
          </button>
        ))}
      </div>

      {/* Schedule tab */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSchedule("morning")}
          className={`px-4 py-2 rounded-lg ${
            activeSchedule === "morning"
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Morning Schedule (8AM - 12PM)
        </button>
        <button
          onClick={() => setActiveSchedule("afternoon")}
          className={`px-4 py-2 rounded-lg ${
            activeSchedule === "afternoon"
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          Afternoon Schedule (1PM - 5PM)
        </button>
      </div>

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FiCalendar />
            <span>Today</span>
          </button>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiDownload className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[768px]">
          {activeSchedule === "morning"
            ? renderTimeSlots(morningSlots, "Morning Schedule (8AM - 12PM)")
            : renderTimeSlots(afternoonSlots, "Afternoon Schedule (1PM - 5PM)")}
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default WeeklySchedule;
