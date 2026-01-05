import transport from '../middlewares/sendMails.js'
import Cart from '../models/cartModel.js'
import Product from '../models/productModel.js'
import User from '../models/usersModel.js'

import dotenv from 'dotenv'
dotenv.config()

export const addItemsToCart = async (req, res) => { 
    const { productId, quantity } = req.body
    const user = req.user
    try {
        if (!productId) return res.status(400).json({ success: false, message: "ProductId is required" })
        const checkProduct = await Product.findById(productId)
        if (!checkProduct) return res.status(404).json({ success: false, message: "Product not found" })

        if (checkProduct.countInStock < quantity) return res.status(400).json({ success: false, message: "InSufficient Product Available" })

        let cart = await Cart.findOne({ user: user.userId })

        if (!cart) {
            cart = new Cart({
                user: user.userId,
                items: [{ product: productId, quantity }]
            })
        }
        else {
            const exisitingItemIndex = cart.items.findIndex(item => item.product.toString() === productId)

            if (exisitingItemIndex > -1) {
                const newquantity = cart.items[exisitingItemIndex].quantity + quantity
                if (newquantity > checkProduct.quantity) {
                    return res.status(400).json({ success: false, message: "Insufficient quantity of product available", availableStock: checkProduct.quantity, requestProoductStock: newquantity })
                }
                cart.items[exisitingItemIndex].quantity = newquantity
            }
            else {
                cart.items.push({
                    product: productId,
                    quantity
                })
            }
        }

        await cart.save()

        const productdetails = await Cart.findById(cart._id).populate('items.product', 'name image description price countInStock')

        return res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            cart: productdetails
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

export const deleteItemsFromCart = async (req, res) => {
    const { productid } = req.body
    const user = req.user
    try {
        if (!productid) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            })
        }
        const cart = await Cart.findOne({ user: user.userId })
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found!" })
        }

        const initialLength = cart.items.length
        cart.items = cart.items.filter(item => item.product.toString() !== productid)

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            })
        }
        await cart.save()
        res.status(200).json({
            success: true,
            message: 'Item Deleted successfully',
            cart: cart
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

export const updateItemsOfCart = async (req, res) => {
    const user = req.user
    const { productId, quantity } = req.body
    try {
        if (!productId ) return res.status(400).json({
            success: false,
            message: 'Product ID and quantity are required'
        })
        if (quantity < 0) {
            return res.status(400).json({
                success: false, 
                message: 'Quantity cannot be negative'
            })
        }
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
        const cart = await Cart.findOne({ user: user.userId })
        if (!cart) return res.status(404).json({
            success: false,
            message: 'Cart not found!'
        })

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId)
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            })
        }

        if (quantity === 0) {
            cart.items.splice(itemIndex, 1)
        } else {
            cart.items[itemIndex].quantity = quantity
        }

        await cart.save()
        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            cart: cart
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

export const getCart = async (req, res) => {
    const user = req.user
    try {
        const cart = await Cart.findOne({ user: user.userId }).populate('items.product','name image description price countInStock').exec()
        if (!cart) {
            const newCart=new Cart({user:user.userId,items:[]})
            await newCart.save()

            return res.status(200).json({
                success: true,
                message: 'Empty card created!'
            })
        }

        return res.status(200).json({
                success: true,
                cart:cart,
                totalItems:cart.items.reduce((sum,item)=>sum+item.quantity,0),
                totalPrice:cart.items.reduce((sum,item)=>sum+(item.product.price*item.quantity),0)
            })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

export const deleteCart = async (req, res) => {
    const user = req.user
    try {
        const cart = await Cart.findOne({ user: user.userId })
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            })
        }

        cart.items = []
        await cart.save()
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart: cart
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}