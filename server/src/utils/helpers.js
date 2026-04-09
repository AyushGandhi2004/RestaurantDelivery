import jwt  from 'jsonwebtoken';
import { config } from '../config/env.js';


//jwt token generator
export const generateToken = (userId) => {
    return jwt.sign({ id : userId}, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
};


//Async handller wrapper
// Wraps any async controller function so you never need to write
// try/catch inside controllers. Errors are forwarded to the
// global errorHandler middleware automatically.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


// ── Custom error class ─────────────────────────────────────────
// Use this to throw errors with a specific HTTP status code
// from anywhere inside a controller:
//   throw new AppError('Not found', 404)
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}



// ── Standard success response ──────────────────────────────────
// Keeps all success responses in the same shape:
// { success: true, message, data }
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};