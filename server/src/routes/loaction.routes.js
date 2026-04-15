import { Router } from "express";
import { getRiderLocation, updateLocation } from "../controllers/location.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

router.post('/update', requireAuth, requireRole('delivery'), updateLocation);
router.get('/rider', requireAuth, getRiderLocation);


export default router;