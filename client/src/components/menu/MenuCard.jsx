import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import OfferBadge from './OfferBadge.jsx';

const MenuCard = ({ item, shopOpen }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const qty = getItemQuantity(item._id);

  return (
    <div className="card flex flex-col overflow-hidden hover:shadow-md
                    transition-shadow duration-200">
      {/* Item image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-gray-300 text-5xl">
            🍽️
          </div>
        )}
        {item.isSpecial && (
          <div className="absolute top-2 left-2">
            <OfferBadge label={item.offerLabel || 'Special'} />
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center
                          justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold
                             px-3 py-1 rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Add / qty controls */}
          {!shopOpen ? (
            <span className="text-xs text-gray-400">Shop closed</span>
          ) : !item.isAvailable ? null : qty === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="flex items-center gap-1 bg-brand-600 text-white
                         text-xs font-medium px-3 py-1.5 rounded-lg
                         hover:bg-brand-700 transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item._id, qty - 1)}
                className="w-7 h-7 rounded-full bg-brand-100 text-brand-700
                           flex items-center justify-center hover:bg-brand-200
                           transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm font-semibold text-gray-900 w-4
                               text-center">
                {qty}
              </span>
              <button
                onClick={() => addToCart(item)}
                className="w-7 h-7 rounded-full bg-brand-600 text-white
                           flex items-center justify-center hover:bg-brand-700
                           transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCard;