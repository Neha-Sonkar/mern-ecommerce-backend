import express from 'express'
import * as authController from "../controllers/userController.js" 
import identifier from '../middlewares/identifier.js'
const router=express.Router()

//for user
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/logout',identifier,authController.logout)
router.patch('/change-password',identifier,authController.changepassword)
router.patch('/forget-password',authController.forgetpassword)
router.patch('/verify-forget-password-code',authController.verifyforgetpasswordcode)

// for admin
router.post('/admin-login',authController.adminlogin)
router.post('/Sign-up-Otp-Send',authController.SignupOtpSend)
router.post('/Signup-Otp-Verification',authController.SignupOtpVerification)
router.post('/complete-Info-Admin',authController.completeInfoAdmin)
router.post('/admin-logout',identifier,authController.adminLogout)


router.get('/me',identifier,(req,res)=>{
    res.status(200).json({success:true,user:req.user})
})
export default router 