// import express, { Request, Response } from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// mongoose.connect(process.env.MONGODB_URI as string)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));


// import authRoutes from './routes/auth';
// import tableRoutes from './routes/tables';
// import sheetRoutes from './routes/sheets';

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/tables', tableRoutes);
// app.use('/api/sheets', sheetRoutes);

// // Health check route
// app.get('/', (req: Request, res: Response) => {
//   res.json({ message: 'API is running' });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// export default app;


import express from "express";
import cors from 'cors'
import { connectDB } from "./db";

import dotenv from 'dotenv'
dotenv.config()

import indexRouter from './routes/index'
import { disconnect } from "mongoose"


const app = express();
const port: number | string = process.env.port || 5500

app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes("dash-app-one.vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  // origin : "*",
  methods : "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true 
}));

app.use('/api/v1', indexRouter)
app.get('/api/v1/health', async(req:express.Request,res:express.Response)=>{
  res.status(200).json({message:"server is health"})
})


app.listen(port, async() => {
  try {
    await connectDB(process.env.MONGO_URI!)
    console.log(`server started on port : ${port}`)
  } catch (error) {
    console.log("error connecting database")
    await disconnect()
  }
})

