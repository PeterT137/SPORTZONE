/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface RegulationSystem {
  regulationSystemId: number;
  title: string;
  description: string;
  status: string;
  createAt: string;
  updateAt: string;
}

const FeedbackSection = () => {
  const [regulations, setRegulations] = useState<RegulationSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegulations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://localhost:7057/api/RegulationSystem"
        );
        if (!response.ok) throw new Error("Không thể lấy quy định hệ thống");
        const data = await response.json();
        const slicedData = Array.isArray(data) ? data.slice(0, 2) : [];
        setRegulations(slicedData);
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    fetchRegulations();
  }, []);

  return (
    <section className="py-20 px-6 bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Quy định hệ thống</h2>
        {loading ? (
          <div className="text-gray-500">Đang tải quy định...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : regulations.length === 0 ? (
          <div className="text-gray-500">Không có quy định nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regulations.map((reg) => (
              <div
                key={reg.regulationSystemId}
                className="bg-white rounded-lg shadow p-6 text-left"
              >
                <h3 className="text-xl font-semibold mb-2 text-green-700">
                  {reg.title}
                </h3>
                <p className="text-gray-700 mb-2">{reg.description}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs ${
                    reg.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {reg.status === "active" ? "Đang áp dụng" : "Không áp dụng"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeedbackSection;
