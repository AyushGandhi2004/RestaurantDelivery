import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyOrders, getOrderById } from '../controllers/order.controller.js';

const router = Router();

router.get('/mine', requireAuth, getMyOrders);
router.get('/:id',  requireAuth, getOrderById);

export default router;