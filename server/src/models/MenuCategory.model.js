import mongoose from "mongoose";

const MenuCategorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        unique : true,
        minLength : [2, 'Category name must be at least 2 characters long'],
        maxLength : [50, 'Category name cannot exceed 50 characters']
    },
    description : {
        type : String,
        trim : true,
        maxLength : [200, 'Description cannot exceed 200 characters']
    },
    image : {
        type : String,
        default : ""
    },
    isActive : {
        type : Boolean,
        default : true
    },
    displayOrder : {
        type : Number,
        default : 0
    }
}, {timestamps : true});

const MenuCategory = mongoose.model('MenuCategory', MenuCategorySchema);
export default MenuCategory;