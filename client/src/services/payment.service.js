import api from './api.js';

const paymentService = {
  // Step 1 — ask server to create a Razorpay order
  // Server recalculates total from DB prices — client total is never trusted
  createOrder: async ({ cartItems, deliveryAddress, chefInstructions }) => {
    const res = await api.post('/api/payment/create-order', {
      cartItems,
      deliveryAddress,
      chefInstructions,
    });
    return res.data;
  },

  // Step 2 — after Razorpay modal succeeds, verify signature on server
  // Server creates the Order document only after signature is verified
  verifyPayment: async ({ razorpayPaymentId, razorpayOrderId, razorpaySignature, cartItems, deliveryAddress, chefInstructions }) => {
    const res = await api.post('/api/payment/verify', {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      cartItems,
      deliveryAddress,
      chefInstructions,
    });
    return res.data;
  },
};

export default paymentService;