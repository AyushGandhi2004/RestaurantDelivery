import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../utils/constants.js';

const CartContext = createContext(null);

const CART_KEY = 'restaurant_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage on every change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // ── Derived values ─────────────────────────────────────────
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity, 0
  );

  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  // ── Actions ────────────────────────────────────────────────
  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart`, { duration: 1500 });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i._id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, qty) => {
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((i) => i._id !== itemId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const getItemQuantity = useCallback(
    (itemId) => cartItems.find((i) => i._id === itemId)?.quantity || 0,
    [cartItems]
  );

  const value = {
    cartItems,
    cartCount,
    subtotal,
    deliveryFee,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;