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

function getGradientColor(value: number, min: number, max: number) {
  if (min === max) {
    return "rgb(139, 195, 74)";
  }

  const percent = (value - min) / (max - min);
  // Xanh lá: nhạt → đậm
  const start = [255, 241, 118]; // vàng nhạt
  const end = [56, 142, 60];     // xanh đậm

  const r = Math.round(start[0] + percent * (end[0] - start[0]));
  const g = Math.round(start[1] + percent * (end[1] - start[1]));
  const b = Math.round(start[2] + percent * (end[2] - start[2]));

  return `rgb(${r}, ${g}, ${b})`;
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const values = data.map((d) => d.diem);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const chartData: ChartData<"bar"> = {
    labels: data.map((d) => d.nam),
    datasets: [
      {
        label: "Điểm",
        data: data.map((d) => d.diem),
        backgroundColor: values.map((v) => getGradientColor(v, min, max)),
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
        align: "end",
        color: "#333",
        font: {
          size: 10,
          weight: "bold",
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
