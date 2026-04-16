import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: {
        family: 'Inter',
        size: 13
      },
      bodyFont: {
        family: 'Inter',
        size: 12
      },
      padding: 12,
      cornerRadius: 8
    }
  }
};

// Line Chart Component
export const LineChart = ({ data, options = {}, height = 300 }) => {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9'
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={chartOptions} />
    </div>
  );
};

// Bar Chart Component
export const BarChart = ({ data, options = {}, height = 300 }) => {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9'
        }
      }
    }
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={chartOptions} />
    </div>
  );
};

// Pie Chart Component
export const PieChart = ({ data, options = {}, height = 300 }) => {
  const chartOptions = {
    ...defaultOptions,
    ...options
  };

  return (
    <div style={{ height }}>
      <Pie data={data} options={chartOptions} />
    </div>
  );
};

// Doughnut Chart Component
export const DoughnutChart = ({ data, options = {}, height = 300 }) => {
  const chartOptions = {
    ...defaultOptions,
    ...options,
    cutout: '60%'
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={chartOptions} />
    </div>
  );
};

// Chart color palettes
export const chartColors = {
  primary: ['#f04438', '#f97066', '#fda29b', '#ffccc7', '#fee4e2'],
  success: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  info: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  mixed: ['#f04438', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']
};
