import { Router } from "express";
import { getFullMenu, getCategories, getItemsByCategory, getShopSettings } from "../controllers/menu.controller.js";


const router = Router();

router.get('/', getFullMenu);
router.get('/categories', getCategories);
router.get('items/:categoryId', getItemsByCategory);
router.get('/shop-settings', getShopSettings);



export default router;