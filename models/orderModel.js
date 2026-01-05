import mongoose, { mongo } from "mongoose"
import {cartItemSchema} from './cartModel.js'
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId, 
        required:true,
        ref:'User' 
    },
    name: { type: String, required: true },
    orderItems:[cartItemSchema],
    shoppingAddress:{
        address:{type:String,required:true},
        city:{type:String,required:true},
        postalCode:{type:String,required:true},
        country:{type:String,required:true}
    },
    payMethod:{type:String,required:true},
    // paymentResult:{ 
    //     id:{type:String},
    //     status:{type:String},
    //     update_time:{type:String},
    //     email_address:{type:String}
    // },
    itemPrice:{type:Number,required:true,default:0.0},
    taxPrice:{type:Number,required:true,default:0.0},
    shippingPrice:{type:Number,required:true,default:0.0},
    totalPrice:{type:Number,required:true,default:0.0},
    isPaid:{type:Boolean,required:true,default:false},
    paidAt:{type:Date},
    isDelivered:{type:Boolean,required:true,default:false},
    deliverdAt:{type:Date}
},{timestamps:true})

const Orders=mongoose.model('Order',orderSchema)
export default Orders