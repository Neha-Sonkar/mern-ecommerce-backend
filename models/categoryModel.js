import mongoose from "mongoose";

const categorySchema=new mongoose.Schema({
    userId:{type:String,required:true},
    name:{type:String,required:true},
    description: {type: String,default: ""}, 
    featured:{type:Boolean,default:false},
    slug:{type:String,required:true,unique:true},
    parentCategory:{type:mongoose.Schema.Types.ObjectId,ref:'Category',default:null},
    image:{ type: String, default: '' },

},{timestamps:true})

const Category=mongoose.model('Category',categorySchema)  
export default Category 