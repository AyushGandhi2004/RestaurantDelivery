import { body } from 'express-validator';
import { asyncHandler, AppError, sendSuccess } from '../utils/helpers.js';
import MenuCategory from '../models/MenuCategory.model.js';
import MenuItem from '../models/MenuItem.model.js';
import ShopSettings from '../models/ShopSettings.model.js';
import Order from '../models/Order.model.js';
import validate from '../middleware/validate.js';
import { invalidateMenuCache, invalidateShopSettingsCache } from '../utils/cacheHelper.js';


//Validation Chains:
export const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ max: 50 }).withMessage('Category name must be at most 50 characters long'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Description must be at most 200 characters long'),

    body('displayOrder')
        .optional()
        .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),

    validate
];

export const menuItemValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Item name is required')
        .isLength({ max: 100 }).withMessage('Item name must be at most 100 characters long'),

    body('categoryId')
        .notEmpty().withMessage('Category ID is required')
        .isMongoId().withMessage('Invalid category ID format'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),

    body('originalPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('Original price must be a non-negative number'),

    body('prepTime')
        .optional()
        .isInt({ min: 0 }).withMessage('Preparation time must be a non-negative integer'),

    validate
];


export const shopSettingsValidation = [
    body('isOpen')
        .optional()
        .isBoolean().withMessage('isOpen must be a boolean value'),

    body('openTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('openTime must be in HH:mm format'),

    body('closeTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('closeTime must be in HH:mm format'),

    body('banner')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Banner URL must be at most 200 characters long'),

    body('specialNotice')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Special notice must be at most 500 characters long'),

    validate
];


export const orderStatusValidation = [
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn([ 'preparing', 'ready', 'out_for_delivery', 'delivered' ]).withMessage('Invalid status value'),

    validate
];

//Category Controllers:
//POST /api/admin/menu/categories:
export const createCategory = asyncHandler(async(req , res) => {
    const { name, description, displayOrder } = req.body;

    const category = await MenuCategory.create({
        name,
        description,
        displayOrder : displayOrder ?? 0,
    });

    await invalidateMenuCache();

    sendSuccess(res, { category }, 'Category created successfully', 201);
});

//PATCH /api/admin/menu/categories/:id:
export const updateCategory = asyncHandler( async (req , res) => {
    const { name, description, displayOrder, isActive } = req.body;

    const category = await MenuCategory.findByIdAndUpdate(req.params.id, {
        name,
        description,
        displayOrder,
        isActive
    }, { new : true, runValidators : true });

    if(!category) throw new AppError('Category not found', 404);

    await invalidateMenuCache();

    sendSuccess(res, { category }, 'Category updated successfully');
});

//DELETE /api/admin/menu/categories/:id:
export const deleteCategory = asyncHandler( async (req , res) => {
    const category = await MenuCategory.findByIdAndDelete(req.params.id);

    if(!category) throw new AppError('Category not found', 404);

    category.isActive = false;
    await category.save();

    await MenuItem.updateMany({ category : req.params.id }, { isActive : false });

    await invalidateMenuCache();

    sendSuccess(res, {}, 'Category deleted successfully');
});


//MENU ITEM CONTROLLERS:
//POST /api/admin/menu/items:
export const createMenuItem = asyncHandler( async (req , res) => {
    const {
        categoryId,
        name,
        description,
        price,
        originalPrice,
        isSpecial,
        offerLabel,
        prepTime,
    } = req.body;

    const category = await MenuCategory.findById(categoryId);
    if(!category || !category.isActive) throw new AppError('Category not found or inactive', 404);

    //If an image was uploaded via multer + cloudinary, it will hold the url in req.file.path
    const images = req.file ? [req.file.path] : [];
    const item = await MenuItem.create({
        categoryId,
        name,
        description,
        price : parseFloat(price),
        originalPrice : originalPrice ? parseFloat(originalPrice) : null,
        images,
        isSpecial : isSpecial === 'true' || isSpecial === true,
        offerLabel : offerLabel || '',
        prepTime : prepTime? parseInt(prepTime) : 20,
    });

    await invalidateMenuCache();
    sendSuccess(res, { item }, 'Menu item created successfully', 201);
});


//PATCH /api/admin/menu/items/:id:
export const updateMenuItem = asyncHandler( async (req , res) => {
    const {
        name,
        description,
        price,
        originalPrice,
        isAvailable,
        isSpecial,
        offerLabel,
        prepTime,
        categoryId,
    } = req.body;

    const updateData = {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && {
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isSpecial !== undefined && {
        isSpecial: isSpecial === 'true' || isSpecial === true,
        }),
        ...(offerLabel !== undefined && { offerLabel }),
        ...(prepTime !== undefined && { prepTime: parseInt(prepTime) }),
        ...(categoryId !== undefined && { categoryId }),
    };

    // If a new image was uploaded
    if (req.file) {
        updateData.$push = { images: req.file.path };
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });
    
    if(!item) throw new AppError('Menu item not found', 404);

    await invalidateMenuCache();

    sendSuccess(res, { item }, 'Menu item updated successfully');
});


//DELETE /api/admin/menu/items/:id:
export const deleteMenuItem = asyncHandler( async (req ,res) => {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, {isAvailable : false}, { new : true });

    if(!item) throw new AppError('Menu item not found', 404);
    await invalidateMenuCache();

    sendSuccess(res, {}, 'Menu item deleted successfully');
});

