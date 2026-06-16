import { useEffect, useState } from 'react';
import { FiSave, FiRefreshCw, FiPackage } from 'react-icons/fi';
import { Loading } from '../../components/common';
import { useData } from '../../context/DataContext';
import { productionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const formatDateInput = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Production = () => {
  const { items, production, fetchProduction, loading } = useData();
  const [saving, setSaving] = useState(false);
  const [productionInputs, setProductionInputs] = useState({});
  const [historyDate, setHistoryDate] = useState(formatDateInput());
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistoryForDate = async (selectedDate) => {
    setHistoryLoading(true);
    try {
      const response = await productionAPI.getByDate(selectedDate);
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      setHistoryRows(rows);
    } catch (error) {
      setHistoryRows([]);
      toast.error(error.response?.data?.message || 'Failed to load production history');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    const inputs = {};
    production.forEach((entry) => {
      inputs[entry.itemId] = entry.productionQuantity;
    });
    setProductionInputs(inputs);
  }, [production]);

  useEffect(() => {
    loadHistoryForDate(historyDate);
  }, [historyDate]);

  const handleInputChange = (itemId, value) => {
    setProductionInputs((prev) => ({
      ...prev,
      [itemId]: Number.parseInt(value, 10) || 0
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const productions = Object.entries(productionInputs)
        .filter(([, quantity]) => quantity > 0)
        .map(([itemId, productionQuantity]) => ({ itemId, productionQuantity }));

      if (productions.length === 0) {
        toast.error('Please enter at least one production quantity');
        return;
      }

      const response = await productionAPI.bulkAdd(productions);
      if (response.data.success) {
        await fetchProduction();
        toast.success('Production data saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save production data');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async (itemId) => {
    const quantity = productionInputs[itemId] || 0;

    try {
      await productionAPI.add({ itemId, productionQuantity: quantity });
      await fetchProduction();
      toast.success('Production updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update production');
    }
  };

  if (loading.items || loading.production) {
    return <Loading text="Loading production data..." />;
  }

  const historyByItem = new Map(
    historyRows.map((row) => [String(row.itemId?._id || row.itemId), row.productionQuantity || 0])
  );

  const itemHistoryList = items.map((item) => ({
    itemId: item._id,
    itemName: item.name,
    quantity: historyByItem.get(item._id) || 0
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.35),_transparent_35%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-300 font-semibold">Factory workflow</p>
            <h2 className="text-3xl font-bold mt-2">Daily Production Entry</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Enter today’s production quantities, verify stock levels, and keep central inventory aligned before sales start.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={fetchProduction} className="btn btn-secondary" type="button">
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleSaveAll} disabled={saving} className="btn btn-primary" type="button">
              {saving ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Save All
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="card border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="bg-yellow-50">
                <th className="table-header">Item</th>
                <th className="table-header">Price</th>
                <th className="table-header">Production Qty</th>
                <th className="table-header">Available Stock</th>
                <th className="table-header">Status</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const prodData = production.find((entry) => entry.itemId === item._id);
                const currentStock = prodData?.currentAvailableStock || 0;
                const isLowStock = currentStock <= item.lowStockThreshold;
                const isOutOfStock = currentStock === 0;

                return (
                  <tr key={item._id} className="hover:bg-yellow-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center border border-black shadow-sm">
                          <FiPackage className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-black">{item.name}</p>
                          <p className="text-sm text-black/60">Threshold: {item.lowStockThreshold}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center rounded-full bg-white border border-black px-3 py-1 font-semibold text-black shadow-sm">
                        Rs {item.price}
                      </span>
                    </td>
                    <td className="table-cell">
                      <input
                        type="number"
                        min="0"
                        value={productionInputs[item._id] || ''}
                        onChange={(e) => handleInputChange(item._id, e.target.value)}
                        className="w-24 px-3 py-2 border border-black rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-black bg-white text-black"
                        placeholder="0"
                      />
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center justify-center min-w-16 px-3 py-1.5 rounded-full text-xl font-bold bg-yellow-100 border border-black text-black shadow-sm">
                        {currentStock}
                      </span>
                    </td>
                    <td className="table-cell">
                      {isOutOfStock ? (
                        <span className="badge bg-black text-white border border-black shadow-sm">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge bg-yellow-100 text-black border border-black shadow-sm">Low Stock</span>
                      ) : (
                        <span className="badge bg-white text-black border border-black shadow-sm">In Stock</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleSaveItem(item._id)}
                        className="inline-flex items-center rounded-full border border-black px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow-50 transition-colors"
                        type="button"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card border-black/10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-black">Production History</h3>
            <p className="text-black/60 text-sm mt-1">Select a date to view item-wise production quantity</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="history-date" className="text-sm text-black font-medium">
              Date
            </label>
            <input
              id="history-date"
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="px-3 py-2 border border-black rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-black bg-white text-black"
            />
          </div>
        </div>

        {historyLoading ? (
          <p className="text-sm text-black/60 px-1 py-3">Loading history...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="bg-yellow-50">
                  <th className="table-header">Item Name</th>
                  <th className="table-header">Produced Quantity</th>
                </tr>
              </thead>
              <tbody>
                {itemHistoryList.map((row) => (
                  <tr key={row.itemId} className="hover:bg-yellow-50 transition-colors">
                    <td className="table-cell font-medium text-black">{row.itemName}</td>
                    <td className="table-cell text-black font-semibold">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Production;