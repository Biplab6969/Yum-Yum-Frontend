import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiShoppingBag } from 'react-icons/fi';
import { Modal, Loading, DataTable } from '../../components/common';
import { useData } from '../../context/DataContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Users = () => {
  const { shops } = useData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seller',
    shopId: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'seller',
      shopId: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      shopId: user.shopId?._id || '',
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = { ...formData };
      if (!data.password) delete data.password;
      if (!data.shopId) data.shopId = null;

      if (editingUser) {
        await authAPI.updateUser(editingUser._id, data);
        toast.success('User updated successfully');
      } else {
        if (!formData.password) {
          toast.error('Password is required for new users');
          setSaving(false);
          return;
        }
        await authAPI.register(data);
        toast.success('User created successfully');
      }
      
      await fetchUsers();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"?`)) {
      return;
    }

    try {
      await authAPI.deleteUser(user._id);
      await fetchUsers();
      toast.success('User deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await authAPI.updateUser(user._id, { isActive: !user.isActive });
      await fetchUsers();
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            row.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
          }`}>
            <FiUser className={`w-5 h-5 ${
              row.role === 'admin' ? 'text-purple-600' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <p className="font-medium text-secondary-800">{value}</p>
            <p className="text-sm text-secondary-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <span className={`badge ${
          value === 'admin' ? 'badge-info' : 'badge-success'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Shop',
      accessor: 'shopId',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <FiShoppingBag className="w-4 h-4 text-secondary-400" />
          <span>{value.name || `Shop ${value.shopNumber}`}</span>
        </div>
      ) : (
        <span className="text-secondary-400">-</span>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (value, row) => (
        <button
          onClick={() => toggleStatus(row)}
          className={`badge ${value ? 'badge-success' : 'badge-danger'}`}
        >
          {value ? 'Active' : 'Inactive'}
        </button>
      )
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      render: (value) => value ? (
        <span className="text-sm text-secondary-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-secondary-400">Never</span>
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

  if (loading) {
    return <Loading text="Loading users..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">User Management</h2>
          <p className="text-secondary-500 mt-1">
            Manage admin and seller accounts
          </p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <FiPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        <DataTable 
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Password {editingUser && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input"
              placeholder="••••••••"
              required={!editingUser}
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="input"
              >
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Assigned Shop
              </label>
              <select
                value={formData.shopId}
                onChange={(e) => setFormData(prev => ({ ...prev, shopId: e.target.value }))}
                className="input"
                disabled={formData.role === 'admin'}
              >
                <option value="">No Shop (Admin)</option>
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name} (Shop {shop.shopNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editingUser && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-secondary-700">
                Account is active
              </label>
            </div>
          )}

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
              {saving ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
