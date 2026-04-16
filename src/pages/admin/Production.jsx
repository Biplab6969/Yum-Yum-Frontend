import { useState, useEffect } from 'react';
import { FiPlus, FiSave, FiRefreshCw, FiPackage } from 'react-icons/fi';
import { Loading } from '../../components/common';
import { useData } from '../../context/DataContext';
import { productionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Production = () => {
  const { items, production, fetchProduction, loading } = useData();
  const [productionInputs, setProductionInputs] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize inputs from production data
    const inputs = {};
    production.forEach(p => {
      inputs[p.itemId] = p.productionQuantity;
    });
    setProductionInputs(inputs);
  }, [production]);

  const handleInputChange = (itemId, value) => {
    setProductionInputs(prev => ({
      ...prev,
      [itemId]: parseInt(value) || 0
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Daily Production Entry</h2>
          <p className="text-secondary-500 mt-1">
            Enter today's production quantities from the factory
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchProduction}
            className="btn btn-secondary"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="btn btn-primary"
          >
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

      {/* Production Table */}
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
                const prodData = production.find(p => p.itemId === item._id);
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
                          <p className="text-sm text-secondary-500">
                            Threshold: {item.lowStockThreshold}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-secondary-800">₹{item.price}</span>
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
                      <span className={`text-xl font-bold ${
                        isOutOfStock ? 'text-red-600' : 
                        isLowStock ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-green-600 text-sm font-medium">In Stock</p>
          <p className="text-2xl font-bold text-green-700 mt-1">
            {production.filter(p => !p.isLowStock).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-yellow-600 text-sm font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">
            {production.filter(p => p.isLowStock && p.currentAvailableStock > 0).length}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-red-600 text-sm font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {production.filter(p => p.currentAvailableStock === 0).length}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-blue-600 text-sm font-medium">Total Stock</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {production.reduce((sum, p) => sum + p.currentAvailableStock, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Production;
