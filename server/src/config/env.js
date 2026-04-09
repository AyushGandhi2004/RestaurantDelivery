import dotenv from 'dotenv';

dotenv.config();

const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'REDIS_URL',
    'REDIS_TOKEN'
];

for (const key of required) {
    if (!process.env[key]) {
        console.error(`Error: Missing required environment variable ${key}`);
        process.exit(1);
    }
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@restaurant.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
  DELIVERY_EMAIL: process.env.DELIVERY_EMAIL || 'rider@restaurant.com',
  DELIVERY_PASSWORD: process.env.DELIVERY_PASSWORD || 'Rider@123',
};