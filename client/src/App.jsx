import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

import { AuthProvider }  from './context/AuthContext.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import ProtectedRoute    from './components/ProtectedRoute.jsx';
import Navbar            from './components/Navbar.jsx';
import CartDrawer        from './components/cart/CartDrawer.jsx';

import Home              from './pages/Home.jsx';
import MenuPage          from './pages/MenuPage.jsx';
import Login             from './pages/Login.jsx';
import Register          from './pages/Register.jsx';
import NotFound          from './pages/NotFound.jsx';
import CheckoutPage      from './pages/CheckoutPage.jsx';
import OrderTracking     from './pages/OrderTracking.jsx';
import OrderHistory      from './pages/OrderHistory.jsx';

import AdminLayout       from './pages/admin/AdminLayout.jsx';
import AdminDashboard    from './pages/admin/AdminDashboard.jsx';
import AdminOrders       from './pages/admin/AdminOrders.jsx';
import AdminShopSettings from './pages/admin/AdminShopSettings.jsx';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard.jsx';

// Phase 7 stub
const AdminMenuManager = () => (
  <div className="p-8 text-gray-400">Menu Manager — Phase 7</div>
);

const AppLayout = () => {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/menu"     element={<MenuPage />} />
          <Route path="/login"    element={<Login />} />
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

          {/* Admin — nested layout */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index           element={<AdminDashboard />}    />
            <Route path="orders"   element={<AdminOrders />}       />
            <Route path="menu"     element={<AdminMenuManager />}  />
            <Route path="settings" element={<AdminShopSettings />} />
          </Route>

          {/* Delivery */}
          <Route path="/delivery" element={
            <ProtectedRoute requiredRole="delivery">
              <DeliveryDashboard />
            </ProtectedRoute>
          } />

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
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;