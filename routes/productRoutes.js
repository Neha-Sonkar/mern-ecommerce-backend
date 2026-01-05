import express from 'express'
import *as productController from '../controllers/productController.js'
import identifier from '../middlewares/identifier.js'
const router=express.Router() 

router.post('/add-product',identifier,productController.addProduct)
router.get('/get-all-products',productController.getAllProduct)
router.get('/get-all-product-bycategory/:id',productController.getProductWithCategory)
router.get('/get-all-product-bysubcategory/:id',productController.getProductWithSubCategory)
router.delete('/delete-product/:productId',identifier,productController.deleteProduct)
router.patch('/update-product/:productId',identifier,productController.updateProduct)
router.get('/search',productController.search)
router.get('/get-product-by-id/:id',identifier,productController.getProductById)
router.get('/get-all-product-by-adminId',identifier,productController.getProductByAdminId)

export default router
  