import express from 'express'
import * as categoryController from '../controllers/categoryController.js'
import identifier from '../middlewares/identifier.js'
const router=express.Router()

router.get('/get-category',categoryController.getCategory)
router.post('/add-category',identifier,categoryController.addCategory)
router.delete('/delete-category/:id',identifier,categoryController.deleteCategory)
router.patch('/edit-category/:id',identifier,categoryController.editCategory)
router.get('/get-category-by-id',identifier,categoryController.getCategoryById)
 
export default router  