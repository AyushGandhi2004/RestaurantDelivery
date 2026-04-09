import mongoose from 'mongoose';

const riderLocationSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one document per rider, upserted on every update
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat] — GeoJSON order
        required: true,
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

// The 2dsphere index enables MongoDB geospatial queries
riderLocationSchema.index({ location: '2dsphere' });

const RiderLocation = mongoose.model('RiderLocation', riderLocationSchema);
export default RiderLocation;