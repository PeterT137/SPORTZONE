import React, { useState } from "react";
// import Footer from "../Footer";
import Header from "../Header";

function HomePage() {
    const [filterValues, setFilterValues] = useState({
        type: "",
        price: "",
        status: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
    });

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Filter applied:", filterValues);
        alert("Bộ lọc đã được áp dụng (xem console).");
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFilterValues({ ...filterValues, [name]: value });
    };

    return (
        <div className="font-inter bg-[#f0f4f3] text-[#1a1a1a] min-h-screen flex flex-col">
            <Header />

            <form
                onSubmit={handleFilterSubmit}
                className="bg-white shadow-md px-6 py-4 border-t border-b border-gray-200 flex flex-wrap justify-center gap-4"
            >
                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Loại sân 🏟️</label>
                    <select
                        name="type"
                        value={filterValues.type}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">Chọn loại sân</option>
                        <option value="soccer">Sân bóng đá</option>
                        <option value="pickleball">Sân pickleball</option>
                        <option value="tennis">Sân tennis</option>
                    </select>
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Giá tối đa</label>
                    <input
                        type="number"
                        name="price"
                        value={filterValues.price}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                        placeholder="500000"
                    />
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Trạng thái</label>
                    <select
                        name="status"
                        value={filterValues.status}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="">Tất cả</option>
                        <option value="available">Còn trống</option>
                        <option value="booked">Đã đặt</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Ngày bắt đầu</label>
                    <input
                        type="date"
                        name="startDate"
                        value={filterValues.startDate}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Giờ bắt đầu</label>
                    <input
                        type="time"
                        name="startTime"
                        value={filterValues.startTime}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Ngày kết thúc</label>
                    <input
                        type="date"
                        name="endDate"
                        value={filterValues.endDate}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="flex flex-col w-[160px]">
                    <label className="text-sm font-semibold mb-1">Giờ kết thúc</label>
                    <input
                        type="time"
                        name="endTime"
                        value={filterValues.endTime}
                        onChange={handleInputChange}
                        className="px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#1ebd6f] text-white rounded hover:bg-[#17a55d]"
                    >
                        Lọc sân
                    </button>
                </div>
            </form>

            {/* <main className="flex-grow bg-white shadow-inner p-6 mt-4 mx-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Kết quả lọc sân</h2>
                <div className="text-gray-500 italic">Danh sách sân hiển thị ở đây...</div>
            </main> */}

            {/* <Footer /> */}
        </div>
    );
}

export default HomePage;
