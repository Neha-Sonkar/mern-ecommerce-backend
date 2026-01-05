import Cart from '../models/cartModel.js'
import User from '../models/usersModel.js'
import Order from '../models/orderModel.js'
import transport from '../middlewares/sendMails.js'
import dotenv from 'dotenv'
dotenv.config()
const calculateShippingPrice = (subtotal) => {
    return subtotal > 500 ? 0 : 12.00
}

const calculateTotalPrice = (itemPrice, taxPrice, shippingPrice) => {
    return itemPrice + taxPrice + shippingPrice
}

const calculateTaxPrice = (totalPrices) => {
    return totalPrices * 0.1
}

const sendOrderConfirmationEmail = async (userEmail, order) => {
    try {
        let info = await transport.sendMail({
            from: process.env.FORGET_PASSWORD_CODE_SENDING_ADDRESS,
            to: userEmail,
            subject: "Order Confirmed!",
            html: `
            <h2>Thank you for your order!</h2>
            <p>Order ID: ${order._id}</p>
            <p>Total: ₹${order.totalPrice}</p>
            <p>Items: ${order.orderItems.map(item => `${item.product.name} (Qty: ${item.quantity})`).join(', ')}</p>
            <p>We will process your order soon.</p>
        `,
        })
        if (info.accepted[0] === userEmail) {
            console.log('Confirmation email sent to', userEmail)
        }
    }
    catch (error) {
        console.error('Email send failed:', error)
    }
}

export const createOrder = async (req, res) => {
    const { name, shoppingAddress, payMethod } = req.body
    const user = req.user
    try {
        const cart = await Cart.findOne({ user: user.userId }).populate('items.product', 'name image description price countInStock').exec()
        if (!cart || cart.items.length === 0) return res.status(404).json({ success: false, message: "Cart not found!" })

        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0)
        const totalPrices = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

        const itemPrice = totalPrices;
        const taxPrice = calculateTaxPrice(totalPrices);
        const shippingPrice = calculateShippingPrice(totalPrices);
        const totalPrice = calculateTotalPrice(itemPrice, taxPrice, shippingPrice)
        const newOrder = new Order({
            user: user.userId,
            name: name,
            orderItems: cart.items,
            shoppingAddress: shoppingAddress,
            payMethod: payMethod,
            itemPrice: itemPrice,
            taxPrice: taxPrice,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice
        })
        const saveOrder = await newOrder.save()
        await sendOrderConfirmationEmail(user.email, saveOrder)
        await Cart.deleteOne({ user: user.userId })

        return res.status(200).json({ success: true, order: saveOrder })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

//updating the order like isDelivered or not
export const updateOrder = async (req, res) => {
    const { id } = req.params
    const { isDelivered } = req.body

    try {
        const order = await Order.findById(id)
        if (!order) return res.status(404).json({ success: false, message: "Order not found!" })

        order.isDelivered = isDelivered
        order.deliverdAt = isDelivered ? new Date() : null

        const updatedOrder = await order.save()
        return res.status(200).json({ success: true, message: "Order Updated", order: updatedOrder })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

//get order details of particular order by their id
export const getOrderById = async (req, res) => {
    const orderId = req.params.id
    try {
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.status(200).json({ success: true, order })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

//get the particular user orders
export const getUserOrder = async (req, res) => {
    const userId = req.params.id;
    try {
        const orders = await Order.find({ user: userId });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to retrieve orders." });
    }
}

//get all the orders in the website
export const getAllOrders = async (req, res) => {
    // const user=req.user
    try {
        // const userlogged=await User.find({user:user.userId})
        // if(!userlogged) return res.status(404).json({ success: false, message: "Admin not found." })
        // if(!userlogged.isAdmin) return res.status(401).json({ success: false, message: "Anuthorized access." })
        const orders = await Order.find()
        if (!orders) {
            return res.status(404).json({ success: false, message: "Orders not found." })
        }
        res.status(200).json({ success: true, orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}