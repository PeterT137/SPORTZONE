import React from "react";
import SimpleBarChart from "./SimpleBarChart";

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type RevenueChartProps = {
  monthlyRevenue: MonthlyRevenue[];
  filterMode: "month" | "year";
  loading: boolean;
  error?: string;
};

const RevenueChart: React.FC<RevenueChartProps> = ({
  monthlyRevenue,
  filterMode,
  loading,
  error,
}) => {
  if (loading) return <div>Đang tải biểu đồ...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  if (!monthlyRevenue || monthlyRevenue.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        (Không có dữ liệu doanh thu để hiển thị)
      </div>
    );
  }

  const chartLabel =
    filterMode === "year" ? "Doanh thu theo năm" : "Tổng doanh thu";
  const chartTitle =
    filterMode === "year"
      ? "Biểu đồ doanh thu theo năm"
      : "Biểu đồ tổng doanh thu";

  return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-full max-w-[600px]">
        <SimpleBarChart
          // Chuyển đổi dữ liệu cho SimpleBarChart
          data={{
            monthlyRevenue: monthlyRevenue.map(({ month, revenue }) => ({
              period: month,
              revenue,
            })),
          }}
          chartLabel={chartLabel}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default RevenueChart;
