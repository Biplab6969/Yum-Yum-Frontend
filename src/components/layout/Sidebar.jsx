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
    { path: '/admin/wholesale-users', icon: FiDollarSign, label: 'Wholesale Users' },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-64 bg-white/95 backdrop-blur border-r border-black/10 shadow-2xl z-30 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-black/10 bg-yellow-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-sm border border-black">
              <span className="text-yellow-400 font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="font-bold text-black">Yum Yum</h1>
              <p className="text-xs text-black/60">{isAdmin ? 'Admin Panel' : 'Seller Panel'}</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-black/10">
          <p className="font-medium text-black">{user?.name}</p>
          <p className="text-sm text-black/70">{user?.email}</p>
          {!isAdmin && user?.shopId && (
            <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-black text-xs rounded-full border border-black">
              {user.shopId.name || `Shop ${user.shopId.shopNumber}`}
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 sm:px-4 py-6 flex-1 overflow-y-auto">
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
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-black/10 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-yellow-50 rounded-lg transition-colors border border-black/10 hover:border-black"
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
