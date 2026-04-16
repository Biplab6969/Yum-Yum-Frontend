import { useState, useEffect } from 'react';
import { 
  FiDownload, 
  FiCalendar, 
  FiDollarSign, 
  FiTrendingUp,
  FiPackage,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import { Loading, StatCard } from '../../components/common';
import { LineChart, BarChart, chartColors } from '../../components/charts';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [profitData, setProfitData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [closingDay, setClosingDay] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [profitRes, salesRes, itemRes, shopRes] = await Promise.all([
        reportAPI.getProfitSummary(dateRange.startDate, dateRange.endDate),
        reportAPI.getSalesChart('monthly'),
        reportAPI.getItemPerformance(dateRange.startDate, dateRange.endDate),
        reportAPI.getShopComparison(dateRange.startDate, dateRange.endDate)
      ]);

      setProfitData(profitRes.data.data);

      // Sales chart
      setSalesData({
        labels: salesRes.data.data.map(d => d._id),
        datasets: [
          {
            label: 'Revenue (₹)',
            data: salesRes.data.data.map(d => d.totalRevenue),
            borderColor: chartColors.primary[0],
            backgroundColor: 'rgba(240, 68, 56, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      });

      // Item chart
      setItemData({
        labels: itemRes.data.data.map(d => d.itemName),
        datasets: [
          {
            label: 'Revenue (₹)',
            data: itemRes.data.data.map(d => d.totalRevenue),
            backgroundColor: chartColors.mixed,
            borderRadius: 8
          }
        ]
      });

      // Shop chart
      setShopData({
        labels: shopRes.data.data.map(d => d.shopName),
        datasets: [
          {
            label: 'Revenue (₹)',
            data: shopRes.data.data.map(d => d.totalRevenue),
            backgroundColor: chartColors.info,
            borderRadius: 8
          }
        ]
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const response = await reportAPI.exportReport(
        dateRange.startDate, 
        dateRange.endDate, 
        type
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${type}_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleCloseDay = async () => {
    if (!window.confirm('Are you sure you want to close today? This will generate the final daily report.')) {
      return;
    }

    setClosingDay(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await reportAPI.closeDay(today);
      toast.success('Day closed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close day');
    } finally {
      setClosingDay(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await reportAPI.backup();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Backup created successfully');
    } catch (error) {
      toast.error('Failed to create backup');
    }
  };

  if (loading) {
    return <Loading text="Loading reports..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Reports & Analytics</h2>
          <p className="text-secondary-500 mt-1">
            View detailed sales reports and analytics
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-secondary-300">
            <FiCalendar className="w-4 h-4 text-secondary-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="border-none focus:ring-0 text-sm"
            />
            <span className="text-secondary-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="border-none focus:ring-0 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('transactions')}
          disabled={exporting}
          className="btn btn-secondary"
        >
          <FiDownload className="w-4 h-4" />
          Export Transactions
        </button>
        <button
          onClick={() => handleExport('summary')}
          disabled={exporting}
          className="btn btn-secondary"
        >
          <FiDownload className="w-4 h-4" />
          Export Summary
        </button>
        <button
          onClick={handleBackup}
          className="btn btn-secondary"
        >
          <FiDownload className="w-4 h-4" />
          Backup Data
        </button>
        <button
          onClick={handleCloseDay}
          disabled={closingDay}
          className="btn btn-primary ml-auto"
        >
          <FiCheckCircle className="w-4 h-4" />
          {closingDay ? 'Closing...' : 'Close Day'}
        </button>
      </div>

      {/* Profit Summary */}
      {profitData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${profitData.totalRevenue.toLocaleString()}`}
            icon={FiDollarSign}
            color="green"
          />
          <StatCard
            title="Total Items Sold"
            value={profitData.totalSold.toLocaleString()}
            icon={FiPackage}
            color="blue"
          />
          <StatCard
            title="Total Waste Value"
            value={`₹${profitData.wasteValue.toLocaleString()}`}
            icon={FiAlertTriangle}
            color="red"
          />
          <StatCard
            title="Net Revenue"
            value={`₹${profitData.netRevenue.toLocaleString()}`}
            icon={FiTrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Revenue Trend</h3>
          {salesData && <LineChart data={salesData} height={300} />}
        </div>

        {/* Item Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Item Performance</h3>
          {itemData && <BarChart data={itemData} height={300} />}
        </div>
      </div>

      {/* Shop Comparison */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Shop Revenue Comparison</h3>
        {shopData && <BarChart data={shopData} height={300} />}
      </div>
    </div>
  );
};

export default Reports;
