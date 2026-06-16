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
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.35),_transparent_35%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-300 font-semibold">Operations overview</p>
            <h2 className="text-3xl font-bold mt-2">Dashboard</h2>
            <p className="text-white/75 mt-2 max-w-xl">
              Track revenue, stock, and shop performance from one focused view.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black border border-black rounded-full px-4 py-2 shadow-sm w-fit">
            <FiCalendar className="w-4 h-4" />
            <span className="text-sm font-semibold">Live data</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`₹${(today?.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="yellow"
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
          color="primary"
          subtitle={`${yearly?.totalSales || 0} items sold`}
        />
      </div>

      {/* Stock Remaining by Item */}
      <div className="card border-black/10">
        <div className="flex items-center gap-2 mb-4">
          <FiShoppingBag className="w-5 h-5 text-black" />
          <h3 className="text-lg font-semibold text-black">Stock Remaining by Item</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {stockByItem.map((item, index) => {
            const remainingStock = item.remainingStock ?? item.currentAvailableStock ?? 0;
            const isLowStock = item.isLowStock ?? false;

            return (
              <div
                key={item.itemId || index}
                className={`p-4 rounded-lg text-center border ${
                    isLowStock ? 'bg-yellow-50 border-black' : 'bg-white border-black'
                }`}
              >
                  <p className="text-sm text-black truncate">{item.itemName}</p>
                  <p className="text-2xl font-bold mt-1 text-black">
                  {remainingStock}
                </p>
                  <p className="text-xs text-black/60 mt-1">items left</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card border-black/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Sales Trend</h3>
            <select
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
              className="px-3 py-2 border border-black rounded-lg text-sm bg-white text-black"
            >
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
          </div>
          {salesChartData && <LineChart data={salesChartData} height={300} />}
        </div>

        {/* Item Performance */}
        <div className="card border-black/10">
          <h3 className="text-lg font-semibold text-black mb-4">Item Revenue</h3>
          {itemChartData && <DoughnutChart data={itemChartData} height={300} />}
        </div>
      </div>

      {/* Shop Comparison */}
      <div className="card border-black/10">
        <h3 className="text-lg font-semibold text-black mb-4">Shop Performance Comparison</h3>
        {shopChartData && <BarChart data={shopChartData} height={300} />}
      </div>

    </div>
  );
};

export default AdminDashboard;
