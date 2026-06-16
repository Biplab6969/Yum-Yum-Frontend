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
          <div className="w-11 h-11 rounded-2xl bg-black text-yellow-400 flex items-center justify-center border border-black shadow-sm">
            <FiUser className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-black">{value}</p>
            <p className="text-sm text-black/60">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <span className="inline-flex items-center rounded-full border border-black bg-yellow-100 px-3 py-1 text-xs font-semibold text-black shadow-sm">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: 'Shop',
      accessor: 'shopId',
      render: (value) => value ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black bg-white text-black shadow-sm">
            <FiShoppingBag className="w-4 h-4" />
          </span>
          <span className="font-medium text-black">{value.name || `Shop ${value.shopNumber}`}</span>
        </div>
      ) : (
        <span className="inline-flex items-center rounded-full border border-black bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">-</span>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (value, row) => (
        <button
          onClick={() => toggleStatus(row)}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-colors ${value ? 'bg-white text-black border-black hover:bg-yellow-50' : 'bg-black text-white border-black hover:bg-yellow-400 hover:text-black'}`}
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-white text-black shadow-sm transition-colors hover:bg-yellow-50"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-white text-black shadow-sm transition-colors hover:bg-yellow-50"
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
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.34),_transparent_38%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300 font-semibold">Access control</p>
            <h2 className="text-3xl font-bold mt-2">User Management</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Manage admin and seller accounts, shop assignments, and access state from one clean admin view.
            </p>
          </div>
          <button onClick={openAddModal} className="btn btn-success w-fit">
            <FiPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Total users</p>
          <p className="mt-2 text-3xl font-bold text-black">{users.length}</p>
          <p className="text-sm text-black/60 mt-1">All admin, seller, and other accounts</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Active users</p>
          <p className="mt-2 text-3xl font-bold text-black">{users.filter((user) => user.isActive).length}</p>
          <p className="text-sm text-black/60 mt-1">Accounts currently enabled</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Seller accounts</p>
          <p className="mt-2 text-3xl font-bold text-black">{users.filter((user) => user.role === 'seller').length}</p>
          <p className="text-sm text-black/60 mt-1">Users linked to shops</p>
        </div>
      </div>

      <div className="card border-black/10 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-black/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Account directory</p>
            <h3 className="text-xl font-bold text-black mt-1">User List</h3>
            <p className="text-sm text-black/60 mt-1">Review role, shop assignment, status, and activity from one place.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black bg-yellow-50 px-3 py-2 text-sm font-semibold text-black w-fit">
            <FiUser className="w-4 h-4" />
            {users.length} accounts
          </div>
        </div>
        <DataTable 
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-black bg-yellow-50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Account setup</p>
            <p className="mt-2 text-sm text-black/70">
              Create or update access in a way that keeps shop assignments and login state clear.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">
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
            <label className="block text-sm font-medium text-black mb-1.5">
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
            <label className="block text-sm font-medium text-black mb-1.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">
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
              <label className="block text-sm font-medium text-black mb-1.5">
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
                className="w-4 h-4 rounded border-black text-black focus:ring-yellow-400"
              />
              <label htmlFor="isActive" className="text-sm text-black">
                Account is active
              </label>
            </div>
          )}

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
              {saving ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
