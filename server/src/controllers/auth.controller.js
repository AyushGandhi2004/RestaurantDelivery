import { asyncHandler, generateToken, AppError, sendSuccess } from '../utils/helpers.js';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import User from '../models/User.model.js';

//Validation Chains:

export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({min : 2, max : 50}).withMessage('Name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({min : 6}).withMessage('Password must be at least 6 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),

    validate
];


export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    validate
];


//Controllers:

export const register = asyncHandler(async (req , res) => {
    const { name, email, password, phone } = req.body;

    //check if user already exists
    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new AppError('A user with this email already exists', 400);
    }

    //Create a user and password will be hashed in pre save hook
    const user = await User.create({
        name,
        email,
        passwordHash : password,
        phone,
        role : 'customer'
    })

    const token = generateToken(user._id);

    sendSuccess(res, {token, user}, 'User Registered Successfully', 201);
});


export const login = asyncHandler(async (req, res) => {
    const {email, password } = req.body;

    //Find User and include hashed password for verification
    //(toJson doesn't include passwordHash by default, so we need to select it explicitly)
    const user = await User.findOne({email}).select('+passwordHash');
    if(!user){
        throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    //toJson doesn't include passwordHash, so we can safely return user object
    sendSuccess(res, {token, user}, 'Login Successful');
});


export const getMe = asyncHandler(async (req,res) => {
    //Already attached by the auth middleware
    sendSuccess(res, {user : req.user}, 'User Profile Retrieved');
});

export const updateProfile = asyncHandler(async (req,res) => {
    const { name, phone } = req.body;

    const user = await User.findOneAndUpdate(req.user._id, {name, phone}, {new : true, runValidators : true});

    sendSuccess(res, {user}, 'Profile Updated Successfully');
});


export const addAddress = asyncHandler(async (req,res) => {
    const { label, line1, city, pincode, coords } = req.body;

    const user = await User.findById(req.user._id);

    user.address.push({ label, line1, city, pincode, coords });
    await user.save();

    sendSuccess(res, {address : user.address}, 'Address Added Successfully');
});

