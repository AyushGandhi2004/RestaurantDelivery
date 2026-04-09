import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  line1: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  coords: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        minLength : [2, 'Name must be at least 2 characters long'],
        maxLength : [50, 'Name cannot exceed 50 characters']
    },
    email : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        match : [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    passwordHash : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        enum : ['customer', 'admin', 'delivery'],
        default : 'customer'
    },
    phone : {
        type : String,
        trim : true,
        match : [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
    },
    address : [addressSchema],
    
},{timestamps : true});


UserSchema.pre('save', async function(next){
    if(!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

UserSchema.methods.toJson = function(){
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
}

const User = mongoose.model('User', UserSchema);

export default User;