import { useEffect, useState } from 'react';
import {
  Navigation, NavigationOff, MapPin,
  Package, Phone, Clock,
} from 'lucide-react';
import useLocation from '../../hooks/useLocation.js';
import riderService from '../../services/rider.service.js';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const DeliveryDashboard = () => {
  const {
    isTracking,
    currentCoords,
    error: locationError,
    startTracking,
    stopTracking,
  } = useLocation();

  const [activeOrders, setActiveOrders] = useState([]);
  const [loading,      setLoading]      = useState(true);

  // ── Fetch out-for-delivery orders ─────────────────────────
  const fetchOrders = async () => {
    try {
      const data = await riderService.getActiveOrders();
      setActiveOrders(
        data.orders.filter((o) => o.status === 'out_for_delivery')
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Poll every 30 seconds for newly assigned deliveries
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Stop tracking on unmount
  useEffect(() => {
    return () => { if (isTracking) stopTracking(); };
  }, [isTracking, stopTracking]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Delivery Dashboard
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Start broadcasting your location when you begin a delivery
      </p>

      {/* Location broadcast panel */}
      <div className={`
        card p-5 mb-6 border-2 transition-colors duration-300
        ${isTracking ? 'border-green-400' : 'border-gray-100'}
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isTracking ? 'bg-green-100' : 'bg-gray-100'}
            `}>
              {isTracking
                ? <Navigation size={18} className="text-green-600" />
                : <NavigationOff size={18} className="text-gray-400" />
              }
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Location Broadcast
              </p>
              <p className={`text-xs font-medium ${
                isTracking ? 'text-green-600' : 'text-gray-400'
              }`}>
                {isTracking ? 'Broadcasting live' : 'Not broadcasting'}
              </p>
            </div>
          </div>

          {isTracking && (
            <span className="flex items-center gap-1.5 text-xs
                             text-green-600 font-medium">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full
                               animate-pulse-dot inline-block" />
              Live
            </span>
          )}
        </div>

        {/* Current coordinates display */}
        {currentCoords && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4
                          flex items-center gap-2">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            <p className="text-xs text-gray-600 font-mono">
              {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg
                          px-3 py-2 mb-4 text-xs text-red-700">
            {locationError}
          </div>
        )}

        {/* Start / Stop button */}
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`
            w-full py-3 rounded-xl font-semibold text-sm
            transition-all duration-200 flex items-center
            justify-center gap-2
            ${isTracking
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
            }
          `}
        >
          {isTracking ? (
            <><NavigationOff size={16} /> Stop Broadcasting</>
          ) : (
            <><Navigation size={16} /> Start Broadcasting</>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
          Your location is shared only when broadcasting is active
        </p>
      </div>

      {/* Active deliveries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Active Deliveries</h2>
          <button
            onClick={fetchOrders}
            className="text-xs text-brand-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <Package size={36} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">No active deliveries</p>
            <p className="text-sm mt-1">
              Orders marked "out for delivery" will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order._id} className="card p-4">
                {/* Order header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-400">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="badge bg-orange-100 text-orange-700">
                    Out for Delivery
                  </span>
                </div>

                {/* Customer info */}
                <div className="flex items-start gap-2 mb-2">
                  <Phone size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.userId?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.userId?.phone}
                    </p>
                  </div>
                </div>

                {/* Delivery address */}
                <div className="flex items-start gap-2 mb-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">
                    {order.deliveryAddress.line1},{' '}
                    {order.deliveryAddress.city} —{' '}
                    {order.deliveryAddress.pincode}
                  </p>
                </div>

                {/* Items */}
                <div className="flex items-start gap-2 mb-2">
                  <Package size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                  </p>
                </div>

                {/* Chef instructions */}
                {order.chefInstructions && (
                  <div className="flex items-start gap-2 mb-2">
                    <Clock size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 italic">
                      {order.chefInstructions}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between
                                pt-3 border-t border-gray-100 mt-2">
                  <span className="text-xs text-gray-400">
                    {formatDateTime(order.createdAt)}
                  </span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;