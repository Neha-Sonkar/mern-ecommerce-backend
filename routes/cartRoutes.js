import express from 'express'
import * as cartController from '../controllers/cartController.js'
import identifier from '../middlewares/identifier.js'
const router=express.Router()
 
router.get('/get-cart',identifier,cartController.getCart)
router.delete('/delete-cart',identifier,cartController.deleteCart)

router.post('/add-items-to-cart',identifier,cartController.addItemsToCart)
router.delete('/delete-items-from-cart',identifier,cartController.deleteItemsFromCart)
router.patch('/update-items-of-cart',identifier,cartController.updateItemsOfCart)


export default router 