import SubCategory from "../models/subCategoryModel.js"
import {SubCategorySchema} from "../middlewares/validator.js"
export const addSubCategory=async(req,res)=>{
    const {name}=req.body
    try{
        const {error,value}=SubCategorySchema.validate({name})
        if(error){
            return res.status(400).json({success:false,message:error.details[0].message})
        }
        const isSubCategoryExists=await SubCategory.findOne({name:name})
        if(isSubCategoryExists){
            return res.status(400).json({success:false,message:"SubCategory already exists!"})
        }
        const sCategory=new SubCategory({name:name})
        await sCategory.save()
        return res.status(201).json({success:true,message:"Created!",data:sCategory._id})
    }
    catch(err){
        console.log(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}
export const getsubCategory=async(req,res)=>{
    try{
        const subCategories=await SubCategory.find({})
        res.status(200).json({ success: true, data:subCategories })
    }
    catch(err){
        console.log(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}