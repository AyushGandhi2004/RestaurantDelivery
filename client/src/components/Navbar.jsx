import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ChefHat, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { RESTAURANT } from '../utils/constants.js';

const Navbar = ({ onCartOpen }) => {
  const { isAuthenticated, user, logout, isAdmin, isDelivery } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-brand-600">
            <ChefHat size={24} />
            <span className="hidden sm:block">{RESTAURANT.name}</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/menu"
              className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Menu
            </Link>
            {isAuthenticated && !isAdmin && !isDelivery && (
              <Link to="/orders"
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin"
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                Dashboard
              </Link>
            )}
            {isDelivery && (
              <Link to="/delivery"
                className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                Deliveries
              </Link>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Cart — only for customers */}
            {!isAdmin && !isDelivery && (
              <button
                onClick={onCartOpen}
                className="relative p-2 text-gray-600 hover:text-brand-600
                           hover:bg-brand-50 rounded-lg transition-colors"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white
                                   text-xs font-bold rounded-full h-5 w-5
                                   flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Hi, {user?.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600
                             hover:text-red-600 transition-colors p-2 rounded-lg
                             hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-brand-600
                             px-3 py-2 rounded-lg hover:bg-brand-50 transition-colors">
                  Login
                </Link>
                <Link to="/register"
                  className="text-sm font-medium bg-brand-600 text-white
                             px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-brand-600
                         rounded-lg hover:bg-brand-50 transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1
                          animate-fade-in">
            <Link to="/menu" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50
                         hover:text-brand-600 rounded-lg transition-colors">
              Menu
            </Link>
            {isAuthenticated && !isAdmin && !isDelivery && (
              <Link to="/orders" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50
                           hover:text-brand-600 rounded-lg transition-colors">
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50
                           hover:text-brand-600 rounded-lg transition-colors">
                Dashboard
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600
                           hover:bg-red-50 rounded-lg transition-colors">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-brand-50
                             rounded-lg transition-colors">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm text-brand-600 font-medium
                             hover:bg-brand-50 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;