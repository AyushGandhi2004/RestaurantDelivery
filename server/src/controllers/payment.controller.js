import { body } from 'express-validator';
import { asyncHandler, AppError, sendSuccess } from '../utils/helpers.js';
import { createRazorpayOrder, verifySignature } from '../utils/razorpayHelpers.js';
import MenuItem from '../models/MenuItem.model.js';
import Order from '../models/Order.model.js';
import User from '../models/User.model.js';
import { config } from '../config/env.js';
import validate from '../middleware/validate.js';
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from '../utils/constants.js';

// ── Server-side constants ──────────────────────────────────────
const DELIVERY_FEE_AMOUNT  = 40;
const FREE_DELIVERY_ABOVE_AMOUNT = 299;

// ── Validation ─────────────────────────────────────────────────
export const createOrderValidation = [
  body('cartItems')
    .isArray({ min: 1 }).withMessage('Cart must have at least one item'),
  body('cartItems.*.itemId')
    .notEmpty().withMessage('Each cart item must have an itemId')
    .isMongoId().withMessage('Invalid item ID'),
  body('cartItems.*.qty')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.line1')
    .trim().notEmpty().withMessage('Address line 1 is required'),
  body('deliveryAddress.city')
    .trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.pincode')
    .trim().notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
  validate,
];

export const verifyPaymentValidation = [
  body('razorpayPaymentId').notEmpty().withMessage('Payment ID is required'),
  body('razorpayOrderId').notEmpty().withMessage('Order ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Signature is required'),
  body('cartItems').isArray({ min: 1 }).withMessage('Cart items are required'),
  body('deliveryAddress.line1').trim().notEmpty().withMessage('Address is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.pincode').trim().notEmpty().withMessage('Pincode is required'),
  validate,
];

// ── Helpers ────────────────────────────────────────────────────

// Re-fetches item prices from DB and calculates server-side totals
// NEVER trust the price the client sends
const calculateOrderTotals = async (cartItems) => {
  const itemIds = cartItems.map((i) => i.itemId);
  const dbItems = await MenuItem.find({ _id: { $in: itemIds } }).lean();

  // Map for O(1) lookup
  const dbItemMap = {};
  dbItems.forEach((item) => { dbItemMap[item._id.toString()] = item; });

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of cartItems) {
    const dbItem = dbItemMap[cartItem.itemId];
    if (!dbItem) throw new AppError(`Item not found: ${cartItem.itemId}`, 404);
    if (!dbItem.isAvailable) {
      throw new AppError(`"${dbItem.name}" is currently unavailable`, 400);
    }

    const lineTotal = dbItem.price * cartItem.qty;
    subtotal += lineTotal;

    orderItems.push({
      itemId: dbItem._id,
      name:   dbItem.name,
      price:  dbItem.price,
      qty:    cartItem.qty,
      image:  dbItem.images?.[0] || '',
    });
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE_AMOUNT ? 0 : DELIVERY_FEE_AMOUNT;
  const total = subtotal + deliveryFee;

  return { orderItems, subtotal, deliveryFee, total };
};

// ── Controllers ────────────────────────────────────────────────

// POST /api/payment/create-order
// Creates a Razorpay order and returns its ID to the frontend
// Does NOT create an Order document — that happens only after
// payment is verified
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { cartItems, deliveryAddress, chefInstructions } = req.body;

  // Calculate totals server-side
  const { subtotal, deliveryFee, total } = await calculateOrderTotals(cartItems);

  // Create Razorpay order
  const razorpayOrder = await createRazorpayOrder(total);

  sendSuccess(res, {
    razorpayOrderId: razorpayOrder.id,
    amount:          razorpayOrder.amount, // in paise
    currency:        razorpayOrder.currency,
    keyId:           config.RAZORPAY_KEY_ID,
    // Send calculated totals back so the UI can display them
    breakdown: { subtotal, deliveryFee, total },
  }, 'Payment order created');
});

// POST /api/payment/verify
// Verifies the Razorpay signature.
// Only on success does it create the Order document in MongoDB.
export const verifyAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    cartItems,
    deliveryAddress,
    chefInstructions,
  } = req.body;

  // 1. Verify signature — if this fails the payment is fake
  const isValid = verifySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    throw new AppError('Payment verification failed. Please contact support.', 400);
  }

  // 2. Re-calculate totals (user could have tampered with cartItems between steps)
  const { orderItems, subtotal, deliveryFee, total } =
    await calculateOrderTotals(cartItems);

  // 3. Find the delivery rider account
  const rider = await User.findOne({ role: 'delivery' });

  // 4. Build the delivery address — include coords if provided
  const formattedAddress = {
    line1:   deliveryAddress.line1,
    city:    deliveryAddress.city,
    pincode: deliveryAddress.pincode,
    coords: {
      type: 'Point',
      coordinates: [
        parseFloat(deliveryAddress.lng || 0),
        parseFloat(deliveryAddress.lat || 0),
      ],
    },
  };

  // 5. Create the Order document
  const order = await Order.create({
    userId:          req.user._id,
    items:           orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress: formattedAddress,
    chefInstructions: chefInstructions || '',
    status:          'paid',
    paymentId:       razorpayPaymentId,
    paymentStatus:   'completed',
    riderId:         rider?._id || null,
  });

  sendSuccess(
    res,
    { orderId: order._id, order },
    'Payment verified and order placed successfully',
    201
  );
});