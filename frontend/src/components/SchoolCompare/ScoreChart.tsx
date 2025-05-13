"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartData,
  ChartOptions,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

interface ScoreChartProps {
  data: { nam: string; diem: number }[];
}

export default function ScoreChart({ data }: ScoreChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ fontSize: "14px", color: "#999" }}>Không có dữ liệu</div>;
  }

  const chartData: ChartData<"bar"> = {
    labels: data.map((d) => d.nam),
    datasets: [
      {
        label: "Điểm",
        data: data.map((d) => d.diem),
        backgroundColor: "#4CAF50",
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      tooltip: {
        enabled: true,
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "start",
        color: "#333",
        font: {
          size: 10,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 30,
        ticks: {
          font: {
            size: 10,
          },
          stepSize: 5,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "180px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
