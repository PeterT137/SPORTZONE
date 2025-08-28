import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyRevenueItem {
  period: string;
  revenue: number;
}

interface SimpleBarChartProps {
  data: {
    monthlyRevenue: MonthlyRevenueItem[];
  };
  chartLabel?: string;
  chartTitle?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  chartLabel,
  chartTitle,
}) => {
  if (!data || !data.monthlyRevenue) return null;
  const labels = data.monthlyRevenue.map((item) => item.period);
  const revenues = data.monthlyRevenue.map((item) => item.revenue);

  const chartData = {
    labels,
    datasets: [
      {
        label: chartLabel || "Tổng doanh thu",
        data: revenues,
        // backgroundColor: "#16a34a",
        backgroundColor: "#187ab7ff",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: chartTitle || "Biểu đồ tổng doanh thu",
      },
    },
    scales: {
      x: {
        display: false, // Ẩn hoàn toàn trục X
      },
      y: {
        display: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default SimpleBarChart;
