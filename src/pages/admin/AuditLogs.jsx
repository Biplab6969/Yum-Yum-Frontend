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
      LOGIN: 'bg-green-100 text-green-700',
      LOGOUT: 'bg-gray-100 text-gray-700',
      CREATE_PRODUCTION: 'bg-blue-100 text-blue-700',
      UPDATE_PRODUCTION: 'bg-blue-100 text-blue-700',
      CREATE_TRANSACTION: 'bg-purple-100 text-purple-700',
      UPDATE_TRANSACTION: 'bg-purple-100 text-purple-700',
      UPDATE_ITEM_PRICE: 'bg-yellow-100 text-yellow-700',
      CREATE_USER: 'bg-green-100 text-green-700',
      UPDATE_USER: 'bg-yellow-100 text-yellow-700',
      DELETE_USER: 'bg-red-100 text-red-700',
      CLOSE_DAY: 'bg-indigo-100 text-indigo-700',
      EXPORT_REPORT: 'bg-cyan-100 text-cyan-700',
      BACKUP_DATA: 'bg-orange-100 text-orange-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Audit Logs</h2>
          <p className="text-secondary-500 mt-1">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FiFilter className="w-4 h-4 text-secondary-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-secondary-300 rounded-lg"
          >
            <option value="">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="card">
        {loading ? (
          <Loading text="Loading logs..." />
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-secondary-500">
            No audit logs found
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <FiActivity className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-secondary-500 text-sm flex items-center gap-1">
                      <FiUser className="w-3 h-3" />
                      {log.userId?.name || 'Unknown'}
                    </span>
                    <span className="text-secondary-400 text-sm flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <p className="text-secondary-800 mt-1">{log.description}</p>
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-2 text-sm">
                      {log.oldValue && (
                        <span className="text-red-600 mr-2">
                          Old: {JSON.stringify(log.oldValue)}
                        </span>
                      )}
                      {log.newValue && (
                        <span className="text-green-600">
                          New: {JSON.stringify(log.newValue)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-secondary-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
            >
              Previous
            </button>
            <span className="text-secondary-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-secondary-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
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
