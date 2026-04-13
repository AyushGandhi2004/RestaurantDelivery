import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import adminService from '../../services/admin.service.js';
import OrderTable from '../../components/admin/OrderTable.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await adminService.getActiveOrders();
      setOrders(data.orders);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Poll every 30 seconds for new orders arriving
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Called by StatusDropdown after a status change
  // Updates the local state instantly — no need to refetch
  const handleStatusUpdated = useCallback((orderId, newStatus) => {
    setOrders((prev) => {
      // Remove delivered orders from active list
      if (newStatus === 'delivered') {
        return prev.filter((o) => o._id !== orderId);
      }
      return prev.map((o) =>
        o._id === orderId ? { ...o, status: newStatus } : o
      );
    });
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Active Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {orders.length} order{orders.length !== 1 ? 's' : ''} in progress
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-gray-600
                     hover:text-brand-600 transition-colors px-3 py-2
                     rounded-lg hover:bg-brand-50 border border-gray-200"
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <OrderTable
            orders={orders}
            onStatusUpdated={handleStatusUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrders;