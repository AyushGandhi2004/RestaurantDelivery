export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const RESTAURANT = {
  name:    import.meta.env.VITE_RESTAURANT_NAME || 'The Restaurant',
  lat:     parseFloat(import.meta.env.VITE_RESTAURANT_LAT  || '28.6139'),
  lng:     parseFloat(import.meta.env.VITE_RESTAURANT_LNG  || '77.2090'),
  address: 'Connaught Place, New Delhi, 110001',
  phone:   '+91 98765 43210',
};

export const DELIVERY_FEE = 40;
export const FREE_DELIVERY_ABOVE = 299;

export const ORDER_STATUS = {
  pending:          { label: 'Pending',          color: 'gray'   },
  paid:             { label: 'Order Placed',      color: 'blue'   },
  preparing:        { label: 'Preparing',         color: 'yellow' },
  ready:            { label: 'Ready',             color: 'purple' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'orange' },
  delivered:        { label: 'Delivered',         color: 'green'  },
};

export const STATUS_STEPS = [
  { key: 'paid',             label: 'Order Placed'     },
  { key: 'preparing',        label: 'Preparing'        },
  { key: 'ready',            label: 'Ready to Pick Up' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered'        },
];