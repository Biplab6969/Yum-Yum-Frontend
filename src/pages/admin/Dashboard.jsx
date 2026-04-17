import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiShoppingBag,
  FiCalendar
} from 'react-icons/fi';
import { StatCard, Loading } from '../../components/common';
import { LineChart, BarChart, DoughnutChart, chartColors } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { production, loading: dataLoading } = useData();
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
  const stockByItem = today?.stockByItem?.length ? today.stockByItem : production;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* Stock Remaining by Item */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiShoppingBag className="w-5 h-5 text-secondary-600" />
          <h3 className="text-lg font-semibold text-secondary-800">Stock Remaining by Item</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stockByItem.map((item, index) => {
            const remainingStock = item.remainingStock ?? item.currentAvailableStock ?? 0;
            const isLowStock = item.isLowStock ?? false;

            return (
              <div
                key={item.itemId || index}
                className={`p-4 rounded-lg text-center border ${
                  isLowStock ? 'bg-red-50 border-red-100' : 'bg-secondary-50 border-secondary-100'
                }`}
              >
                <p className="text-sm text-secondary-600 truncate">{item.itemName}</p>
                <p className={`text-2xl font-bold mt-1 ${isLowStock ? 'text-red-600' : 'text-secondary-800'}`}>
                  {remainingStock}
                </p>
                <p className="text-xs text-secondary-500 mt-1">items left</p>
              </div>
            );
          })}
        </div>
      </div>

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

    </div>
  );
};

export default AdminDashboard;
