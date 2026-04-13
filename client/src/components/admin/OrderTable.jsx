import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import StatusDropdown from './StatusDropdown.jsx';

const OrderTable = ({ orders, onStatusUpdated }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="font-medium">No active orders right now</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Order</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Items</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Address</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Total</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Time</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <span className="font-mono text-xs text-gray-500">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium text-gray-900">{order.userId?.name}</p>
                <p className="text-xs text-gray-400">{order.userId?.phone}</p>
              </td>
              <td className="py-3 px-4 max-w-xs">
                <p className="text-gray-700 truncate">
                  {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </p>
                {order.chefInstructions && (
                  <p className="text-xs text-amber-600 mt-0.5 truncate italic">
                    Note: {order.chefInstructions}
                  </p>
                )}
              </td>
              <td className="py-3 px-4">
                <p className="text-gray-700 text-xs">
                  {order.deliveryAddress.line1}
                </p>
                <p className="text-gray-400 text-xs">
                  {order.deliveryAddress.city} {order.deliveryAddress.pincode}
                </p>
              </td>
              <td className="py-3 px-4 font-semibold text-gray-900">
                {formatPrice(order.total)}
              </td>
              <td className="py-3 px-4 text-xs text-gray-400 whitespace-nowrap">
                {formatDateTime(order.createdAt)}
              </td>
              <td className="py-3 px-4">
                <StatusDropdown
                  order={order}
                  onStatusUpdated={onStatusUpdated}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;