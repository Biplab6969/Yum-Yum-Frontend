import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { Loading, ErrorMessage } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { transactionAPI, itemAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Transactions = () => {
  const { shopId, user } = useAuth();
  const { production, fetchProduction } = useData();
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, transRes] = await Promise.all([
        itemAPI.getAll(),
        transactionAPI.getShopTransactions(shopId, today)
      ]);

      const activeItems = itemsRes.data.data.filter(i => i.isActive);
      setItems(activeItems);

      // Initialize transactions form
      const transData = activeItems.map(item => {
        const existing = transRes.data.data.find(t => t.item === item._id || t.itemId === item._id);
        
        // Get available stock from production data
        const prodItem = production.find(p => p.itemId === item._id);
        const maxAvailable = prodItem?.currentAvailableStock || 0;

        return {
          itemId: item._id,
          itemName: item.name,
          price: item.price,
          maxAvailable,
          itemsTaken: existing?.itemsTaken || 0,
          itemsSold: existing?.itemsSold || 0,
          itemsReturned: existing?.itemsReturned || 0,
          itemsWaste: existing?.itemsWaste || 0,
          hasExistingTransaction: !!existing,
          transactionId: existing?._id
        };
      });

      setTransactions(transData);
      setErrors({});
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (itemId, field, value) => {
    const numValue = parseInt(value) || 0;
    
    setTransactions(prev => prev.map(t => {
      if (t.itemId !== itemId) return t;
      
      const updated = { ...t, [field]: numValue };
      
      // Validate inputs
      const newErrors = { ...errors };
      const errorKey = `${itemId}-${field}`;
      
      // Check if taking more than available
      if (field === 'itemsTaken' && numValue > t.maxAvailable) {
        newErrors[errorKey] = `Max available: ${t.maxAvailable}`;
      } else if (field === 'itemsSold' && numValue > updated.itemsTaken) {
        newErrors[errorKey] = `Cannot sell more than taken (${updated.itemsTaken})`;
      } else if (field === 'itemsReturned' && numValue > (updated.itemsTaken - updated.itemsSold - updated.itemsWaste)) {
        newErrors[errorKey] = `Cannot return more than remaining`;
      } else if (field === 'itemsWaste' && numValue > (updated.itemsTaken - updated.itemsSold - updated.itemsReturned)) {
        newErrors[errorKey] = `Cannot waste more than remaining`;
      } else {
        delete newErrors[errorKey];
      }
      
      setErrors(newErrors);
      return updated;
    }));
  };

  const calculateRemaining = (t) => {
    return Math.max(0, t.itemsTaken - t.itemsSold - t.itemsReturned - t.itemsWaste);
  };

  const calculateRevenue = (t) => {
    return t.itemsSold * t.price;
  };

  const getTotalRevenue = () => {
    return transactions.reduce((sum, t) => sum + calculateRevenue(t), 0);
  };

  const getTotalSold = () => {
    return transactions.reduce((sum, t) => sum + t.itemsSold, 0);
  };

  const handleSave = async () => {
    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    // Filter transactions that have items taken
    const transactionsToSave = transactions.filter(t => t.itemsTaken > 0);
    
    if (transactionsToSave.length === 0) {
      toast.error('No items taken to record');
      return;
    }

    // Check for incomplete transactions (items taken but not accounted for)
    const incompleteItems = transactionsToSave.filter(t => calculateRemaining(t) > 0);
    
    if (incompleteItems.length > 0) {
      const confirm = window.confirm(
        `${incompleteItems.length} item(s) have remaining stock. Are you sure you want to save?`
      );
      if (!confirm) return;
    }

    try {
      setSaving(true);
      
      const payload = transactionsToSave.map(t => ({
        item: t.itemId,
        itemsTaken: t.itemsTaken,
        itemsSold: t.itemsSold,
        itemsReturned: t.itemsReturned,
        itemsWaste: t.itemsWaste
      }));

      await transactionAPI.recordBulk(shopId, { transactions: payload, date: today });
      
      toast.success('Transactions saved successfully!');
      
      // Refresh data
      await Promise.all([fetchData(), fetchProduction()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save transactions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading transactions..." />;
  }

  const shopName = user?.shopId?.name || `Shop ${user?.shopId?.shopNumber}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-800">
            Daily Transactions
          </h1>
          <p className="text-secondary-500">
            {shopName} • {new Date(today).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="btn btn-secondary flex items-center gap-2"
            disabled={saving}
          >
            <FiRefreshCw className={saving ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center gap-2"
            disabled={saving || Object.keys(errors).length > 0}
          >
            <FiSave />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FiPackage className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">How to record transactions:</p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>1. Enter the number of items you're taking from central stock</li>
              <li>2. Throughout the day, update items sold, returned, and waste</li>
              <li>3. Click "Save All" to record your transactions</li>
              <li>4. Remaining items = Taken - Sold - Returned - Waste</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary-100">
                <th className="table-header">Item</th>
                <th className="table-header text-center">Price</th>
                <th className="table-header text-center">Available</th>
                <th className="table-header text-center">Taken</th>
                <th className="table-header text-center">Sold</th>
                <th className="table-header text-center">Returned</th>
                <th className="table-header text-center">Waste</th>
                <th className="table-header text-center">Remaining</th>
                <th className="table-header text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const remaining = calculateRemaining(t);
                const revenue = calculateRevenue(t);
                
                return (
                  <tr key={t.itemId} className="hover:bg-secondary-50 border-b border-secondary-100">
                    <td className="table-cell">
                      <span className="font-medium text-secondary-800">{t.itemName}</span>
                    </td>
                    <td className="table-cell text-center text-secondary-600">
                      ₹{t.price}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        t.maxAvailable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.maxAvailable}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          max={t.maxAvailable}
                          value={t.itemsTaken}
                          onChange={(e) => handleInputChange(t.itemId, 'itemsTaken', e.target.value)}
                          className={`input w-20 text-center ${
                            errors[`${t.itemId}-itemsTaken`] ? 'border-red-500' : ''
                          }`}
                        />
                        {errors[`${t.itemId}-itemsTaken`] && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors[`${t.itemId}-itemsTaken`]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          max={t.itemsTaken}
                          value={t.itemsSold}
                          onChange={(e) => handleInputChange(t.itemId, 'itemsSold', e.target.value)}
                          disabled={t.itemsTaken === 0}
                          className={`input w-20 text-center ${
                            errors[`${t.itemId}-itemsSold`] ? 'border-red-500' : ''
                          } ${t.itemsTaken === 0 ? 'bg-secondary-100' : ''}`}
                        />
                        {errors[`${t.itemId}-itemsSold`] && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors[`${t.itemId}-itemsSold`]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          value={t.itemsReturned}
                          onChange={(e) => handleInputChange(t.itemId, 'itemsReturned', e.target.value)}
                          disabled={t.itemsTaken === 0}
                          className={`input w-20 text-center ${
                            errors[`${t.itemId}-itemsReturned`] ? 'border-red-500' : ''
                          } ${t.itemsTaken === 0 ? 'bg-secondary-100' : ''}`}
                        />
                        {errors[`${t.itemId}-itemsReturned`] && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors[`${t.itemId}-itemsReturned`]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          value={t.itemsWaste}
                          onChange={(e) => handleInputChange(t.itemId, 'itemsWaste', e.target.value)}
                          disabled={t.itemsTaken === 0}
                          className={`input w-20 text-center ${
                            errors[`${t.itemId}-itemsWaste`] ? 'border-red-500' : ''
                          } ${t.itemsTaken === 0 ? 'bg-secondary-100' : ''}`}
                        />
                        {errors[`${t.itemId}-itemsWaste`] && (
                          <span className="text-xs text-red-500 mt-1">
                            {errors[`${t.itemId}-itemsWaste`]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-center">
                      <span className={`px-3 py-1 rounded font-medium ${
                        remaining > 0 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : t.itemsTaken > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-secondary-100 text-secondary-500'
                      }`}>
                        {remaining}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <span className={`font-semibold ${revenue > 0 ? 'text-green-600' : 'text-secondary-400'}`}>
                        ₹{revenue.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary-100 font-semibold">
                <td className="table-cell" colSpan={4}>Totals</td>
                <td className="table-cell text-center text-green-600">
                  {getTotalSold()}
                </td>
                <td className="table-cell text-center text-yellow-600">
                  {transactions.reduce((sum, t) => sum + t.itemsReturned, 0)}
                </td>
                <td className="table-cell text-center text-red-600">
                  {transactions.reduce((sum, t) => sum + t.itemsWaste, 0)}
                </td>
                <td className="table-cell text-center">
                  {transactions.reduce((sum, t) => sum + calculateRemaining(t), 0)}
                </td>
                <td className="table-cell text-right text-green-600">
                  ₹{getTotalRevenue().toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Please fix the following errors:</p>
              <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600">Items Taken</p>
          <p className="text-2xl font-bold text-blue-700">
            {transactions.reduce((sum, t) => sum + t.itemsTaken, 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600">Items Sold</p>
          <p className="text-2xl font-bold text-green-700">
            {getTotalSold()}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-600">Items Returned</p>
          <p className="text-2xl font-bold text-yellow-700">
            {transactions.reduce((sum, t) => sum + t.itemsReturned, 0)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-700">
            ₹{getTotalRevenue().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
