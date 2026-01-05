import joi from 'joi'
 
export const signupSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    password:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})

export const changepasswordSchema=joi.object({
    oldpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)),
    newpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})

export const forgetpasswordSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}})
})

export const verifyforgetpasswordSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    code:joi.string().required(),
    newpassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})

export const productSchema=joi.object({
    name:joi.string().required().min(1).max(100),
    image:joi.array().items(
        joi.object({
            url:joi.string().uri().required(),
            altText:joi.string().allow('')
        })
    ).required().min(1),
    description:joi.string().required().min(10).max(1000),
    brand:joi.string().required().max(50),
    category:joi.required(),
    subcategory:joi.required(),
    price:joi.number().required().min(0).precision(2),
    countInStock:joi.number().required().min(0).integer()
})

export const AdminInfo=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    address:joi.object({
        street: joi.string().trim(), 
        city: joi.string().trim(),
        state: joi.string().trim(),
        zip: joi.string().trim() 
    }),
    phoneNumber: joi.string().length(10).pattern(/^\d+$/).required(),
    AdharCardNumber: joi.string().length(12).pattern(/^\d+$/).required(),
    password:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)),
    confirmPassword:joi.string().required().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
})
export const verifyotpadminSchema=joi.object({
    email:joi.string().min(6).max(60).required().email({tlds:{allow:['com','net']}}),
    otp: joi.string().length(4).pattern(/^\d+$/).required()
})

export const SubCategorySchema=joi.object({
    name:joi.string().required().min(3).max(50)
})