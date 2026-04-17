import { config } from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // ── Mongoose: duplicate key ────────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // ── Mongoose: validation failed ────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── Mongoose: bad ObjectId ─────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // ── JWT ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expired — please log in again';
  }

  // ── Multer: file too large ─────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message    = 'File too large — maximum size is 10MB';
  }

  // ── Log 500s in production ─────────────────────────────────
  if (statusCode === 500 && config.NODE_ENV === 'production') {
    console.error('SERVER ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;