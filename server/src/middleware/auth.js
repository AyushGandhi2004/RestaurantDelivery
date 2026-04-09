import jwt from 'jsonwebtoken';
import { config } from '../config/env.js'
import User from '../models/User.model.js'

export const requireAuth = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-passwordHash');
        if(!user){
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            })
        }
        req.user = user;
        next();
    }catch (error){
        next(error);
    }
}