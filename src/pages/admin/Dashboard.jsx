import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiPackage, 
  FiTrendingUp, 
  FiAlertTriangle,
  FiShoppingBag,
  FiCalendar
} from 'react-icons/fi';
import { StatCard, Loading } from '../../components/common';
import { LineChart, BarChart, DoughnutChart, chartColors } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { lowStockAlerts, production, loading: dataLoading } = useData();
  const [dashboardData, setDashboardData] = useState(null);
  const [salesChartData, setSalesChartData] = useState(null);
  const [itemChartData, setItemChartData] = useState(null);
  const [shopChartData, setShopChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('monthly');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchSalesChart();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, itemRes, shopRes] = await Promise.all([
        reportAPI.getDashboard(),
        reportAPI.getItemPerformance(),
        reportAPI.getShopComparison()
      ]);

      setDashboardData(dashboardRes.data.data);

      // Item performance chart data
      const items = itemRes.data.data;
      setItemChartData({
        labels: items.map(i => i.itemName),
        datasets: [{
          data: items.map(i => i.totalRevenue),
          backgroundColor: chartColors.mixed,
          borderWidth: 0
        }]
      });

      // Shop comparison chart data
      const shops = shopRes.data.data;
      setShopChartData({
        labels: shops.map(s => s.shopName),
        datasets: [
          {
            label: 'Revenue (₹)',
            data: shops.map(s => s.totalRevenue),
            backgroundColor: chartColors.primary[0],
            borderRadius: 8
          },
          {
            label: 'Items Sold',
            data: shops.map(s => s.totalSold),
            backgroundColor: chartColors.info[0],
            borderRadius: 8
          }
        ]
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesChart = async () => {
    try {
      const response = await reportAPI.getSalesChart(chartPeriod);
      const data = response.data.data;

      setSalesChartData({
        labels: data.map(d => d._id),
        datasets: [
          {
            label: 'Revenue (₹)',
            data: data.map(d => d.totalRevenue),
            borderColor: chartColors.primary[0],
            backgroundColor: 'rgba(240, 68, 56, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Items Sold',
            data: data.map(d => d.totalSales),
            borderColor: chartColors.info[0],
            backgroundColor: 'transparent',
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error('Failed to fetch sales chart:', error);
    }
  };

  if (loading || dataLoading.production) {
    return <Loading text="Loading dashboard..." />;
  }

  const { today, monthly, yearly } = dashboardData || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`₹${(today?.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="green"
          subtitle={`${today?.totalSales || 0} items sold`}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(monthly?.totalRevenue || 0).toLocaleString()}`}
          icon={FiTrendingUp}
          color="blue"
          subtitle={`${monthly?.totalSales || 0} items sold`}
        />
        <StatCard
          title="Yearly Revenue"
          value={`₹${(yearly?.totalRevenue || 0).toLocaleString()}`}
          icon={FiCalendar}
          color="purple"
          subtitle={`${yearly?.totalSales || 0} items sold`}
        />
        <StatCard
          title="Stock Remaining"
          value={today?.remainingStock || 0}
          icon={FiPackage}
          color="yellow"
          subtitle={`${today?.totalProduction || 0} produced today`}
        />
      </div>

      {/* Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Low Stock Alerts ({lowStockAlerts.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockAlerts.map((alert, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  alert.status === 'OUT_OF_STOCK' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {alert.itemName}: {alert.currentStock} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-800">Sales Trend</h3>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg text-sm"
            >
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
          </div>
          {salesChartData && <LineChart data={salesChartData} height={300} />}
        </div>

        {/* Item Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Item Revenue</h3>
          {itemChartData && <DoughnutChart data={itemChartData} height={300} />}
        </div>
      </div>

      {/* Shop Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Shop Performance Comparison</h3>
        {shopChartData && <BarChart data={shopChartData} height={300} />}
      </div>

      {/* Today's Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Today's Production Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {production.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg text-center ${
                item.isLowStock ? 'bg-red-50' : 'bg-secondary-50'
              }`}
            >
              <p className="text-sm text-secondary-600 truncate">{item.itemName}</p>
              <p className={`text-2xl font-bold mt-1 ${
                item.isLowStock ? 'text-red-600' : 'text-secondary-800'
              }`}>
                {item.currentAvailableStock}
              </p>
              <p className="text-xs text-secondary-500">of {item.productionQuantity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
