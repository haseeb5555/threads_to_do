import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async ()=>{

    mongoose.set('strictQuery',true)

    if (!process.env.MONGODB_URL) return console.log('url not found')

    if(isConnected) return console.log('already connect to db')

    try {
       mongoose.connect(process.env.MONGODB_URL) ;
       isConnected= true 
       console.log('mongodb is connected!')
    } catch (error) {
        console.log(error)
    }
}