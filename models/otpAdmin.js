import mongoose from 'mongoose'
const otpSchema=new mongoose.Schema({
     email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    otp:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        default:Date.now,
        expires:600
    }
})
const Otp=mongoose.model('Otp',otpSchema)
export default Otp