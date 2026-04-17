import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiUsers, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import { DataTable, Loading, Modal } from '../../components/common';
import { wholesaleAPI } from '../../services/api';
import toast from 'react-hot-toast';

const initialFormState = {
  name: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  isActive: true
};

const WholesaleUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await wholesaleAPI.getUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch wholesale users');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      companyName: user.companyName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      notes: user.notes || '',
      isActive: user.isActive !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      if (editingUser) {
        await wholesaleAPI.updateUser(editingUser._id, formData);
        toast.success('Wholesale user updated');
      } else {
        await wholesaleAPI.createUser(formData);
        toast.success('Wholesale user created');
      }

      setShowModal(false);
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save wholesale user');
    } finally {
      setSaving(false);
    }
  };

  const triggerDailyReminders = async () => {
    try {
      setSendingReminder(true);
      const response = await wholesaleAPI.sendDailyReminders();
      const results = response.data?.data || [];
      const sentCount = results.filter((entry) => !entry.skipped).length;
      toast.success(`WhatsApp reminders processed. Sent: ${sentCount}`);
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reminders');
    } finally {
      setSendingReminder(false);
    }
  };

  const formatCurrency = (amount) =>
    `INR ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns = [
    {
      header: 'Wholesale User',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center">
            <FiUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-secondary-800">{value}</p>
            <p className="text-xs text-secondary-500">{row.companyName || 'Individual buyer'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'email',
      render: (value, row) => (
        <div className="space-y-1">
          <p className="text-sm text-secondary-700 flex items-center gap-2">
            <FiMail className="w-4 h-4" />
            {value}
          </p>
          <p className="text-sm text-secondary-700 flex items-center gap-2">
            <FiPhone className="w-4 h-4" />
            {row.phone}
          </p>
        </div>
      )
    },
    {
      header: 'Pending',
      accessor: 'summary',
      render: (summary) => (
        <p className="font-semibold text-red-600">{formatCurrency(summary?.pendingAmount || 0)}</p>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (isActive) => (
        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/wholesale-users/${row._id}`)}
            className="btn btn-outline !py-1.5 !px-3 text-sm"
          >
            Open Ledger
          </button>
          <button
            onClick={() => openEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading text="Loading wholesale users..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Wholesale User Management</h2>
          <p className="text-secondary-500 mt-1">Create and manage wholesale customer accounts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerDailyReminders}
            disabled={sendingReminder}
            className="btn btn-secondary"
          >
            <FiSend className="w-4 h-4" />
            {sendingReminder ? 'Sending...' : 'Send WhatsApp Reminders'}
          </button>
          <button onClick={openCreateModal} className="btn btn-primary">
            <FiPlus className="w-4 h-4" />
            Add Wholesale User
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="No wholesale users found" />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Wholesale User' : 'Add Wholesale User'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
              <input
                className="input"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Company Name</label>
              <input
                className="input"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
              <input
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Address</label>
            <textarea
              className="input min-h-20"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Notes</label>
            <textarea
              className="input min-h-20"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {editingUser && (
            <div className="flex items-center gap-2">
              <input
                id="wholesale-is-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="wholesale-is-active" className="text-sm text-secondary-700">
                Account is active
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WholesaleUsers;
