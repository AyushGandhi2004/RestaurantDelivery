import api from './api.js';

const orderService = {
  getMyOrders: async () => {
    const res = await api.get('/api/orders/mine');
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/api/orders/${id}`);
    return res.data;
  },
};

export default orderService;