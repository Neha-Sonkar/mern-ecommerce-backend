import User from '../models/usersModel.js'
import Admin from '../models/adminModel.js'
import { signupSchema, changepasswordSchema, forgetpasswordSchema, verifyforgetpasswordSchema, verifyotpadminSchema, AdminInfo } from '../middlewares/validator.js'
import { dohash, doHashValidation, hmacProcess } from '../middlewares/hashing.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import transport from '../middlewares/sendMails.js'
import dotenv from 'dotenv'
import path from 'path'
import Otp from '../models/otpAdmin.js'
dotenv.config()

//for user
export const signup = async (req, res) => {
    const { email, password, isAdmin } = req.body
    try {
        const { error, value } = signupSchema.validate({ email, password })
        if (error) {
            return res.status(400).json({ success: true, message: "Input valid credentials!" })
        }
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists!' })
        }
        const hashedPassword = await dohash(password, 10)
        const newuser = new User({
            email, password: hashedPassword, isAdmin
        })
        const user = await newuser.save()
        user.password = undefined
        return res.status(201).json({ success: true, message: "User have been successfully singup!" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const { error, value } = signupSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await User.findOne({ email }).select('+password')
        if (!existingUser) return res.status(401).json({ success: false, message: 'User not exists!' })

        const result = await doHashValidation(password, existingUser.password)
        if (!result) return res.status(401).json({ success: false, message: 'Invalid credentials!' })

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.TOKEN_SECRET, { expiresIn: '30d' })

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/'
            })
            .json({
                success: true,
                user: {
                    _id: existingUser._id,
                    email: existingUser.email,
                    verified: existingUser.verified
                },
                token,
                message: 'Logged in successfully'
            })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const logout = async (req, res) => {
    try {
        res
            .clearCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: true,
                path: '/'
            })
            .status(200).json({ success: true, message: 'Logout successfully!' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const changepassword = async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const { userId } = req.user
    try {
        const { error, value } = changepasswordSchema.validate({ oldpassword, newpassword })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })
        const existingUser = await User.findById(userId).select('+password')
        if (!existingUser) return res.status(401).json({ success: false, message: 'User not exists!' })

        const result = await doHashValidation(oldpassword, existingUser.password)
        if (!result) return res.status(401).json({ success: false, message: 'Invalid credentials' })
        const hashedPassword = await dohash(newpassword, 10)
        existingUser.password = hashedPassword
        await existingUser.save()
        return res.status(200).json({ success: true, message: 'Password updated' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}
 
export const forgetpassword = async (req, res) => {
    const { email } = req.body
    try {
        const { error, value } = forgetpasswordSchema.validate({ email })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })
        const existingUser = await User.findOne({ email })
        if (!existingUser) return res.status(401).json({ success: false, message: 'User not exists!' })

        const code = crypto.randomInt(1000, 10000).toString()

        let info = await transport.sendMail({
            from: process.env.FORGET_PASSWORD_CODE_SENDING_ADDRESS,
            to: existingUser.email,
            subject: "Verification Code",
            html: `<h2>Your verification code is : ${code}</h2>`
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedcode = await hmacProcess(code, process.env.HMAC_CODE_SECRET)
            existingUser.forgetPasswordCode = hashedcode
            existingUser.forgetPasswordCodeValidationTime = Date.now()
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'Code Sent' })
        }
        return res.status(500).json({ success: false, message: 'Code Sent Failed' })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const verifyforgetpasswordcode = async (req, res) => {
    const { email, code, newpassword } = req.body
    try {
        const { error, value } = verifyforgetpasswordSchema.validate({ email, code, newpassword })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })
        const existingUser = await User.findOne({ email }).select('+forgetPasswordCode +forgetPasswordCodeValidationTime +password')
        if (!existingUser) return res.status(401).json({ success: false, message: 'User not exists!' })

        if (Date.now() - existingUser.forgetPasswordCodeValidationTime > 5 * 60 * 1000) return res.status(401).json({ success: false, message: 'Code has been expired!' })

        let codeValue = code.toString()
        codeValue = await hmacProcess(codeValue, process.env.HMAC_CODE_SECRET)
        if (codeValue === existingUser.forgetPasswordCode) {
            const hashedPassword = await dohash(newpassword, 10)
            existingUser.password = hashedPassword
            existingUser.forgetPasswordCode = undefined
            existingUser.forgetPasswordCodeValidationTime = undefined
            await existingUser.save()
            return res.status(200).json({ success: true, message: 'Your password changed!' })
        }
        return res.status(400).json({ success: false, message: 'Unexpected occured!' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}



//*************for admin**************
export const adminlogin = async (req, res) => {
    const { email, password } = req.body
    try {
        const { error, value } = signupSchema.validate({ email, password })
        if (error) {
            return res.status(401).json({ success: false, message: error.details[0].message })
        }
        const existingUser = await Admin.findOne({ email }).select('+password +isAdmin')
        if (!existingUser || !existingUser.isAdmin) return res.status(401).json({ success: false, message: 'Admin not exists!' })

        const result = await doHashValidation(password, existingUser.password)
        if (!result) return res.status(401).json({ success: false, message: 'Invalid credentials!' })

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,
            isAdmin: existingUser.isAdmin
        }, process.env.TOKEN_SECRET, { expiresIn: '30d' })

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/'
            })
            .json({
                success: true,
                user: {
                    _id: existingUser._id,
                    email: existingUser.email,
                    verified: existingUser.verified
                },
                token,
                message: 'Logged in successfully'
            })

    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const SignupOtpSend = async (req, res) => {
    try {
        const { email } = req.body
        const { error, value } = forgetpasswordSchema.validate({ email })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })
        const existingUser = await Admin.findOne({ email })
        if (existingUser) return res.status(409).json({ success: false, message: 'User already exists. Please login.' })

        const code = crypto.randomInt(1000, 10000).toString()
        const hashedcode = await hmacProcess(code, process.env.HMAC_CODE_SECRET)
        await Otp.findOneAndDelete({ email })
        const newOtp = new Otp({ email: email, otp: hashedcode })
        await newOtp.save()
        let info = await transport.sendMail({
            from: process.env.FORGET_PASSWORD_CODE_SENDING_ADDRESS,
            to: email,
            subject: "Verification Code",
            html: `<h2>Your verification code is: ${code}</h2>`
        })
        res.status(200).json({ success: true, message: 'OTP sent to your email successfully' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const SignupOtpVerification = async (req, res) => {
    try {
        const { email, otp } = req.body
        const { error, value } = verifyotpadminSchema.validate({ email, otp })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })

        const otpRecord = await Otp.findOne({ email })
        if (!otpRecord) return res.status(400).json({ success: false, message: 'OTP not found or expired' })
        const code = await hmacProcess(otp, process.env.HMAC_CODE_SECRET)

        if (code != otpRecord.otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' })
        }

        const existingAdmin = await Admin.findOne({ email })
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin already exists. Please login instead.'
            })
        }

        const newAdmin = new Admin({
            email, isAdmin: true
        })
        const admin = await newAdmin.save()
        await Otp.deleteOne({ email })
        return res.status(200).json({ success: true, message: 'OTP verified. Proceed to complete signup.' })
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const completeInfoAdmin = async (req, res) => {
    const { email, address, phoneNumber, AdharCardNumber, password, confirmPassword } = req.body
    try {
        const { error, value } = AdminInfo.validate({ email, address, phoneNumber, AdharCardNumber, password, confirmPassword })
        if (password !== confirmPassword) return res.status(401).json({ success: false, message: 'Incorrect password!' })
        if (error) return res.status(401).json({ success: false, message: error.details[0].message })

        const existingUser = await Admin.findOne({ email })
        if (!existingUser) {
            return res.status(404).json({ success: false, message: 'User not found!' })
        }
        if (!existingUser.isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied! Only admins can update this info.' })
        }
        const hashedPassword = await dohash(password, 10)
        const userInfoUpdate = await Admin.findOneAndUpdate(
            { email }, { address: value.address, phoneNumber: value.phoneNumber, AdharCardNumber: value.AdharCardNumber, password: hashedPassword }, { new: true, runValidators: true }
        )

        return res.status(200).json({
            success: true,
            message: 'Admin info updated successfully!',
            user: userInfoUpdate
        })
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

export const adminLogout = async (req, res) => {
    try {
        res
            .clearCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: true,
                path: '/'
            })
            .status(200).json({ success: true, message: 'Logout successfully!' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }

}