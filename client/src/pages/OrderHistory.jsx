import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import orderService from '../services/order.service.js';
import OrderCard from '../components/order/OrderCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const OrderHistory = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    orderService.getMyOrders()
      .then((data) => setOrders(data.orders))
      .catch((err)  => setError(err.message))
      .finally(()   => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4
                        text-red-700 text-sm">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Your order history will appear here
          </p>
          <Link
            to="/menu"
            className="bg-brand-600 text-white px-6 py-2 rounded-xl
                       text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;