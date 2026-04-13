import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Package } from 'lucide-react';
import orderService from '../services/order.service.js';
import StatusTimeline from '../components/order/StatusTimeline.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { formatPrice, formatDateTime } from '../utils/formatters.js';
import { RESTAURANT } from '../utils/constants.js';
import useSocket from '../hooks/useSocket.js';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const { id }    = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const { socket, joinOrderRoom } = useSocket();
  const joinedRef = useRef(false);

  // ── Fetch order on mount ───────────────────────────────────
  useEffect(() => {
    orderService.getOrderById(id)
      .then((data) => setOrder(data.order))
      .catch((err)  => setError(err.message))
      .finally(()   => setLoading(false));
  }, [id]);

  // ── Join socket room once socket + order are both ready ────
  useEffect(() => {
    if (!socket || !order || joinedRef.current) return;
    // Skip joining if order is already delivered — no more updates coming
    if (order.status === 'delivered') return;

    joinOrderRoom(id);
    joinedRef.current = true;

    // Confirmation that we joined
    socket.on('room_joined', ({ orderId, status }) => {
      console.log(`Joined room for order ${orderId}, current status: ${status}`);
    });

    // ── Real-time status update ──────────────────────────────
    socket.on('order_status_update', ({ status, updatedAt }) => {
      setOrder((prev) => prev ? { ...prev, status, updatedAt } : prev);

      // Toast message based on the new status
      const messages = {
        preparing:        'Your order is being prepared!',
        ready:            'Your order is ready for pickup!',
        out_for_delivery: 'Your order is out for delivery!',
        delivered:        'Your order has been delivered. Enjoy!',
      };
      if (messages[status]) {
        toast.success(messages[status], { duration: 5000 });
      }
    });

    // Cleanup listeners when component unmounts
    return () => {
      socket.off('room_joined');
      socket.off('order_status_update');
    };
  }, [socket, order, id, joinOrderRoom]);

  // ── Phase 6: rider_location listener wired here ───────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
        <Link to="/orders" className="text-brand-600 underline text-sm">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 font-mono mb-1">
          Order #{order._id.slice(-8).toUpperCase()}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p className="text-sm text-gray-500 mt-1">
          Placed {formatDateTime(order.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status timeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Order Status</h2>
              {order.status !== 'delivered' && (
                <span className="flex items-center gap-1.5 text-xs text-green-600
                                 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full
                                   animate-pulse-dot inline-block" />
                  Live updates on
                </span>
              )}
            </div>
            <StatusTimeline currentStatus={order.status} />
          </div>

          {/* Live map slot — Phase 6 */}
          {order.status === 'out_for_delivery' && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Live Rider Location
              </h2>
              <div className="h-64 bg-gray-100 rounded-xl flex items-center
                              justify-center text-gray-400 text-sm">
                {/* Phase 6: <LiveMap socket={socket} /> */}
                Map coming in Phase 6
              </div>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Items */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-brand-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Items</h3>
            </div>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i}
                  className="flex justify-between text-sm text-gray-700">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery fee</span>
                <span>
                  {order.deliveryFee === 0
                    ? 'FREE'
                    : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-brand-600" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Delivery Address
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.line1},<br />
              {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
            </p>
          </div>

          {/* Chef instructions */}
          {order.chefInstructions && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-brand-600" />
                <h3 className="font-semibold text-gray-900 text-sm">
                  Chef Instructions
                </h3>
              </div>
              <p className="text-sm text-gray-600 italic">
                "{order.chefInstructions}"
              </p>
            </div>
          )}

          {/* Restaurant contact */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-brand-600" />
              <h3 className="font-semibold text-gray-900 text-sm">
                {RESTAURANT.name}
              </h3>
            </div>
            <p className="text-sm text-gray-500">{RESTAURANT.phone}</p>
            <p className="text-xs text-gray-400 mt-1">{RESTAURANT.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;