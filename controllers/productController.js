import Product from '../models/productModel.js'
import Category from '../models/categoryModel.js'
import { productSchema } from '../middlewares/validator.js'

export const addProduct = async (req, res) => {
    const user = req.user
    const { name, image, description, brand, category, subcategory, price, countInStock } = req.body
    try {
        const { error, value } = productSchema.validate({ name, image, description, brand, category, subcategory, price, countInStock })

        if (error) return res.status(400).json({ success: false, message: error.details[0].message })
        
        if(!Array.isArray(image) || image.length===0){
            return res.status(400).json({success: false, newproduct, message: "At least one image is required"})
        }
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            })
        }
        const existingProduct = await Product.findOne({ 
            name: name.trim(),
            category: category 
        })
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: `Product "${name}" already exists in this category`
            })
        }
        const newproduct = new Product({ user: user.userId, name:name, image:image.map(img=>({
            url:img.url,
            altText:img.altText || name
        })), description, brand, category, subcategory, price, countInStock })
        await newproduct.save()
        res.status(201).json({ success: true, newproduct, message: "Added the product!" });

    } catch (err) { 
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find()
        res.status(201).json({ success: true, products })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getProductById = async (req, res) => {
    const { id } = req.params
    try {
        const products = await Product.findById(id)
        if (!products) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(201).json({ success: true, data: products })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getProductWithCategory = async (req, res) => {
    const { id } = req.params
    try {
        const products = await Product.find({ category: id })
        if (!products) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(201).json({ success: true, data: products })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getProductWithSubCategory = async (req, res) => {
    const { id } = req.params
    try {
        const products = await Product.find({ subcategory: id })
        if (!products) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(201).json({ success: true, data: products })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const deleteProduct = async (req, res) => {
    const { productId } = req.params
    const user = req.user
    const {categoryOfProduct}=req.body
    
    try {
        const product=await Product.findOne({user:user.userId,_id:productId,category:categoryOfProduct})
        if(!product){
            return res.status(400).json({ 
                success: false, 
                message: "Product not found or access denied!"
            })
        }
        await Product.findOneAndDelete({user:user.userId,_id:productId,category:categoryOfProduct})

        res.status(200).json({ success: true, message: "Deleted!!" });
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const updateProduct = async (req, res) => {
    const {data}=req.body
    const {categoryOfProduct,productData}=data
    const { name, image, description, brand, category, subcategory, price, countInStock } = productData
    const { productId } = req.params
    const user = req.user
    try {
        const product = await Product.findOne({user:user.userId,_id:productId,category:categoryOfProduct})

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await Product.findByIdAndUpdate(productId, { name, image, description, brand, category, subcategory, price, countInStock }, { new: true })
        res.status(200).json({ success: true, message: "Updated!!" });
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const search = async (req, res) => {
    const { query } = req.query
    if (!query) {
        return res.status(400).json({ success: false, message: "Query is required" });
    }
    try {
        const words = query.trim().split(/\s+/)
        const regexConditions = words.map(word => {
            const regex = new RegExp(word, 'i')
            return {
                $or: [
                    { name: regex },
                    { description: regex },
                    { brand: regex },
                    { slug: regex }
                ]
            }
        })

        const products = await Product.find({
            $and: regexConditions
        })
        res.status(200).json({ success: true, data: products })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

export const getProductByAdminId=async(req,res)=>{
    const {categoryId}=req.query
    const {userId}=req.user
    try {
        if (!categoryId) {
            return res.status(400).json({ 
                success: false, 
                message: "Category ID is required" 
            })
        }
        const categoryExists=await Category.findById(categoryId)
        if (!categoryExists) {
            return res.status(404).json({ 
                success: false, 
                message: "Category not found" 
            })
        }
        const products = await Product.find({ user: userId,category: categoryId })
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}