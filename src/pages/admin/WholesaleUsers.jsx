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

  const totalPending = users.reduce((sum, user) => sum + Number(user.summary?.pendingAmount || 0), 0);

  const columns = [
    {
      header: 'Wholesale User',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-black text-yellow-400 flex items-center justify-center border border-black shadow-sm">
            <FiUsers className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-black">{value}</p>
            <p className="text-xs text-black/60">{row.companyName || 'Individual buyer'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: 'email',
      render: (value, row) => (
        <div className="space-y-1">
          <p className="text-sm text-black flex items-center gap-2 font-medium">
            <FiMail className="w-4 h-4" />
            {value}
          </p>
          <p className="text-sm text-black flex items-center gap-2 font-medium">
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
        <span className="inline-flex items-center rounded-full border border-black bg-yellow-50 px-3 py-1 font-semibold text-black shadow-sm">
          {formatCurrency(summary?.pendingAmount || 0)}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (isActive) => (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${isActive ? 'bg-white text-black border-black' : 'bg-black text-white border-black'}`}>
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black bg-white text-black shadow-sm transition-colors hover:bg-yellow-50"
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
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.34),_transparent_38%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300 font-semibold">Wholesale control</p>
            <h2 className="text-3xl font-bold mt-2">Wholesale User Management</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Create and manage wholesale customer accounts, balances, and reminders in one focused view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={triggerDailyReminders}
              disabled={sendingReminder}
              className="btn btn-secondary"
            >
              <FiSend className="w-4 h-4" />
              {sendingReminder ? 'Sending...' : 'Send WhatsApp Reminders'}
            </button>
            <button onClick={openCreateModal} className="btn btn-success">
              <FiPlus className="w-4 h-4" />
              Add Wholesale User
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Total wholesale users</p>
          <p className="mt-2 text-3xl font-bold text-black">{users.length}</p>
          <p className="text-sm text-black/60 mt-1">All active and inactive customer accounts</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Open accounts</p>
          <p className="mt-2 text-3xl font-bold text-black">{users.filter((user) => user.isActive !== false).length}</p>
          <p className="text-sm text-black/60 mt-1">Accounts ready for transactions</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Pending balance</p>
          <p className="mt-2 text-3xl font-bold text-black">{formatCurrency(totalPending)}</p>
          <p className="text-sm text-black/60 mt-1">Combined outstanding wholesale balance</p>
        </div>
      </div>

      <div className="card border-black/10 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-black/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Account directory</p>
            <h3 className="text-xl font-bold text-black mt-1">Wholesale User List</h3>
            <p className="text-sm text-black/60 mt-1">Monitor contact details, balances, and quick access to each ledger.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black bg-yellow-50 px-3 py-2 text-sm font-semibold text-black w-fit">
            <FiUsers className="w-4 h-4" />
            {users.length} accounts
          </div>
        </div>
        <DataTable columns={columns} data={users} loading={loading} emptyMessage="No wholesale users found" />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit Wholesale User' : 'Add Wholesale User'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-2xl border border-black bg-yellow-50 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Customer profile</p>
            <p className="mt-2 text-sm text-black/70">
              Add buyer contact details, notes, and access state in a consistent format.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Name</label>
              <input
                className="input"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Company Name</label>
              <input
                className="input"
                value={formData.companyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Phone</label>
              <input
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Address</label>
            <textarea
              className="input min-h-20"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Notes</label>
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
                className="w-4 h-4 rounded border-black text-black focus:ring-yellow-400"
              />
              <label htmlFor="wholesale-is-active" className="text-sm text-black">
                Account is active
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
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