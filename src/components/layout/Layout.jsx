import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { DataProvider } from '../../context/DataContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/wholesale-users/')) {
      return 'Wholesale Ledger';
    }

    const titles = {
      '/admin/dashboard': 'Dashboard',
      '/admin/production': 'Daily Production',
      '/admin/items': 'Item Management',
      '/admin/shops': 'Shop Monitoring',
      '/admin/reports': 'Reports & Analytics',
      '/admin/users': 'User Management',
      '/admin/wholesale-users': 'Wholesale User Management',
      '/admin/audit-logs': 'Audit Logs',
      '/seller/dashboard': 'Dashboard',
      '/seller/transactions': 'Daily Sales'
    };
    return titles[path] || 'Dashboard';
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-secondary-50 overflow-x-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        <div className="lg:ml-64 min-w-0">
          <Header 
            onMenuClick={() => setSidebarOpen(true)} 
            title={getPageTitle()}
          />
          
          <main className="p-4 sm:p-6 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

export default Layout;
