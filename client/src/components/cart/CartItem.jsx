import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/formatters.js';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100
                    last:border-0">
      {/* Image */}
      <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.name}
               className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-2xl">🍽️</div>
        )}
      </div>

      {/* Name + price */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-brand-600 font-semibold">
          {formatPrice(item.price)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => updateQuantity(item._id, item.quantity - 1)}
          className="w-6 h-6 rounded-full bg-gray-100 flex items-center
                     justify-center hover:bg-gray-200 transition-colors"
        >
          {item.quantity === 1
            ? <Trash2 size={12} className="text-red-500" />
            : <Minus  size={12} className="text-gray-600" />
          }
        </button>
        <span className="text-sm font-semibold w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item._id, item.quantity + 1)}
          className="w-6 h-6 rounded-full bg-brand-600 text-white
                     flex items-center justify-center hover:bg-brand-700
                     transition-colors"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;