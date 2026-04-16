import { useState } from 'react';
import { FiMenu, FiBell, FiAlertTriangle } from 'react-icons/fi';
import { useData } from '../../context/DataContext';

const Header = ({ onMenuClick, title }) => {
  const { lowStockAlerts } = useData();
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <FiMenu className="w-6 h-6 text-secondary-600" />
        </button>
        <h1 className="text-xl font-semibold text-secondary-800">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Low stock alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`relative p-2 rounded-lg transition-colors ${
              lowStockAlerts.length > 0 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'hover:bg-secondary-100 text-secondary-600'
            }`}
          >
            <FiBell className="w-5 h-5" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts dropdown */}
          {showAlerts && lowStockAlerts.length > 0 && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-secondary-200">
                <h3 className="font-semibold text-secondary-800">Low Stock Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {lowStockAlerts.map((alert, index) => (
                  <div 
                    key={index}
                    className="px-4 py-3 hover:bg-secondary-50 flex items-center gap-3"
                  >
                    <FiAlertTriangle className={`w-5 h-5 ${
                      alert.status === 'OUT_OF_STOCK' ? 'text-red-500' : 'text-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-secondary-800">{alert.itemName}</p>
                      <p className="text-xs text-secondary-500">
                        Stock: {alert.currentStock} / Threshold: {alert.threshold}
                      </p>
                    </div>
                    <span className={`ml-auto badge ${
                      alert.status === 'OUT_OF_STOCK' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {alert.status === 'OUT_OF_STOCK' ? 'Out' : 'Low'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date display */}
        <div className="hidden sm:block text-sm text-secondary-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
