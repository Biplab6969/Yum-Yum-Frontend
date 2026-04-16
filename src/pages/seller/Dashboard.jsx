import { useState, useEffect } from 'react';
import { FiDollarSign, FiPackage, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';
import { StatCard, Loading } from '../../components/common';
import { LineChart, BarChart, chartColors } from '../../components/charts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { transactionAPI, reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { shopId, user } = useAuth();
  const { production, loading: dataLoading } = useData();
  const [todayData, setTodayData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [transRes, summaryRes] = await Promise.all([
        transactionAPI.getShopTransactions(shopId, today),
        transactionAPI.getShopItemTransactions(
          shopId,
          new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
          today
        )
      ]);

      setTodayData({
        transactions: transRes.data.data,
        totals: transRes.data.totals
      });

      // Create chart data from summary
      const items = summaryRes.data.data;
      if (items.length > 0) {
        setSalesData({
          labels: items.map(i => i.itemName),
          datasets: [{
            label: 'Items Sold',
            data: items.map(i => i.totalSold),
            backgroundColor: chartColors.mixed,
            borderRadius: 8
          }]
        });
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || dataLoading.production) {
    return <Loading text="Loading dashboard..." />;
  }

  const shopName = user?.shopId?.name || `Shop ${user?.shopId?.shopNumber}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome, {user?.name}!</h2>
        <p className="text-primary-100 mt-1">
          {shopName} • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Items Taken Today"
          value={todayData?.totals?.totalTaken || 0}
          icon={FiPackage}
          color="blue"
        />
        <StatCard
          title="Items Sold Today"
          value={todayData?.totals?.totalSold || 0}
          icon={FiShoppingBag}
          color="green"
        />
        <StatCard
          title="Items Returned"
          value={todayData?.totals?.totalReturned || 0}
          icon={FiPackage}
          color="yellow"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${(todayData?.totals?.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          color="purple"
        />
      </div>

      {/* Central Stock Available */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">
          Central Stock Available Today
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {production.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg text-center ${
                item.isLowStock ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              <p className="text-sm text-secondary-600 truncate" title={item.itemName}>
                {item.itemName}
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                item.isLowStock ? 'text-red-600' : 'text-green-600'
              }`}>
                {item.currentAvailableStock}
              </p>
              <p className="text-xs text-secondary-500">available</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      {todayData?.transactions && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">
            Today's Item Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Item</th>
                  <th className="table-header text-center">Price</th>
                  <th className="table-header text-center">Taken</th>
                  <th className="table-header text-center">Sold</th>
                  <th className="table-header text-center">Returned</th>
                  <th className="table-header text-center">Waste</th>
                  <th className="table-header text-center">Remaining</th>
                  <th className="table-header text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {todayData.transactions.filter(t => t.itemsTaken > 0).map((item, index) => (
                  <tr key={index} className="hover:bg-secondary-50">
                    <td className="table-cell font-medium">{item.itemName}</td>
                    <td className="table-cell text-center">₹{item.price}</td>
                    <td className="table-cell text-center">{item.itemsTaken}</td>
                    <td className="table-cell text-center text-green-600 font-medium">
                      {item.itemsSold}
                    </td>
                    <td className="table-cell text-center text-yellow-600">
                      {item.itemsReturned}
                    </td>
                    <td className="table-cell text-center text-red-600">
                      {item.itemsWaste}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-2 py-1 rounded ${
                        item.remaining > 0 ? 'bg-blue-100 text-blue-700' : 'bg-secondary-100'
                      }`}>
                        {item.remaining}
                      </span>
                    </td>
                    <td className="table-cell text-right font-semibold text-green-600">
                      ₹{item.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary-50 font-semibold">
                  <td className="table-cell" colSpan={2}>Total</td>
                  <td className="table-cell text-center">{todayData.totals?.totalTaken}</td>
                  <td className="table-cell text-center text-green-600">{todayData.totals?.totalSold}</td>
                  <td className="table-cell text-center text-yellow-600">{todayData.totals?.totalReturned}</td>
                  <td className="table-cell text-center text-red-600">{todayData.totals?.totalWaste}</td>
                  <td className="table-cell text-center">-</td>
                  <td className="table-cell text-right text-green-600">
                    ₹{(todayData.totals?.totalRevenue || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Sales Chart */}
      {salesData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">
            Item Sales (Last 7 Days)
          </h3>
          <BarChart data={salesData} height={300} />
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
