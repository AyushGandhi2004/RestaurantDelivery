import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMyOrders, getOrderById } from '../controllers/order.controller.js';
import { validObjectId } from '../utils/helpers.js';

const router = Router();

router.get('/mine', requireAuth, getMyOrders);
router.get('/:id', validObjectId('id'), requireAuth, getOrderById);

export default router;