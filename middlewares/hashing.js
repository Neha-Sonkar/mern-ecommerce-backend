import {hash,compare} from 'bcryptjs'
import { createHmac } from 'crypto'

export const dohash=async(value,saltValue)=>{
    const result=await hash(value,saltValue)
    return result
}

export const doHashValidation=async(value,hashedValue)=>{
    const result=await compare(value,hashedValue)
    return result
}

export const hmacProcess=async(value,key)=>{
    const result=createHmac('sha256',key).update(value).digest('hex')
    return result
}