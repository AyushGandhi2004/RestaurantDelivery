import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const deliveryAddressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  coords: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },
});

const OrderSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    items : {
        type : [orderItemSchema],
        required : true,
        validate : {
            validator : (arr) => arr.length > 0,
            message : 'Order must contain at least one item'
        },
    },
    subtotal : {
        type : Number,
        required : true,
        min : [0, 'Subtotal cannot be negative']
    },
    deliveryFee : {
        type : Number,
        required : true,
        default : 40,
    },
    total : {
        type : Number,
        required : true,
        min : [0, 'Total cannot be negative']
    },
    deliveryAddress : {
        type : deliveryAddressSchema,
        required : true
    },
    chefInstructions :{
        type : String,
        trim : true,
        maxLength : [200, 'Chef instructions cannot exceed 200 characters'],
        default : ''
    },
    status : {
        type : String,
        enum : ['pending', 'paid', 'preparing', 'ready', 'out_for_delivery', 'delivered'],
        default : 'pending'
    },
    paymentId : {
        type : String,
        default : ''
    },
    paymentStatus : {
        type : String,
        enum : ['pending', 'completed', 'failed'],
        default : 'pending'
    },
    riderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        default : null
    }
}, {timestamps : true});

OrderSchema.index({userId : 1, createdAt : -1}); // Index for faster retrieval of user orders sorted by date
OrderSchema.index({status : 1, createdAt : -1}); // Index for faster retrieval of orders by status sorted by date

const Order = mongoose.model('Order', OrderSchema);
export default Order;