import mongoose from 'mongoose';
import mangoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        minLength : [2, 'Item name must be at least 2 characters long'],
        maxLength : [50, 'Item name cannot exceed 50 characters']
    },
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'MenuCategory',
        required : true
    },
    description : {
        type : String,
        trim : true,
        maxLength : [200, 'Description cannot exceed 200 characters']
    },
    price : {
        type : Number,
        required : true,
        min : [0, 'Price cannot be negative']
    },
    originalPrice : {
        type : Number,
        min : [0, 'Original price cannot be negative'],
        default : null
    },
    images : {
        type : [String],
        default : []
    },
    isAvailable : {
        type : Boolean,
        default : true
    },
    isSpecial : {
        type : Boolean,
        default : false
    },
    offerLabel : {
        type : String,
        trim : true,
        maxLength : [50, 'Offer label cannot exceed 50 characters'],
        default : ""
    },
    prepTime : {
        type : Number,
        default : 15, // default preparation time in minutes
        min : [1, 'Preparation time cannot be negative']
    }
}, {timestamps : true});

MenuItemSchema.index({categoryId : 1, isAvailable : 1}); // Compound index for faster queries by category and availability

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
export default MenuItem;