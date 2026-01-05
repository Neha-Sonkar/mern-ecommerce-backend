import express from 'express'
import * as orderController from '../controllers/orderController.js'
import identifier from '../middlewares/identifier.js'

const router=express.Router()

router.post('/create-order',identifier,orderController.createOrder)
router.patch('/update-order/:id',identifier,orderController.updateOrder)
router.get('/get-order-by-id/:id',identifier,orderController.getOrderById)
router.get('/get-user-order/:id',identifier,orderController.getUserOrder)
router.get('/get-all-order',orderController.getAllOrders)

export default router   