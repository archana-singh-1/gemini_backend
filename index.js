import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './router/authRouter.js'


const app=express()
app.use(cors());
dotenv.config();
app.use(express.json())


const PORT=process.env.PORT
const mongoDbUrl = process.env.mongoDb;



mongoose.connect(mongoDbUrl, {  })

.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));



app.use("/api/auth", authRoutes);


app.listen(PORT,function(){
    console.log(`Server is running on Port ${PORT}`)
})
