import { Router } from "express";
import { createReview, getReviews, getOrderReview, reviewValidation } from "../controllers/review.controller.js";
import { requireAuth } from '../middleware/auth.js';
import { validObjectId } from "../utils/helpers.js";

const router = Router();

router.get('/', getReviews);

router.post('/', requireAuth, reviewValidation, createReview);
router.get('/order/:orderId', validObjectId('orderId'), requireAuth, getOrderReview);


export default router;