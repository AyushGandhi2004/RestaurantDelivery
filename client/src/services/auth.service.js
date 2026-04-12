import api from './api.js';

const authService = {
  register: async ({ name, email, password, phone }) => {
    const res = await api.post('/api/auth/register', {
      name, email, password, phone,
    });
    return res.data;
  },

  login: async ({ email, password }) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/api/auth/me', data);
    return res.data;
  },

  addAddress: async (address) => {
    const res = await api.post('/api/auth/address', address);
    return res.data;
  },
};

export default authService;