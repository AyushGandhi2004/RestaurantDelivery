import { X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { FREE_DELIVERY_ABOVE } from '../../utils/constants.js';
import CartItem from './CartItem.jsx';
import Button from '../ui/Button.jsx';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, subtotal, deliveryFee, total, cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4
                        border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900">
              Your Cart ({cartCount})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600
                       hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center
                            h-full text-center py-12">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">
                Add items from the menu to get started
              </p>
            </div>
          ) : (
            <div className="py-2">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            {/* Free delivery progress */}
            {subtotal < FREE_DELIVERY_ABOVE && (
              <p className="text-xs text-gray-500 text-center">
                Add{' '}
                <span className="font-semibold text-brand-600">
                  {formatPrice(FREE_DELIVERY_ABOVE - subtotal)}
                </span>{' '}
                more for free delivery
              </p>
            )}

            {/* Price breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900
                              border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={handleCheckout}>
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;