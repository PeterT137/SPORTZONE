import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../Sidebar";
import RevenueSummary from "../components/finance/RevenueSummary";
import RevenueFilter from "../components/finance/RevenueFilter";
import RevenueChart from "../components/finance/RevenueChart";

type MonthlyRevenueItem = {
  month?: string;
  period?: string;
  revenue: number;
};

type RevenueData = {
  ownerId?: number | string;
  ownerName?: string;
  totalRevenue?: number;
  totalFieldRevenue?: number;
  totalServiceRevenue?: number;
  totalOrders?: number;
  facilities?: FacilityType[];
  monthlyRevenue: MonthlyRevenueItem[];
  yearlyRevenue?: MonthlyRevenueItem[];
};

type FilterType = {
  ownerId: string;
  startDate: string;
  endDate: string;
  facilityId: string;
  month?: string;
  year?: string;
};

type FacilityType = {
  facId?: string | number;
  name?: string;
  userId?: string | number;
  [key: string]: string | number | undefined;
};

const FinanceManager: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [filter, setFilter] = useState<FilterType>({
    ownerId: String(user.UId || ""),
    startDate: "",
    endDate: "",
    facilityId: "",
    month: "",
    year: "",
  });
  const [facilities, setFacilities] = useState<FacilityType[]>([]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await fetch(
        "https://localhost:7057/api/Facility/with-details",
        {
          method: "GET",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        }
      );
      const data = await res.json();
      setFacilities(data);
    } catch {
      setFacilities([]);
    }
  };

  const fetchTotalRevenue = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `https://localhost:7057/api/Order/Owner/${filter.ownerId}/TotalRevenue`;
      const params = new URLSearchParams();
      if (filter.startDate) params.append("startDate", filter.startDate);
      if (filter.endDate) params.append("endDate", filter.endDate);
      if (filter.facilityId) params.append("facilityId", filter.facilityId);

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRevenueData(data.data || { monthlyRevenue: [] });
      } else {
        setError(data.message || "Lỗi lấy dữ liệu");
        setRevenueData(null);
      }
    } catch {
      setError("Lỗi kết nối server");
      setRevenueData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchTotalRevenue();
  }, [filter, getAuthHeaders]);

  const handleFilterChange = (newFilter: Partial<FilterType>) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFilter((prev) => ({
      ...prev,
      ...newFilter,
      ownerId: String(user.UId || ""),
    }));
  };

  const filterMode = filter.year ? "year" : "month";
  let chartDisplayData: { month: string; revenue: number }[] = [];

  if (revenueData) {
    const sourceData =
      filterMode === "year"
        ? revenueData.yearlyRevenue
        : revenueData.monthlyRevenue;

    if (Array.isArray(sourceData)) {
      chartDisplayData = sourceData.map((item) => ({
        month: String(item.month || item.period || ""),
        revenue: item.revenue,
      }));
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-60 fixed h-full z-20 shadow-lg">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col ml-60">
        <main className="flex-1 flex flex-col items-center justify-start py-10 px-8">
          <div className="w-full max-w-7xl">
            <h1 className="text-3xl font-extrabold mb-8 text-green-800 text-left">
              Thống kê doanh thu
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-3 flex flex-col gap-6">
                <RevenueSummary
                  data={revenueData ?? undefined}
                  loading={loading}
                  error={error}
                />
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                  <RevenueChart
                    monthlyRevenue={chartDisplayData}
                    filterMode={filterMode}
                    loading={loading}
                    error={error}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceManager;
