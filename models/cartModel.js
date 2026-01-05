import mongoose, { mongo } from "mongoose"

export const cartItemSchema=new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Product'
    },
    quantity:{type:Number,required:true}
})

const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    items:[cartItemSchema]
},{timestamps:true})

const Cart=mongoose.model('Cart',cartSchema) 
export default Cart