import api from './api.js';

const adminService = {
  // ── Orders ─────────────────────────────────────────────────
  getActiveOrders: async () => {
    const res = await api.get('/api/admin/orders');
    return res.data;
  },

  getOrderHistory: async () => {
    const res = await api.get('/api/admin/orders/history');
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await api.patch(`/api/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  // ── Menu categories ────────────────────────────────────────
  getAllCategories: async () => {
    const res = await api.get('/api/admin/menu/categories');
    return res.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/api/admin/menu/categories', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.patch(`/api/admin/menu/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/api/admin/menu/categories/${id}`);
    return res.data;
  },

  // ── Menu items ─────────────────────────────────────────────
  getAllMenuItems: async (categoryId) => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await api.get(`/api/admin/menu/items${params}`);
    return res.data;
  },

  createMenuItem: async (formData) => {
    // formData is a FormData object (includes image file)
    const res = await api.post('/api/admin/menu/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateMenuItem: async (id, formData) => {
    const res = await api.patch(`/api/admin/menu/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteMenuItem: async (id) => {
    const res = await api.delete(`/api/admin/menu/items/${id}`);
    return res.data;
  },

  // ── Shop settings ──────────────────────────────────────────
  getShopSettings: async () => {
    const res = await api.get('/api/menu/shop-settings');
    return res.data;
  },

  updateShopSettings: async (data) => {
    const res = await api.patch('/api/admin/shop/settings', data);
    return res.data;
  },
};

export default adminService;