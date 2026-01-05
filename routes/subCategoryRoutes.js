import express from 'express'
import *as subCategoryController from '../controllers/subCategoryController.js'
import identifier from '../middlewares/identifier.js'
const router=express.Router() 

router.post('/add-subCategory',subCategoryController.addSubCategory)
router.get('/get-all-subCategories',subCategoryController.getsubCategory)

export default router
  