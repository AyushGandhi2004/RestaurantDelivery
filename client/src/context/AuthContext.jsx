import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ── Rehydrate user on mount ──────────────────────────────────
  useEffect(() => {
    const rehydrate = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) { setLoading(false); return; }
      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch {
        // Token is invalid or expired — clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    rehydrate();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────
  const saveSession = (token, user) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  };

  // ── Actions ───────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    saveSession(data.token, data.user);
    toast.success(`Welcome, ${data.user.name}!`);
    return data;
  }, []);

  const login = useCallback(async (formData) => {
    const data = await authService.login(formData);
    saveSession(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin:    user?.role === 'admin',
    isDelivery: user?.role === 'delivery',
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;