import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import subCategoryRoutes from './routes/subCategoryRoutes.js'
import dotenv from 'dotenv'

dotenv.config()

const app=express()
const port=process.env.PORT

const corsOption={
    origin:process.env.FRONT_URL,
    credentials:true,
    methods:['GET','POST','PUT','DELETE','PATCH'],
    allowedHeaders:['Content-Type','Authorization']
}

app.use(cors(corsOption))
app.use(helmet())
app.use(cookieParser())

app.use(express.json())
app.use('/api/auth',authRoutes)
app.use('/api/category',categoryRoutes)
app.use('/api/products',productRoutes) 
app.use('/api/cart',cartRoutes)
app.use('/api/order',orderRoutes)
app.use('/api/subCategory',subCategoryRoutes)

let isConnected=false
const connectmongodb=async(req,res)=>{
    if (isConnected) return
    try{
        const db=await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database Connected")
    }catch(err){ 
        console.error("Mongodb connection error : ",err)
    }
}

connectmongodb()
app.get('/',(req,res)=>{
    res.send('Hello')
})

app.listen(port,()=>{
    console.log(`Example app is listening at the port : ${port}`)
})