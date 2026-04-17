import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { getActiveOrders } from '../controllers/admin.controller.js';
import { updateLocation, getRiderLocation } from '../controllers/location.controller.js';

const router = Router();

// All rider routes require auth + delivery role
router.use(requireAuth, requireRole('delivery'));

// ── Orders ─────────────────────────────────────────────────────
// Rider sees the same active orders the admin sees
// but through their own protected route
router.get('/orders', getActiveOrders);

// ── Location ───────────────────────────────────────────────────
// Moved here from /api/location so all rider endpoints
// live under one clearly scoped prefix
router.post('/location', updateLocation);
router.get('/location',  getRiderLocation);

export default router;