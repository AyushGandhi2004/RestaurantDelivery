import { body } from 'express-validator';
import { asyncHandler, AppError, sendSuccess } from '../utils/helpers.js';
import Review from '../models/Review.model.js';
import Order from '../models/Order.model.js';
import validate from '../middleware/validate.js';

// ── Validation rules ───────────────────────────────────────
export const reviewValidation = [
    body('orderId')
        .notEmpty().withMessage('Order ID is required')
        .isMongoId().withMessage('Invalid order ID'),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
    validate,
]


//POST /api/reviews
export const createReview = asyncHandler(async ( req , res ) => {
    const { orderId, rating, comment } = req.body;
    //1. Find the order:
    const order = await Order.findById(orderId);
    if(!order) throw new AppError(404, 'Order not found');

    if(order.userId.toString() !== req.user._id.toString()) throw new AppError(403, 'You can only review your own orders');

    if(order.status !== 'delivered') throw new AppError(400, 'You can only review delivered orders');

    const existing = await Review.findOne({orderId});
    if(existing) throw new AppError(400, 'You have already reviewed this order');

    const review = await Review.create({
        orderId,
        userId: req.user._id,
        rating: parseInt(rating),
        comment: comment || '',
    });

    sendSuccess(res,{ review }, 'Review created successfully', 201);
});


//GET /api/reviews
// Public — returns all reviews with reviewer's first name
export const getReviews = asyncHandler(async (req , res)=> {
    const reviews = await Review.find()
            .populate('userId', 'name')
            .sort({ createdAt: -1 })
            .lean();
    
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating,0)/reviews.length).toFixed(1) : null;

    sendSuccess(res, {reviews, avgRating, total: reviews.length}, 'Reviews fetched successfully');
});


//GET /api/reviews/order/:orderId
export const getOrderReview = asyncHandler(async (req, res) => {
    const review = await Review.findOne({ orderId: req.params.orderId }).lean();

    sendSuccess(res, { review }, 'Review fetched successfully');
});