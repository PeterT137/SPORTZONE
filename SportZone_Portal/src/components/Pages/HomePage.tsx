import {
    FaBolt,
    FaListAlt,
    FaMapMarkerAlt,
    FaMobileAlt,
    FaSearchLocation,
    FaShieldAlt,
    FaStar,
    FaSyncAlt
} from "react-icons/fa";
import Header from "../Header";

const HomePage = () => {
    const feedbacks = [
        {
            name: "Nam, Quận 7",
            comment: "Dễ sử dụng và rất nhanh gọn, tôi đặt sân bóng mỗi tuần qua đây!",
            rating: 5
        },
        {
            name: "Linh, Bình Thạnh",
            comment: "Tôi rất thích tính năng lọc sân theo giờ. Không còn phải gọi hỏi từng sân nữa!",
            rating: 4
        }
    ];

    const demoFields = [
        {
            id: 1,
            name: "Sân Bóng Cỏ Nhân Tạo A1",
            location: "Quận 1, TP.HCM",
            image: "https://images.unsplash.com/photo-1524015368236-cf67f6b5d65c"
        },
        {
            id: 2,
            name: "Sân 5 Người Tân Bình",
            location: "Tân Bình, TP.HCM",
            image: "https://images.unsplash.com/photo-1551958219-acbc608c6377"
        },
        {
            id: 3,
            name: "Sân Cầu Lông Family",
            location: "Quận 10, TP.HCM",
            image: "https://images.unsplash.com/photo-1534889156217-d643df14f14a"
        }
    ];

    return (
        <div className="font-inter bg-white text-[#1a1a1a] min-h-screen">
            <Header />

            {/* Hero Section */}
            <section className="relative bg-[#1ec391] text-white py-24 px-6 text-center overflow-hidden">
                <div className="max-w-4xl mx-auto z-10 relative animate-fadeInDown">
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Đặt Sân Nhanh - Dễ Dàng - Uy Tín
                    </h1>
                    <p className="text-xl mb-6">
                        Nền tảng hàng đầu giúp bạn đặt sân thể thao chỉ trong vài cú click.
                    </p>
                    <button className="bg-white text-[#1ec391] font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition">
                        Đặt sân ngay
                    </button>
                </div>
            </section>

            {/* Demo Field Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center">Các sân nổi bật</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {demoFields.map(field => (
                            <div key={field.id} className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
                                <img src={field.image} alt={field.name} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="text-xl font-semibold mb-1">{field.name}</h3>
                                    <p className="text-gray-600 text-sm mb-2">
                                        <FaMapMarkerAlt className="inline mr-1" /> {field.location}
                                    </p>
                                    {/* Bỏ phần hiển thị giá */}
                                    {/* <p className="font-semibold text-[#1ec391]">Giá: {field.price.toLocaleString()}đ/giờ</p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-6 bg-white animate-fadeInUp">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Tại sao nên chọn chúng tôi?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <FaMobileAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "Giao diện thân thiện",
                                desc: "Dễ sử dụng cho mọi lứa tuổi, từ học sinh đến người lớn tuổi."
                            },
                            {
                                icon: <FaBolt size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "Đặt sân chỉ vài giây",
                                desc: "Chọn sân, chọn giờ, xác nhận – cực kỳ nhanh chóng và tiện lợi."
                            },
                            {
                                icon: <FaListAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "Nhiều lựa chọn sân",
                                desc: "Hàng trăm sân bóng, cầu lông, tennis… tại mọi quận huyện."
                            },
                            {
                                icon: <FaShieldAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "An toàn thông tin",
                                desc: "Chúng tôi cam kết bảo mật thông tin người dùng và thanh toán."
                            },
                            {
                                icon: <FaSearchLocation size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "Tìm sân gần bạn",
                                desc: "Dựa trên vị trí hiện tại, hệ thống gợi ý sân phù hợp nhất."
                            },
                            {
                                icon: <FaSyncAlt size={32} className="text-[#1ec391] mx-auto mb-4" />,
                                title: "Linh hoạt & tiện lợi",
                                desc: "Cho phép thay đổi lịch, hủy sân dễ dàng – không ràng buộc."
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition text-center"
                            >
                                {item.icon}
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feedback Section */}
            <section className="py-20 px-6 bg-[#f8fafc]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Phản hồi từ người dùng</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {feedbacks.map((fb, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow text-left">
                                <p className="italic text-gray-700">"{fb.comment}"</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="font-semibold text-[#1a3c34]">– {fb.name}</span>
                                    <div className="text-yellow-400 flex">
                                        {[...Array(fb.rating)].map((_, i) => <FaStar key={i} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1ec391] text-white text-center py-6">
                <p>&copy; {new Date().getFullYear()} Sân Online. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
