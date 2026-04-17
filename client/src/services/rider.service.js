import api from './api.js';

const riderService = {
  // Fetch all active orders — rider sees same data as admin
  // but through the rider-scoped endpoint
  getActiveOrders: async () => {
    const res = await api.get('/api/rider/orders');
    return res.data;
  },

  // Push the rider's current GPS coordinates to the server
  // Server broadcasts to all relevant order Socket.io rooms
  updateLocation: async ({ lat, lng }) => {
    const res = await api.post('/api/rider/location', { lat, lng });
    return res.data;
  },

  // Fetch current rider position — used as map initial state
  getRiderLocation: async () => {
    const res = await api.get('/api/rider/location');
    return res.data;
  },
};

export default riderService;