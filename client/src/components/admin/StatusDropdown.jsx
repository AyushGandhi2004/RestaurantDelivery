import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import adminService from '../../services/admin.service.js';
import toast from 'react-hot-toast';

const NEXT_STATUS = {
  paid:             { value: 'preparing',        label: 'Mark Preparing'        },
  preparing:        { value: 'ready',            label: 'Mark Ready'            },
  ready:            { value: 'out_for_delivery', label: 'Mark Out for Delivery' },
  out_for_delivery: { value: 'delivered',        label: 'Mark Delivered'        },
};

const statusColors = {
  paid:             'bg-blue-100   text-blue-700',
  preparing:        'bg-yellow-100 text-yellow-700',
  ready:            'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100  text-green-700',
};

const statusLabels = {
  paid:             'Order Placed',
  preparing:        'Preparing',
  ready:            'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
};

const StatusDropdown = ({ order, onStatusUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);

  const next = NEXT_STATUS[order.status];

  // No action possible once delivered
  if (!next) {
    return (
      <span className={`badge ${statusColors[order.status]}`}>
        {statusLabels[order.status]}
      </span>
    );
  }

  const handleUpdate = async () => {
    setLoading(true);
    setOpen(false);
    try {
      await adminService.updateOrderStatus(order._id, next.value);
      toast.success(`Order marked as "${statusLabels[next.value]}"`);
      onStatusUpdated(order._id, next.value);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`
          badge ${statusColors[order.status]} cursor-pointer
          flex items-center gap-1 pr-1.5
          hover:opacity-80 transition-opacity disabled:opacity-50
        `}
      >
        {loading ? '…' : statusLabels[order.status]}
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white
                          border border-gray-200 rounded-lg shadow-lg
                          overflow-hidden min-w-max">
            <button
              onClick={handleUpdate}
              className="block w-full text-left px-4 py-2.5 text-sm
                         text-gray-700 hover:bg-brand-50 hover:text-brand-700
                         transition-colors"
            >
              {next.label}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StatusDropdown;