import { Router } from "express";
import { register, login, registerValidation, loginValidation, getMe, addAddress, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

//Public Routes:
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);


//Protected Routes (require authentication):
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateProfile);
router.post('/address', requireAuth, addAddress);


export default router;