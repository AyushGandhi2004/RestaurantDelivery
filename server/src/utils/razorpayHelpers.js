import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';

// Initialise the Razorpay SDK instance
export const razorpay = new Razorpay({
  key_id:     config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

// Creates a Razorpay order — returns { id, amount, currency }
// amount must be in paise (₹1 = 100 paise)
export const createRazorpayOrder = async (amountInRupees) => {
  const order = await razorpay.orders.create({
    amount:   Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt:  `rcpt_${Date.now()}`,
  });
  return order;
};

// Verifies the HMAC-SHA256 signature Razorpay sends after payment
// If this check passes, the payment is genuine
export const verifySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  const body      = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected  = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};