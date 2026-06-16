import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiFileText, FiSave } from 'react-icons/fi';
import { DataTable, Loading } from '../../components/common';
import { wholesaleAPI } from '../../services/api';
import toast from 'react-hot-toast';

const WholesaleUserLedger = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const [wholesaleUser, setWholesaleUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [ledger, setLedger] = useState({ entries: [] });

  const [saleLines, setSaleLines] = useState({});
  const [saleNotes, setSaleNotes] = useState('');

  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  const formatCurrency = (amount) =>
    `INR ${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const hydrateSaleLines = (itemList) => {
    const next = {};
    itemList.forEach((item) => {
      next[item._id] = {
        quantity: '',
        unitPrice: item.price || 0
      };
    });
    setSaleLines(next);
  };

  const fetchLedger = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await wholesaleAPI.getUserLedger(id, 1, 100);
      const payload = response.data.data;

      setWholesaleUser(payload.wholesaleUser);
      setSummary(payload.summary);
      setItems(payload.items || []);
      setLedger(payload.ledger || { entries: [] });

      if (!silent) {
        hydrateSaleLines(payload.items || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load wholesale ledger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  const salePreview = useMemo(() => {
    const activeLines = items
      .map((item) => {
        const line = saleLines[item._id] || { quantity: '', unitPrice: item.price || 0 };
        const quantity = Number(line.quantity || 0);
        const unitPrice = Number(line.unitPrice || 0);
        const lineTotal = Number((quantity * unitPrice).toFixed(2));

        return {
          itemId: item._id,
          itemName: item.name,
          quantity,
          unitPrice,
          lineTotal
        };
      })
      .filter((line) => line.quantity > 0);

    const totalAmount = activeLines.reduce((sum, line) => sum + line.lineTotal, 0);
    return { activeLines, totalAmount };
  }, [items, saleLines]);

  const handleSaleInputChange = (itemId, field, value) => {
    setSaleLines((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value
      }
    }));
  };

  const submitSale = async (e) => {
    e.preventDefault();

    if (salePreview.activeLines.length === 0) {
      toast.error('Add quantity for at least one item');
      return;
    }

    try {
      setSavingSale(true);
      const response = await wholesaleAPI.createSale(id, {
        items: salePreview.activeLines,
        notes: saleNotes
      });

      const notification = response?.data?.data?.notification;
      const whatsappSent = notification?.whatsapp?.sent;
      const whatsappSkipped = notification?.whatsapp?.skipped;

      if (whatsappSent) {
        toast.success('Sale saved. Receipt sent on WhatsApp.');
      } else if (whatsappSkipped) {
        toast.success('Sale saved. WhatsApp delivery is disabled or not configured.');
      } else {
        toast.error('Sale saved, but the WhatsApp receipt could not be delivered.');
        if (notification?.whatsapp?.reason) {
          toast.error(`WhatsApp failed: ${notification.whatsapp.reason}`);
        }
      }

      setSaleNotes('');
      hydrateSaleLines(items);
      await fetchLedger({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save sale');
    } finally {
      setSavingSale(false);
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();

    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      toast.error('Enter valid payment amount');
      return;
    }

    try {
      setSavingPayment(true);
      const response = await wholesaleAPI.recordPayment(id, {
        amount: Number(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes
      });

      const notification = response?.data?.data?.notification;
      const whatsappSent = notification?.whatsapp?.sent;
      const whatsappSkipped = notification?.whatsapp?.skipped;

      if (whatsappSent) {
        toast.success('Payment recorded and WhatsApp receipt sent.');
      } else if (whatsappSkipped) {
        toast.success('Payment recorded. WhatsApp delivery is disabled or not configured.');
      } else {
        toast.error('Payment recorded, but the WhatsApp receipt could not be delivered.');
        if (notification?.whatsapp?.reason) {
          toast.error(`WhatsApp failed: ${notification.whatsapp.reason}`);
        }
      }

      setPaymentData({ amount: '', paymentMethod: 'cash', notes: '' });
      await fetchLedger({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const ledgerColumns = [
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (value) => new Date(value).toLocaleString()
    },
    {
      header: 'Type',
      accessor: 'entryType',
      render: (value) => (
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${value === 'SALE' ? 'bg-yellow-100 text-black border-black' : 'bg-black text-white border-black'}`}>
          {value}
        </span>
      )
    },
    {
      header: 'Receipt',
      accessor: 'receiptNumber'
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (value) => <span className="text-black font-semibold">{formatCurrency(value)}</span>
    },
    {
      header: 'Notes',
      accessor: 'notes',
      render: (value) => value || '-'
    }
  ];

  if (loading) {
    return <Loading text="Loading wholesale ledger..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.34),_transparent_38%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to="/admin/wholesale-users" className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 text-sm font-semibold mb-2">
              <FiArrowLeft className="w-4 h-4" />
              Back to Wholesale Users
            </Link>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-200/80 font-semibold">Wholesale ledger</p>
            <h2 className="text-3xl font-bold mt-2">{wholesaleUser?.name}</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              {wholesaleUser?.companyName || 'Individual buyer'} | {wholesaleUser?.email} | {wholesaleUser?.phone}
            </p>
          </div>
          <button onClick={() => fetchLedger({ silent: true })} className="btn btn-secondary w-fit" disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Previous pending</p>
          <p className="text-2xl font-bold text-black mt-2">{formatCurrency(summary?.previousPending)}</p>
          <p className="text-xs text-black/60 mt-2">Balance carried into today</p>
        </div>
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Today sales</p>
          <p className="text-2xl font-bold text-black mt-2">{formatCurrency(summary?.todaySalesAmount)}</p>
          <p className="text-xs text-black/60 mt-2">New wholesale sales booked</p>
        </div>
        <div className="stat-card">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Today received</p>
          <p className="text-2xl font-bold text-black mt-2">{formatCurrency(summary?.todayReceivedAmount)}</p>
          <p className="text-xs text-black/60 mt-2">Payments recorded today</p>
        </div>
        <div className="stat-card border-black">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Current pending</p>
          <p className="text-2xl font-bold text-black mt-2">{formatCurrency(summary?.pendingAmount)}</p>
          <p className="text-xs text-black/60 mt-2">Outstanding balance right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card border-black/10 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-black/10 bg-yellow-50/60">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black bg-black text-yellow-400 shadow-sm">
                <FiFileText className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Sale entry</p>
                <h3 className="text-xl font-bold text-black mt-1">Create Wholesale Sale</h3>
              </div>
            </div>
          </div>

          <form onSubmit={submitSale} className="space-y-5 p-6">
            <div className="max-h-72 overflow-y-auto rounded-2xl border border-black/10 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[620px]">
                <thead className="bg-yellow-50 sticky top-0">
                  <tr>
                    <th className="table-header">Item</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header">Price</th>
                    <th className="table-header">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const line = saleLines[item._id] || { quantity: '', unitPrice: item.price || 0 };
                    const quantity = Number(line.quantity || 0);
                    const unitPrice = Number(line.unitPrice || 0);
                    const lineTotal = quantity * unitPrice;

                    return (
                      <tr key={item._id}>
                        <td className="table-cell font-medium text-black">{item.name}</td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min="0"
                            className="input !px-2 !py-1 text-center"
                            value={line.quantity}
                            onChange={(e) => handleSaleInputChange(item._id, 'quantity', e.target.value)}
                          />
                        </td>
                        <td className="table-cell">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input !px-2 !py-1 text-center"
                            value={line.unitPrice}
                            onChange={(e) => handleSaleInputChange(item._id, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td className="table-cell font-semibold text-black">{formatCurrency(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Sale Notes</label>
              <textarea
                className="input min-h-20"
                value={saleNotes}
                onChange={(e) => setSaleNotes(e.target.value)}
                placeholder="Optional notes for this sale"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-black/10">
              <p className="text-lg font-semibold text-black">
                Sale Total: <span className="text-black bg-yellow-100 border border-black rounded-full px-3 py-1 ml-2">{formatCurrency(salePreview.totalAmount)}</span>
              </p>
              <button type="submit" className="btn btn-primary" disabled={savingSale}>
                <FiSave className="w-4 h-4" />
                {savingSale ? 'Saving...' : 'Submit Sale'}
              </button>
            </div>
          </form>
        </div>

        <div className="card border-black/10 p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-black/10 bg-yellow-50/60">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black bg-black text-yellow-400 shadow-sm">
                <FiDollarSign className="w-5 h-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Payment entry</p>
                <h3 className="text-xl font-bold text-black mt-1">Record Payment</h3>
              </div>
            </div>
          </div>

          <form onSubmit={submitPayment} className="space-y-5 p-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Amount Received</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={paymentData.amount}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Payment Method</label>
              <select
                className="input"
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Payment Notes</label>
              <textarea
                className="input min-h-24"
                value={paymentData.notes}
                onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional payment notes"
              />
            </div>

            <button type="submit" className="btn btn-success w-full" disabled={savingPayment}>
              {savingPayment ? 'Saving...' : 'Add Payment'}
            </button>
          </form>
        </div>
      </div>

      <div className="card border-black/10 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-black/10">
          <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Ledger archive</p>
          <h3 className="text-xl font-bold text-black mt-1">Ledger History</h3>
          <p className="text-sm text-black/60 mt-1">Track sales, payments, and notes chronologically for this buyer.</p>
        </div>
        <div className="p-6">
          <DataTable
            columns={ledgerColumns}
            data={ledger.entries || []}
            loading={false}
            emptyMessage="No ledger entries found"
          />
        </div>
      </div>
    </div>
  );
};

export default WholesaleUserLedger;