import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { ORDER_STATUS } from '../../utils/constants.js';

const statusColors = {
  gray:   'bg-gray-100 text-gray-700',
  blue:   'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  green:  'bg-green-100 text-green-700',
};

const OrderCard = ({ order }) => {
  const statusInfo = ORDER_STATUS[order.status] || {
    label: order.status,
    color: 'gray',
  };

  return (
    <Link
      to={`/orders/${order._id}/track`}
      className="card p-4 flex items-center gap-4 hover:shadow-md
                 transition-shadow duration-200 group"
    >
      {/* Left — details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </span>
          <span className={`badge ${statusColors[statusInfo.color]}`}>
            {statusInfo.label}
          </span>
        </div>

        <p className="text-sm text-gray-700 truncate">
          {order.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
        </p>

        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(order.total)}
          </span>
          <span className="text-xs text-gray-400">
            {formatDateTime(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Right — arrow */}
      <ChevronRight
        size={18}
        className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0"
      />
    </Link>
  );
};

export default OrderCard;