import { useState, useEffect } from 'react';
import { FiActivity, FiFilter, FiUser, FiCalendar } from 'react-icons/fi';
import { Loading } from '../../components/common';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const actions = [
    'LOGIN',
    'LOGOUT',
    'CREATE_PRODUCTION',
    'UPDATE_PRODUCTION',
    'CREATE_TRANSACTION',
    'UPDATE_TRANSACTION',
    'UPDATE_ITEM_PRICE',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'CLOSE_DAY',
    'EXPORT_REPORT',
    'BACKUP_DATA'
  ];

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getAuditLogs(page, 20, actionFilter);
      setLogs(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      LOGIN: 'bg-yellow-100 text-black border border-black',
      LOGOUT: 'bg-white text-black border border-black',
      CREATE_PRODUCTION: 'bg-white text-black border border-black',
      UPDATE_PRODUCTION: 'bg-white text-black border border-black',
      CREATE_TRANSACTION: 'bg-yellow-100 text-black border border-black',
      UPDATE_TRANSACTION: 'bg-yellow-100 text-black border border-black',
      UPDATE_ITEM_PRICE: 'bg-white text-black border border-black',
      CREATE_USER: 'bg-yellow-100 text-black border border-black',
      UPDATE_USER: 'bg-white text-black border border-black',
      DELETE_USER: 'bg-black text-white border border-black',
      CLOSE_DAY: 'bg-yellow-100 text-black border border-black',
      EXPORT_REPORT: 'bg-white text-black border border-black',
      BACKUP_DATA: 'bg-yellow-100 text-black border border-black'
    };
    return colors[action] || 'bg-white text-black border border-black';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="card bg-black text-white border-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.34),_transparent_38%)]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-300 font-semibold">System trace</p>
            <h2 className="text-3xl font-bold mt-2">Audit Logs</h2>
            <p className="text-white/75 mt-2 max-w-2xl">
              Track all system activities and changes from a clean chronological view.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 rounded-xl border border-black bg-white text-black px-4 py-3 shadow-sm w-full sm:w-auto min-w-[220px]">
              <FiFilter className="w-4 h-4 text-black" />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full border-none bg-transparent p-0 pr-6 text-sm font-semibold focus:ring-0"
              >
                <option value="">All Actions</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Visible logs</p>
          <p className="mt-2 text-3xl font-bold text-black">{logs.length}</p>
          <p className="text-sm text-black/60 mt-1">Entries in the current page</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Current filter</p>
          <p className="mt-2 text-3xl font-bold text-black">{actionFilter || 'All'}</p>
          <p className="text-sm text-black/60 mt-1">Filtered action type</p>
        </div>
        <div className="card border-black/10">
          <p className="text-sm uppercase tracking-[0.2em] text-black/50 font-semibold">Pages</p>
          <p className="mt-2 text-3xl font-bold text-black">{totalPages}</p>
          <p className="text-sm text-black/60 mt-1">Total pages available</p>
        </div>
      </div>

      <div className="card border-black/10 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-black/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-black/50 font-semibold">Activity stream</p>
            <h3 className="text-xl font-bold text-black mt-1">Log Entries</h3>
            <p className="text-sm text-black/60 mt-1">Each card shows the actor, action, and what changed.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black bg-yellow-50 px-3 py-2 text-sm font-semibold text-black w-fit">
            <FiActivity className="w-4 h-4" />
            {page}/{totalPages}
          </div>
        </div>

        {loading ? (
          <Loading text="Loading logs..." />
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-black/60">
            No audit logs found
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {logs.map((log, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-yellow-50"
              >
                <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center border border-black shadow-sm text-yellow-400">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-black/70 text-sm flex items-center gap-1 font-medium">
                      <FiUser className="w-3 h-3" />
                      {log.userId?.name || 'Unknown'}
                    </span>
                    <span className="text-black/50 text-sm flex items-center gap-1 font-medium">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-black mt-1 font-medium">{log.description}</p>
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-3 text-sm space-y-2">
                      {log.oldValue && (
                        <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-black/80">
                          <span className="font-semibold text-black">Old:</span> {JSON.stringify(log.oldValue)}
                        </div>
                      )}
                      {log.newValue && (
                        <div className="rounded-xl border border-black/10 bg-yellow-50 px-3 py-2 text-black/80">
                          <span className="font-semibold text-black">New:</span> {JSON.stringify(log.newValue)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-6 pb-6 pt-2 border-t border-black/10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
