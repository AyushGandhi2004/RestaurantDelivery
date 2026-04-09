import mongoose from 'mongoose';

const shopSettingsSchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String, // "09:00" 24hr format
      default: '09:00',
    },
    closeTime: {
      type: String,
      default: '23:00',
    },
    banner: {
      type: String,
      trim: true,
      maxlength: [200, 'Banner text cannot exceed 200 characters'],
      default: '',
    },
    specialNotice: {
      type: String,
      trim: true,
      maxlength: [500, 'Special notice cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

const ShopSettings = mongoose.model('ShopSettings', shopSettingsSchema);
export default ShopSettings;