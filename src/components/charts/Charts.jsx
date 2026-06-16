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
        color: '#111111',
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: '#111111',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
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
        },
        ticks: {
          color: '#111111'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#fff7c2'
        },
        ticks: {
          color: '#111111'
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
        },
        ticks: {
          color: '#111111'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#fff7c2'
        },
        ticks: {
          color: '#111111'
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
  primary: ['#111111', '#facc15', '#fde047', '#fef08a', '#ffffff'],
  success: ['#111111', '#facc15', '#fde047', '#fef08a', '#ffffff'],
  info: ['#111111', '#facc15', '#fde047', '#fef08a', '#ffffff'],
  warning: ['#111111', '#facc15', '#fde047', '#fef08a', '#ffffff'],
  mixed: ['#111111', '#facc15', '#fde047', '#fef08a', '#ffffff', '#facc15', '#fde047']
};
