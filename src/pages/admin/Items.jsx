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
          <div className="w-11 h-11 rounded-2xl bg-black text-yellow-400 flex items-center justify-center border border-black shadow-sm">
            <FiPackage className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-black">{value}</p>
            <p className="text-sm text-black/60 capitalize">{row.category}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value, row) => (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-black bg-white px-3 py-1 text-base font-semibold text-black shadow-sm">
            Rs {value}
          </span>
          <span className="text-sm font-medium text-black/60">per {row.unit}</span>
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
            className="w-24 px-3 py-2 border border-black rounded-lg text-sm bg-white text-black focus:ring-2 focus:ring-yellow-300 focus:border-black"
            onBlur={(e) => {
              if (e.target.value !== String(row.price)) {
                handleUpdatePrice(value, e.target.value);
              }
            }}
          />
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-yellow-100 text-black shadow-sm">
            <FiDollarSign className="w-4 h-4" />
          </span>
        </div>
      )
    },
    {
      header: 'Low Stock Threshold',
      accessor: 'lowStockThreshold',
      render: (value) => (
        <span className="inline-flex items-center rounded-full border border-black bg-yellow-50 px-3 py-1 font-medium text-black">
          {value} units
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-black hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-black"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-black hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-black"
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
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.32),_transparent_38%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300 font-semibold">Catalog control</p>
            <h2 className="text-3xl font-bold mt-2">Item Management</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Manage menu items, prices, categories, and stock thresholds from one focused workspace.
            </p>
          </div>
          <button onClick={openAddModal} className="btn btn-success w-fit">
            <FiPlus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Total items</p>
          <p className="mt-2 text-3xl font-bold text-black">{items.length}</p>
          <p className="text-sm text-black/60 mt-1">Active menu entries in the catalog</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Food items</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {items.filter((item) => item.category === 'food').length}
          </p>
          <p className="text-sm text-black/60 mt-1">Main prepared food items</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Beverage items</p>
          <p className="mt-2 text-3xl font-bold text-black">
            {items.filter((item) => item.category === 'beverage').length}
          </p>
          <p className="text-sm text-black/60 mt-1">Drinks and bottled stock</p>
        </div>
      </div>

      <div className="card border-black/10 p-0 overflow-hidden">
        <DataTable 
          columns={columns}
          data={items}
          loading={loading.items}
          emptyMessage="No items found"
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-black bg-yellow-50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Item details</p>
            <p className="mt-2 text-sm text-black/70">
              Keep naming, pricing, and thresholds consistent so production and sales stay aligned.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
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
              <label className="block text-sm font-medium text-black mb-1.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
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
              <label className="block text-sm font-medium text-black mb-1.5">
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

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
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