//GET /api/admin/menu/items: all items including the inActive ones
export const getAllMenuItems = asyncHandler( async (req ,res) => {
    const {categoryId} = req.query;

    const filter = categoryId ? { categoryId } : {};
    const items = await MenuItem.find(filter)
                .populate('categoryId', 'name')
                .sort({ createdAt : -1 })
                .lean();

    sendSuccess(res, { items }, 'Menu items retrieved successfully');
});

//GET /api/admin/menu/categories : all categories including the inActive ones
export const getAllCategories = asyncHandler( async (req ,res) => {
    const categories = await MenuCategory.find().sort({ displayOrder : 1 }).lean();
    sendSuccess(res, { categories }, 'Categories retrieved successfully');
});



//SHOP SETTINGS CONTROLLERS:
//PATCH /api/admin/shop/settings:
export const updateShopSettings = asyncHandler( async (req , res) => {
    const { isOpen, openTime, closeTime, banner, specialNotice } = req.body;

    const settings = await ShopSettings.findOneAndUpdate(
        {}, // Assuming there's only one settings document
        { isOpen, openTime, closeTime, banner, specialNotice },
        { new: true, upsert: true, runValidators: true }
    );
    await invalidateShopSettingsCache();
    sendSuccess(res, { settings }, 'Shop settings updated successfully');
});



//ORDER MANAGEMENT CONTROLLERS:

//GET /api/admin/orders - Active Orders
export const getActiveOrders = asyncHandler( async (req , res) => {
    const orders = await Order.find({
        status : { $nin : ['delivered', 'pending']},
    }).populate('userId', 'name email phone').sort({ createdAt : -1 }).lean();

    sendSuccess(res, { orders }, 'Active orders retrieved successfully');
});

//GET /api/admin/orders/history
export const getOrderHistory = asyncHandler( async (req, res) => {
    const orders = await Order.find({status : 'delivered'})
                    .populate('userId', 'name email phone')
                    .sort({ createdAt : -1 })
                    .lean();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice,0);
    sendSuccess(res, { orders }, 'Order history retrieved successfully');
});

//PATCH api/admin/oreders/:id/status
//Socket.io phase emit will be added later
export const updateOrderStatus = asyncHandler( async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findById(id);
    if(!order) throw new AppError('Order not found', 404);

    const transitions = {
        paid : ['preparing'],
        preparing : ['ready'],
        ready : ['out_for_delivery'],
        out_for_delivery : ['delivered'],
    };

    const allowed = transitions[order.status];
    if(!allowed || !allowed.includes(status)) {
        throw new AppError(`Invalid status transition from ${order.status} to ${status}`, 400);
    }

    order.status = status;
    await order.save();

    //Emit Real Time Update to order room:
    try {
        const { io } = await import('../../server.js');
        io.to(`order_${id}`).emit('orderStatusUpdate', {status, updatedAt : order.updatedAt });
        console.log(`Emitted order status update to room order_${id}: ${status}`);
    } catch (error) {
        console.log('Socket emit error : ', error.message);
    }

    sendSuccess(res, { order }, 'Order status updated successfully');
})