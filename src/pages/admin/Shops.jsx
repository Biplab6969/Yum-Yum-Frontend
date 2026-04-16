import { useState, useEffect } from 'react';
import { FiShoppingBag, FiCalendar, FiDollarSign, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { Loading, StatCard } from '../../components/common';
import { BarChart, chartColors } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Shops = () => {
  const { shops, items, loading: dataLoading } = useData();
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shops.length > 0 && !selectedShop) {
      setSelectedShop(shops[0]._id);
    }
  }, [shops]);

  useEffect(() => {
    if (selectedShop) {
      fetchShopData();
    }
  }, [selectedShop, selectedDate]);

  const fetchShopData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.getShopTransactions(selectedShop, selectedDate),
        transactionAPI.getShopSummary(selectedShop, selectedDate)
      ]);

      setShopData({
        transactions: transactionsRes.data.data,
        totals: transactionsRes.data.totals,
        summary: summaryRes.data.data
      });
    } catch (error) {
      toast.error('Failed to fetch shop data');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!shopData?.transactions) return null;

    const data = shopData.transactions.filter(t => t.itemsTaken > 0);
    
    return {
      labels: data.map(t => t.itemName),
      datasets: [
        {
          label: 'Taken',
          data: data.map(t => t.itemsTaken),
          backgroundColor: chartColors.info[0],
          borderRadius: 4
        },
        {
          label: 'Sold',
          data: data.map(t => t.itemsSold),
          backgroundColor: chartColors.success[0],
          borderRadius: 4
        },
        {
          label: 'Returned',
          data: data.map(t => t.itemsReturned),
          backgroundColor: chartColors.warning[0],
          borderRadius: 4
        },
        {
          label: 'Waste',
          data: data.map(t => t.itemsWaste),
          backgroundColor: chartColors.primary[0],
          borderRadius: 4
        }
      ]
    };
  };

  if (dataLoading.shops) {
    return <Loading text="Loading shops..." />;
  }

  const currentShop = shops.find(s => s._id === selectedShop);
  const chartData = getChartData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Shop Monitoring</h2>
          <p className="text-secondary-500 mt-1">
            View sales and stock data for each shop
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedShop || ''}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg"
          >
            {shops.map(shop => (
              <option key={shop._id} value={shop._id}>
                {shop.name} (Shop {shop.shopNumber})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg"
          />
        </div>
      </div>

      {/* Shop Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {shops.map(shop => (
          <button
            key={shop._id}
            onClick={() => setSelectedShop(shop._id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedShop === shop._id
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            <FiShoppingBag className="w-4 h-4 inline mr-2" />
            Shop {shop.shopNumber}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading text="Loading shop data..." />
      ) : shopData ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Items Taken"
              value={shopData.totals?.totalTaken || 0}
              icon={FiPackage}
              color="blue"
            />
            <StatCard
              title="Items Sold"
              value={shopData.totals?.totalSold || 0}
              icon={FiShoppingBag}
              color="green"
            />
            <StatCard
              title="Items Returned"
              value={shopData.totals?.totalReturned || 0}
              icon={FiPackage}
              color="yellow"
            />
            <StatCard
              title="Items Waste"
              value={shopData.totals?.totalWaste || 0}
              icon={FiAlertTriangle}
              color="red"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${(shopData.totals?.totalRevenue || 0).toLocaleString()}`}
              icon={FiDollarSign}
              color="purple"
            />
          </div>

          {/* Chart */}
          {chartData && chartData.labels.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-secondary-800 mb-4">
                {currentShop?.name} - Daily Performance
              </h3>
              <BarChart data={chartData} height={300} />
            </div>
          )}

          {/* Transactions Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-800 mb-4">Item Details</h3>
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
                  {shopData.transactions.map((item, index) => (
                    <tr key={index} className="hover:bg-secondary-50">
                      <td className="table-cell font-medium">{item.itemName}</td>
                      <td className="table-cell text-center">₹{item.price}</td>
                      <td className="table-cell text-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {item.itemsTaken}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {item.itemsSold}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {item.itemsReturned}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          {item.itemsWaste}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className={`px-2 py-1 rounded ${
                          item.remaining > 0 ? 'bg-purple-100 text-purple-700' : 'bg-secondary-100 text-secondary-600'
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
                    <td className="table-cell">Total</td>
                    <td className="table-cell"></td>
                    <td className="table-cell text-center">{shopData.totals?.totalTaken}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalSold}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalReturned}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalWaste}</td>
                    <td className="table-cell text-center">-</td>
                    <td className="table-cell text-right text-green-600">
                      ₹{(shopData.totals?.totalRevenue || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12">
          <p className="text-secondary-500">Select a shop to view data</p>
        </div>
      )}
    </div>
  );
};

export default Shops;
