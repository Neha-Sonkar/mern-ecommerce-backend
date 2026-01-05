import Category from "../models/categoryModel.js"

export const addCategory=async(req,res)=>{
    const {name,description,parentCategory,featured,image }=req.body;
    const {userId}=req.user
    try{
        const slug=name.toLowerCase().replace(/ /g,'-')
        const existingCategory=await Category.findOne({
            $or:[{name},{slug}]
        })
        if (existingCategory && existingCategory.userId===userId) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        const newcategory=new Category({userId,name,description,parentCategory,featured,image,slug })
        await newcategory.save()
         res.status(201).json({success:true,newcategory,message:"Added the category!"});
    }catch(err){
        console.error(err)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const getCategory=async(req,res)=>{
    try{ 
        const categories=await Category.find().sort({name:1})
        const categoryParent=categories.filter(category=>category.parentCategory==null)
        res.status(201).json({success:true,data:categoryParent});

    }catch(err){
        console.error(err)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const deleteCategory=async(req,res)=>{
    const {id}=req.params
    const {userId}=req.user
    try{
        const category=await Category.findById(id)
        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        if(category.userId!==userId){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this category"
            })
        }
        const hasSubcategories=await Category.exists({parentCategory:id})
        if (hasSubcategories) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete category with subcategories. Delete subcategories first."
            });
        }
        await Category.findByIdAndDelete(id)
        res.status(201).json({success:true,message:"Deleted!!"});
    }catch(err){
        console.error(err)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const editCategory=async(req,res)=>{
    const {id}=req.params
    const {userId}=req.user
    const {name,description,parentCategory,featured,image}=req.body
    try{
        const category=await Category.findById(id)
        if(!category){
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        if(category.userId!==userId){
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this category"
            })
        }
        await Category.findByIdAndUpdate(id,{name,description,parentCategory,featured,image},{new:true})
        res.status(200).json({success:true,message:"Updated!!"});
    }catch(err){
        console.error(err)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
export const getCategoryById=async(req,res)=>{
    try{
        const {userId}=req.user
        const categories=await Category.find({userId})
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories 
        });
    }
    catch(err){
        console.error(err)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}