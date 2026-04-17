import api from './api.js';

const reviewService = {
  getReviews: async () => {
    const res = await api.get('/api/reviews');
    return res.data;
  },

  getOrderReview: async (orderId) => {
    const res = await api.get(`/api/reviews/order/${orderId}`);
    return res.data;
  },

  createReview: async ({ orderId, rating, comment }) => {
    const res = await api.post('/api/reviews', { orderId, rating, comment });
    return res.data;
  },
};

export default reviewService;