import { asyncHandler, AppError, sendSuccess } from '../utils/helpers.js';
import RiderLocation from '../models/RiderLocation.model.js';
import Order from '../models/Order.model.js';

// POST /api/location/update  (delivery role only)
// Upserts the single rider location doc, then broadcasts
// the new coordinates to every order room that is currently
// out_for_delivery. The customer never queries the DB directly —
// they receive the location through their Socket.io room.
export const updateLocation = asyncHandler(async (req , res) => {
    const { lat, lng } = req.body;

    if(lat == undefined || lng == undefined) {
        throw new AppError('Latitude and longitude are required', 400);
    }
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if(isNaN(parsedLat) || isNaN(parsedLng)) {
        throw new AppError('Latitude and longitude must be valid numbers', 400);
    }

    await RiderLocation.findOneAndUpdate(
        { riderId: req.user._id },
        {
            riderId: req.user._id,
            location : {
                type: 'Point',
                coordinates: [parsedLng, parsedLat]
            }
        },
        { upsert: true, new: true }
    );

    const activeOrders = await Order.find({status: 'out_for_delivery'}).select('_id').lean();

    if(activeOrders.length > 0){
        try {
            const {io} = await import('../../server.js');
            activeOrders.forEach((order) =>{
                io.to(`order_${order._id}`).emit('rider_location',{
                    lat: parsedLat,
                    lng: parsedLng
                });
            });
        } catch (error) {
            console.error('Error broadcasting location update:', error);
        }
    }
    sendSuccess(res,{lat : parsedLat, lng: parsedLng} ,'Location updated successfully');
});

// GET /api/location/rider  (auth required)
// REST fallback — returns the current rider position.
// Used by the tracking page on initial load so the map has
// a starting position before the first socket event arrives.
export const getRiderLocation = asyncHandler(async (req,res) => {
    const location = await RiderLocation.findOne().sort({ updatedAt: -1 }).lean();

    if(!location) {
        throw new AppError('Rider location not available', 404);
    }

    const [lng, lat] = location.location.coordinates;
    sendSuccess(res, { lat, lng , updatedAt: location.updatedAt}, 'Rider location retrieved successfully');
});
