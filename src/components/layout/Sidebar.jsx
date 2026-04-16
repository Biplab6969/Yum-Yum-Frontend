import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiPieChart,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiAlertTriangle,
  FiFileText,
  FiTruck
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/production', icon: FiTruck, label: 'Daily Production' },
    { path: '/admin/items', icon: FiPackage, label: 'Item Management' },
    { path: '/admin/shops', icon: FiShoppingBag, label: 'Shop Monitoring' },
    { path: '/admin/reports', icon: FiPieChart, label: 'Reports' },
    { path: '/admin/users', icon: FiUsers, label: 'User Management' },
    { path: '/admin/audit-logs', icon: FiFileText, label: 'Audit Logs' }
  ];

  const sellerLinks = [
    { path: '/seller/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/seller/transactions', icon: FiDollarSign, label: 'Daily Sales' }
  ];

  const links = isAdmin ? adminLinks : sellerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-secondary-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="font-bold text-secondary-800">Yum Yum</h1>
              <p className="text-xs text-secondary-500">{isAdmin ? 'Admin Panel' : 'Seller Panel'}</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-secondary-200">
          <p className="font-medium text-secondary-800">{user?.name}</p>
          <p className="text-sm text-secondary-500">{user?.email}</p>
          {!isAdmin && user?.shopId && (
            <span className="inline-block mt-2 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
              {user.shopId.name || `Shop ${user.shopId.shopNumber}`}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
