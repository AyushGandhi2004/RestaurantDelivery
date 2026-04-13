import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createPaymentOrder,
  verifyAndCreateOrder,
  createOrderValidation,
  verifyPaymentValidation,
} from '../controllers/payment.controller.js';

const router = Router();

// Both routes require the user to be logged in
router.post(
  '/create-order',
  requireAuth,
  createOrderValidation,
  createPaymentOrder
);

router.post(
  '/verify',
  requireAuth,
  verifyPaymentValidation,
  verifyAndCreateOrder
);

export default router;