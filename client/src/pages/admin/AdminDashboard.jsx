import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, UtensilsCrossed, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service.js';
import menuService from '../../services/menu.service.js';
import { formatPrice } from '../../utils/formatters.js';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to || '#'} className="card p-5 flex items-center gap-4
                                   hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center
                     justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [activeOrders,  setActiveOrders]  = useState([]);
  const [history,       setHistory]       = useState({ orders: [], totalRevenue: 0 });
  const [menuCount,     setMenuCount]     = useState(0);
  const [shopOpen,      setShopOpen]      = useState(true);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [activeRes, histRes, menuRes, settingsRes] = await Promise.all([
          adminService.getActiveOrders(),
          adminService.getOrderHistory(),
          adminService.getAllMenuItems(),
          adminService.getShopSettings(),
        ]);
        setActiveOrders(activeRes.orders);
        setHistory(histRes);
        setMenuCount(menuRes.items.length);
        setShopOpen(settingsRes.settings?.isOpen ?? true);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleShop = async () => {
    try {
      await adminService.updateShopSettings({ isOpen: !shopOpen });
      setShopOpen(!shopOpen);
      toast.success(`Shop is now ${!shopOpen ? 'open' : 'closed'}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

        {/* Shop open/close toggle */}
        <button
          onClick={toggleShop}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors border
            ${shopOpen
              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }
          `}
        >
          <Store size={16} />
          Shop is {shopOpen ? 'Open' : 'Closed'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={ShoppingBag}
          label="Active orders"
          value={activeOrders.length}
          color="bg-brand-600"
          to="/admin/orders"
        />
        <StatCard
          icon={TrendingUp}
          label="Total revenue"
          value={formatPrice(history.totalRevenue)}
          color="bg-green-600"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Menu items"
          value={menuCount}
          color="bg-purple-600"
          to="/admin/menu"
        />
        <StatCard
          icon={ShoppingBag}
          label="Delivered orders"
          value={history.orders.length}
          color="bg-blue-600"
        />
      </div>

      {/* Recent active orders preview */}
      {activeOrders.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Orders</h2>
            <Link to="/admin/orders"
              className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {activeOrders.slice(0, 5).map((order) => (
              <div key={order._id}
                className="flex items-center justify-between py-2
                           border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-xs font-mono text-gray-400">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-700">
                    {order.userId?.name} · {formatPrice(order.total)}
                  </p>
                </div>
                <span className="badge bg-yellow-100 text-yellow-700 capitalize">
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;