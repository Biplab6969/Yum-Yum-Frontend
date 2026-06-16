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

  // Re-fetch when transactions are updated elsewhere (e.g., Save All)
  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.shopId === shopId) {
        fetchData();
      }
    };
    window.addEventListener('transactions:updated', handler);
    return () => window.removeEventListener('transactions:updated', handler);
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
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.35),_transparent_35%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-300 font-semibold">Seller overview</p>
            <h2 className="text-2xl font-bold mt-2">Welcome, {user?.name}!</h2>
            <p className="text-white/75 mt-1">
              {shopName} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black border border-black rounded-full px-4 py-2 shadow-sm w-fit">
            <FiShoppingBag className="w-4 h-4" />
            <span className="text-sm font-semibold">Daily sales</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div> */}

      {/* Central Stock Available */}
      <div className="card border-black/10">
        <h3 className="text-lg font-semibold text-black mb-4">
          Central Stock Available Today
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {production.map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg text-center ${
                item.isLowStock ? 'bg-yellow-50 border border-black' : 'bg-white border border-black'
              }`}
            >
              <p className="text-sm text-black truncate" title={item.itemName}>
                {item.itemName}
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                'text-black'
              }`}>
                {item.currentAvailableStock}
              </p>
              <p className="text-xs text-black/60">available</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      {todayData?.transactions && (
        <div className="card border-black/10">
          <h3 className="text-lg font-semibold text-black mb-4">
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
                    <td className="table-cell text-center text-black font-medium">
                      {item.itemsSold}
                    </td>
                    <td className="table-cell text-center text-yellow-600">
                      {item.itemsReturned}
                    </td>
                    <td className="table-cell text-center text-black">
                      {item.itemsWaste}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-2 py-1 rounded ${
                        item.remaining > 0 ? 'bg-yellow-100 text-black border border-black' : 'bg-white text-black border border-black'
                      }`}>
                        {item.remaining}
                      </span>
                    </td>
                    <td className="table-cell text-right font-semibold text-black">
                      ₹{item.totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-secondary-50 font-semibold">
                  <td className="table-cell" colSpan={2}>Total</td>
                  <td className="table-cell text-center">{todayData.totals?.totalTaken}</td>
                  <td className="table-cell text-center text-black">{todayData.totals?.totalSold}</td>
                  <td className="table-cell text-center text-black">{todayData.totals?.totalReturned}</td>
                  <td className="table-cell text-center text-black">{todayData.totals?.totalWaste}</td>
                  <td className="table-cell text-center">-</td>
                  <td className="table-cell text-right text-black">
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
        <div className="card border-black/10">
          <h3 className="text-lg font-semibold text-black mb-4">
            Item Sales (Last 7 Days)
          </h3>
          <BarChart data={salesData} height={300} />
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
