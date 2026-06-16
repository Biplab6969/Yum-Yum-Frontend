import { useState, useEffect } from 'react';
import { FiShoppingBag, FiCalendar, FiDollarSign, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import { Loading, StatCard } from '../../components/common';
import { BarChart, chartColors } from '../../components/charts';
import { useData } from '../../context/DataContext';
import { transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Shops = () => {
  const { shops, loading: dataLoading } = useData();
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shops.length > 0 && !selectedShop) {
      setSelectedShop(shops[0]._id);
    }
  }, [shops, selectedShop]);

  useEffect(() => {
    if (selectedShop) {
      fetchShopData();
    }
  }, [selectedShop, selectedDate]);

  const fetchShopData = async () => {
    if (!selectedShop) return;

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

    const data = shopData.transactions.filter((transaction) => transaction.itemsTaken > 0);

    return {
      labels: data.map((transaction) => transaction.itemName),
      datasets: [
        {
          label: 'Taken',
          data: data.map((transaction) => transaction.itemsTaken),
          backgroundColor: chartColors.info[0],
          borderRadius: 4
        },
        {
          label: 'Sold',
          data: data.map((transaction) => transaction.itemsSold),
          backgroundColor: chartColors.success[0],
          borderRadius: 4
        },
        {
          label: 'Returned',
          data: data.map((transaction) => transaction.itemsReturned),
          backgroundColor: chartColors.warning[0],
          borderRadius: 4
        },
        {
          label: 'Waste',
          data: data.map((transaction) => transaction.itemsWaste),
          backgroundColor: chartColors.primary[0],
          borderRadius: 4
        }
      ]
    };
  };

  if (dataLoading.shops) {
    return <Loading text="Loading shops..." />;
  }

  const currentShop = shops.find((shop) => shop._id === selectedShop);
  const chartData = getChartData();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.35),_transparent_40%)]" />
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300 font-semibold">Store overview</p>
            <h2 className="text-3xl font-bold mt-2">Shop Monitoring</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Monitor sales, returns, waste, and revenue for each shop in a focused daily workspace.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 bg-white text-black border border-black rounded-xl px-4 py-3 shadow-sm w-full sm:w-auto min-w-[240px]">
              <FiShoppingBag className="w-4 h-4 text-black" />
              <select
                value={selectedShop || ''}
                onChange={(e) => setSelectedShop(e.target.value)}
                className="w-full border-none bg-transparent p-0 pr-6 text-sm font-semibold focus:ring-0"
              >
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name} (Shop {shop.shopNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-yellow-400 text-black border border-black rounded-xl px-4 py-3 shadow-sm w-full sm:w-auto">
              <FiCalendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-none bg-transparent p-0 text-sm font-semibold focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {shops.map((shop) => (
          <button
            key={shop._id}
            onClick={() => setSelectedShop(shop._id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-all border ${
              selectedShop === shop._id
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-black border-black hover:bg-yellow-50'
            }`}
          >
            <FiShoppingBag className="w-4 h-4" />
            Shop {shop.shopNumber}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading text="Loading shop data..." />
      ) : shopData ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Items Taken" value={shopData.totals?.totalTaken || 0} icon={FiPackage} color="blue" />
            <StatCard title="Items Sold" value={shopData.totals?.totalSold || 0} icon={FiShoppingBag} color="yellow" />
            <StatCard title="Items Returned" value={shopData.totals?.totalReturned || 0} icon={FiPackage} color="yellow" />
            <StatCard title="Items Waste" value={shopData.totals?.totalWaste || 0} icon={FiAlertTriangle} color="red" />
            <StatCard
              title="Total Revenue"
              value={`₹${(shopData.totals?.totalRevenue || 0).toLocaleString()}`}
              icon={FiDollarSign}
              color="primary"
            />
          </div>

          {chartData && chartData.labels.length > 0 && (
            <div className="card border-black/10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Performance chart</p>
                  <h3 className="text-xl font-bold text-black mt-1">
                    {currentShop?.name || 'Selected shop'} - Daily Performance
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-black bg-yellow-50 px-3 py-2 text-sm font-semibold text-black w-fit">
                  <FiCalendar className="w-4 h-4" />
                  {new Date(selectedDate).toLocaleDateString()}
                </div>
              </div>
              <BarChart data={chartData} height={300} />
            </div>
          )}

          <div className="card border-black/10 p-0 overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-black/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Shop ledger</p>
                <h3 className="text-xl font-bold text-black mt-1">Item Details</h3>
                <p className="text-sm text-black/60 mt-1">
                  Review taken, sold, returned, waste, and remaining quantities for the selected shop.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black bg-white px-3 py-2 text-sm font-semibold text-black w-fit">
                <FiShoppingBag className="w-4 h-4" />
                {currentShop?.name || 'Shop'}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="bg-yellow-50">
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
                    <tr key={index} className="hover:bg-yellow-50 transition-colors">
                      <td className="table-cell font-semibold text-black">{item.itemName}</td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center rounded-full border border-black bg-white px-3 py-1 font-semibold text-black shadow-sm">
                          ₹{item.price}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center rounded-full border border-black bg-white px-3 py-1 font-semibold text-black shadow-sm">
                          {item.itemsTaken}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center rounded-full border border-black bg-yellow-100 px-3 py-1 font-semibold text-black shadow-sm">
                          {item.itemsSold}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center rounded-full border border-black bg-yellow-50 px-3 py-1 font-semibold text-black shadow-sm">
                          {item.itemsReturned}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span className="inline-flex items-center rounded-full border border-black bg-black px-3 py-1 font-semibold text-white shadow-sm">
                          {item.itemsWaste}
                        </span>
                      </td>
                      <td className="table-cell text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 font-semibold border shadow-sm ${
                            item.remaining > 0 ? 'bg-yellow-100 text-black border-black' : 'bg-white text-black border-black'
                          }`}
                        >
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
                  <tr className="bg-yellow-50 font-semibold">
                    <td className="table-cell">Total</td>
                    <td className="table-cell"></td>
                    <td className="table-cell text-center">{shopData.totals?.totalTaken}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalSold}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalReturned}</td>
                    <td className="table-cell text-center">{shopData.totals?.totalWaste}</td>
                    <td className="table-cell text-center">-</td>
                    <td className="table-cell text-right text-black">
                      ₹{(shopData.totals?.totalRevenue || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-12 border-black/10">
          <p className="text-black/60">Select a shop to view data</p>
        </div>
      )}
    </div>
  );
};

export default Shops;