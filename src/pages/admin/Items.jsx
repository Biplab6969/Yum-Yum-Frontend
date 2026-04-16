import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiPackage } from 'react-icons/fi';
import { Modal, Loading, DataTable } from '../../components/common';
import { useData } from '../../context/DataContext';
import { itemAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Items = () => {
  const { items, fetchItems, loading } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'plate',
    category: 'food',
    lowStockThreshold: 20
  });
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      unit: 'plate',
      category: 'food',
      lowStockThreshold: 20
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      unit: item.unit,
      category: item.category,
      lowStockThreshold: item.lowStockThreshold
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingItem) {
        await itemAPI.update(editingItem._id, {
          ...formData,
          price: parseFloat(formData.price),
          lowStockThreshold: parseInt(formData.lowStockThreshold)
        });
        toast.success('Item updated successfully');
      } else {
        await itemAPI.create({
          ...formData,
          price: parseFloat(formData.price),
          lowStockThreshold: parseInt(formData.lowStockThreshold)
        });
        toast.success('Item created successfully');
      }
      
      await fetchItems();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePrice = async (itemId, newPrice) => {
    try {
      await itemAPI.updatePrice(itemId, parseFloat(newPrice));
      await fetchItems();
      toast.success('Price updated');
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to deactivate "${item.name}"?`)) {
      return;
    }

    try {
      await itemAPI.delete(item._id);
      await fetchItems();
      toast.success('Item deactivated');
    } catch (error) {
      toast.error('Failed to deactivate item');
    }
  };

  const columns = [
    {
      header: 'Item',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
            <FiPackage className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-secondary-800">{value}</p>
            <p className="text-sm text-secondary-500 capitalize">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-secondary-800">₹{value}</span>
          <span className="text-secondary-500">/{row.unit}</span>
        </div>
      )
    },
    {
      header: 'Quick Price Update',
      accessor: '_id',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <input
            type="number"
            defaultValue={row.price}
            min="0"
            className="w-20 px-2 py-1 border border-secondary-300 rounded text-sm"
            onBlur={(e) => {
              if (e.target.value !== String(row.price)) {
                handleUpdatePrice(value, e.target.value);
              }
            }}
          />
          <FiDollarSign className="w-4 h-4 text-secondary-400" />
        </div>
      )
    },
    {
      header: 'Low Stock Threshold',
      accessor: 'lowStockThreshold',
      render: (value) => (
        <span className="text-secondary-600">{value} units</span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading.items) {
    return <Loading text="Loading items..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Item Management</h2>
          <p className="text-secondary-500 mt-1">
            Manage menu items and pricing
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <FiPlus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Items Table */}
      <div className="card">
        <DataTable 
          columns={columns}
          data={items}
          loading={loading.items}
          emptyMessage="No items found"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="e.g., Veg Momo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="input"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="input"
              >
                <option value="plate">Plate</option>
                <option value="piece">Piece</option>
                <option value="bottle">Bottle</option>
                <option value="kg">Kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="input"
              >
                <option value="food">Food</option>
                <option value="beverage">Beverage</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Items;
