import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';

import Home          from './pages/Home.jsx';
import MenuPage      from './pages/MenuPage.jsx';
import Login         from './pages/Login.jsx';
import Register      from './pages/Register.jsx';
import NotFound      from './pages/NotFound.jsx';

// Stubs — built in later phases
const CheckoutPage    = () => <div className="p-8 text-center">Checkout — Phase 4</div>;
const OrderTracking   = () => <div className="p-8 text-center">Order Tracking — Phase 5</div>;
const OrderHistory    = () => <div className="p-8 text-center">Order History — Phase 4</div>;
const AdminDashboard  = () => <div className="p-8 text-center">Admin — Phase 5</div>;
const DeliveryDashboard = () => <div className="p-8 text-center">Delivery — Phase 6</div>;

const AppLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<Home />} />
          <Route path="/menu"    element={<MenuPage />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer protected */}
          <Route path="/checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><OrderHistory /></ProtectedRoute>
          } />
          <Route path="/orders/:id/track" element={
            <ProtectedRoute><OrderTracking /></ProtectedRoute>
          } />

          {/* Admin protected */}
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Delivery protected */}
          <Route path="/delivery" element={
            <ProtectedRoute requiredRole="delivery">
              <DeliveryDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AppLayout />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;