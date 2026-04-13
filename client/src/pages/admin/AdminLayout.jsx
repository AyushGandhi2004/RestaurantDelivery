import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Settings, LogOut, ChefHat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
      transition-colors
      ${isActive
        ? 'bg-brand-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-gray-100
                        flex flex-col px-3 py-4">
        <div className="flex items-center gap-2 px-3 mb-6">
          <ChefHat size={20} className="text-brand-600" />
          <span className="font-semibold text-gray-900 text-sm">Admin Panel</span>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem to="/admin"         icon={LayoutDashboard} label="Dashboard"   />
          <NavItem to="/admin/orders"  icon={ShoppingBag}     label="Orders"      />
          <NavItem to="/admin/menu"    icon={UtensilsCrossed} label="Menu"        />
          <NavItem to="/admin/settings" icon={Settings}       label="Shop Settings" />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;