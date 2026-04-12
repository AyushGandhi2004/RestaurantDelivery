import api from './api.js';

const menuService = {
  getFullMenu: async () => {
    const res = await api.get('/api/menu');
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/api/menu/categories');
    return res.data;
  },

  getItemsByCategory: async (categoryId) => {
    const res = await api.get(`/api/menu/items/${categoryId}`);
    return res.data;
  },

  getShopSettings: async () => {
    const res = await api.get('/api/menu/shop-settings');
    return res.data;
  },
};

export default menuService;