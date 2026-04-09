import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.model.js';
import ShopSettings from '../models/ShopSettings.model.js';

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // ── Admin account ──────────────────────────────────────────
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@restaurant.com',
        passwordHash: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        phone: '9000000001',
      });
      console.log('Admin account created');
    } else {
      console.log('Admin account already exists — skipping');
    }

    // ── Delivery account ───────────────────────────────────────
    const existingRider = await User.findOne({ role: 'delivery' });
    if (!existingRider) {
      await User.create({
        name: 'DeliveryRider',
        email: process.env.DELIVERY_EMAIL || 'rider@restaurant.com',
        passwordHash: process.env.DELIVERY_PASSWORD || 'Rider@123',
        role: 'delivery',
        phone: '9000000002',
      });
      console.log('Delivery account created');
    } else {
      console.log('Delivery account already exists — skipping');
    }

    // ── Shop settings ──────────────────────────────────────────
    const existingSettings = await ShopSettings.findOne();
    if (!existingSettings) {
      await ShopSettings.create({
        isOpen: true,
        openTime: '09:00',
        closeTime: '23:00',
        banner: 'Welcome! Free delivery on orders above ₹299',
        specialNotice: '',
      });
      console.log('Shop settings created');
    } else {
      console.log('Shop settings already exist — skipping');
    }

    console.log('\nSeeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();