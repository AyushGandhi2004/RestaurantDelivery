import { asyncHandler, AppError, sendSuccess } from '../utils/helpers.js';
import Order from '../models/Order.model.js';

// GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  sendSuccess(res, { orders }, 'Orders fetched');
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) throw new AppError('Order not found', 404);

  // Ensure the order belongs to the requesting user
  // Admins and delivery users can also view any order
  const isOwner    = order.userId.toString() === req.user._id.toString();
  const isPrivileged = ['admin', 'delivery'].includes(req.user.role);

  if (!isOwner && !isPrivileged) {
    throw new AppError('You are not authorised to view this order', 403);
  }

  sendSuccess(res, { order }, 'Order fetched');
});