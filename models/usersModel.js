import mongoose from 'mongoose'
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        select:false
    },
    verified:{
        type:Boolean,
        default:false
    },
    verifiedCode:{
        type:String,
        select:false
    },
    verifiedCodeValidationTime:{
        type:Number,
        select:false
    },
    forgetPasswordCode:{
        type:String,
        select:false
    },
    forgetPasswordCodeValidationTime:{
        type:Number,
        select:false
    },
    address:{
        street:{type:String,trim:true},
        city:{type:String,trim:true},
        state:{type:String,trim:true},
        zip:{type:String,trim:true}
    },
    phoneNumber:{
        type:Number,
        trim:true
    },
    AdharCardNumber: {
        type: String, 
        trim: true,
        unique: true 
    }
},{timestamps:true})

const User=mongoose.model('User',userSchema)
export default User