import { useState } from 'react';
import { FiMenu, FiBell, FiAlertTriangle } from 'react-icons/fi';
import { useData } from '../../context/DataContext';

const Header = ({ onMenuClick, title }) => {
  const { lowStockAlerts } = useData();
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-black/10 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 gap-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-yellow-50 rounded-lg transition-colors flex-shrink-0 border border-transparent hover:border-black"
        >
          <FiMenu className="w-6 h-6 text-black" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/60 font-semibold hidden sm:block">Yum Yum Control Center</p>
          <h1 className="text-lg sm:text-xl font-semibold text-black truncate">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Low stock alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`relative p-2 rounded-lg transition-colors ${
              lowStockAlerts.length > 0 
                ? 'bg-yellow-100 text-black hover:bg-yellow-200 border border-black' 
                : 'hover:bg-yellow-50 text-black border border-transparent'
            }`}
          >
            <FiBell className="w-5 h-5" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center border border-yellow-400">
                {lowStockAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts dropdown */}
          {showAlerts && lowStockAlerts.length > 0 && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-xl border border-black/10 py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-secondary-200">
                <h3 className="font-semibold text-black">Low Stock Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {lowStockAlerts.map((alert, index) => (
                  <div 
                    key={index}
                    className="px-4 py-3 hover:bg-yellow-50 flex items-center gap-3 transition-colors"
                  >
                    <FiAlertTriangle className={`w-5 h-5 ${
                      alert.status === 'OUT_OF_STOCK' ? 'text-black' : 'text-yellow-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-black">{alert.itemName}</p>
                      <p className="text-xs text-black/70">
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
        <div className="hidden md:block text-sm text-black/70 whitespace-nowrap bg-yellow-50 border border-black rounded-full px-3 py-1">
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
