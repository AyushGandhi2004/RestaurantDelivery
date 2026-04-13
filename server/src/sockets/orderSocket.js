import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import Order from '../models/Order.model.js';

export const initOrderSocket = (io) => {
  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ── Authenticate the socket ──────────────────────────────
    // JWT is passed in the handshake auth object from the client:
    // socket = io(URL, { auth: { token } })
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log(`Socket ${socket.id} has no token — disconnecting`);
      socket.emit('auth_error', { message: 'No token provided' });
      socket.disconnect();
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET);
    } catch {
      console.log(`Socket ${socket.id} has invalid token — disconnecting`);
      socket.emit('auth_error', { message: 'Invalid token' });
      socket.disconnect();
      return;
    }

    // Attach userId to the socket for use in event handlers
    socket.userId = decoded.id;
    console.log(`Socket authenticated: user ${socket.userId}`);

    // ── joinOrderRoom ────────────────────────────────────────
    // Customer emits this after landing on /orders/:id/track
    // Server validates ownership then joins the private room
    socket.on('joinOrderRoom', async ({ orderId }) => {
      try {
        if (!orderId) {
          socket.emit('room_error', { message: 'orderId is required' });
          return;
        }

        const order = await Order.findById(orderId).lean();

        if (!order) {
          socket.emit('room_error', { message: 'Order not found' });
          return;
        }

        // Only the order owner (or admin/delivery) can join the room
        const isOwner = order.userId.toString() === socket.userId;
        if (!isOwner) {
          socket.emit('room_error', { message: 'Not authorised' });
          return;
        }

        const room = `order_${orderId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);

        // Confirm to client that they successfully joined
        socket.emit('room_joined', { orderId, status: order.status });
      } catch (err) {
        console.error('joinOrderRoom error:', err.message);
        socket.emit('room_error', { message: 'Failed to join room' });
      }
    });

    // ── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};