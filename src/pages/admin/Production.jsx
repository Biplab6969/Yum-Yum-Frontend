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
  const [productionInputs, setProductionInputs] = useState({});
  const [saving, setSaving] = useState(false);
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
    production.forEach((p) => {
      inputs[p.itemId] = p.productionQuantity;
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
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, productionQuantity]) => ({
          itemId,
          productionQuantity
        }));

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
      await productionAPI.add({
        itemId,
        productionQuantity: quantity
      });

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Daily Production Entry</h2>
          <p className="text-secondary-500 mt-1">Enter today's production quantities from the factory</p>
        </div>
        <div className="flex gap-3">
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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
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
                const prodData = production.find((p) => p.itemId === item._id);
                const currentStock = prodData?.currentAvailableStock || 0;
                const isLowStock = currentStock <= item.lowStockThreshold;
                const isOutOfStock = currentStock === 0;

                return (
                  <tr key={item._id} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-800">{item.name}</p>
                          <p className="text-sm text-secondary-500">Threshold: {item.lowStockThreshold}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-secondary-800">Rs {item.price}</span>
                    </td>
                    <td className="table-cell">
                      <input
                        type="number"
                        min="0"
                        value={productionInputs[item._id] || ''}
                        onChange={(e) => handleInputChange(item._id, e.target.value)}
                        className="w-24 px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </td>
                    <td className="table-cell">
                      <span
                        className={`text-xl font-bold ${
                          isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                        }`}
                      >
                        {currentStock}
                      </span>
                    </td>
                    <td className="table-cell">
                      {isOutOfStock ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleSaveItem(item._id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
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

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-secondary-800">Production History</h3>
            <p className="text-secondary-500 text-sm mt-1">Select a date to view item-wise production quantity</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="history-date" className="text-sm text-secondary-600 font-medium">
              Date
            </label>
            <input
              id="history-date"
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {historyLoading ? (
          <p className="text-sm text-secondary-500 px-1 py-3">Loading history...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Item Name</th>
                  <th className="table-header">Produced Quantity</th>
                </tr>
              </thead>
              <tbody>
                {itemHistoryList.map((row) => (
                  <tr key={row.itemId} className="hover:bg-secondary-50">
                    <td className="table-cell font-medium text-secondary-800">{row.itemName}</td>
                    <td className="table-cell text-secondary-900 font-semibold">{row.quantity}</td>
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
