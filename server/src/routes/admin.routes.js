import { Router } from "express";
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { upload } from '../config/cloudinary.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getAllCategories,
  updateShopSettings,
  getActiveOrders,
  getOrderHistory,
  updateOrderStatus,
  categoryValidation,
  menuItemValidation,
  shopSettingsValidation,
  orderStatusValidation,
} from '../controllers/admin.controller.js';
import { validObjectId } from "../utils/helpers.js";


const router = Router();

//All admin routes require authentication and admin role
router.use(requireAuth, requireRole('admin'));

// Category routes
router.get('/menu/categories', getAllCategories);
router.post('/menu/categories', categoryValidation, createCategory);
router.patch('/menu/categories/:id', validObjectId('id'), categoryValidation, updateCategory);
router.delete('/menu/categories/:id', validObjectId('id'), deleteCategory);

//Menu item routes
router.get('/menu/items', getAllMenuItems);
router.post('/menu/items', upload.single('image'), menuItemValidation, createMenuItem);
router.patch('/menu/items/:id', validObjectId('id'), upload.single('image'), updateMenuItem);
router.delete('/menu/items/:id', validObjectId('id'), deleteMenuItem);

//Shop settings routes
router.patch('/shop/settings', shopSettingsValidation, updateShopSettings);

//Order management routes
router.get('/orders', getActiveOrders);
router.get('/orders/history', getOrderHistory);
router.patch('/orders/:id/status', validObjectId('id'), orderStatusValidation, updateOrderStatus);



export default router;