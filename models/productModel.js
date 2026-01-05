// import { required } from "joi"
import mongoose from "mongoose"

const productSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },  
    name:{ 
        type:String,
        required:true
    },
    image:[
        {
            url:{
                type:String, 
                required:true
            },
            altText:{
                type:String,
                default: ''
            }
        }
    ],
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    subcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'SubCategory',
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0,
        default: 0
    },
    countInStock:{
        type:Number,
        required:true,
        min:0,
        default:0
    }
    // ,
    // rating:{
    //     type:Number,
    //     default:0
    // },
    // numsReviews:{
    //     type:Number,
    //     default:0
    // }
},{timestamps:true})

const Product=mongoose.model('Product',productSchema)
export default Product