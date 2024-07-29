import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import {v2 as Cloudinary} from "cloudinary";

import helmet from "helmet";
import Errorhandler from "./middlewares/error.js";
const app = express();
dotenv.config();
var corsOptions = {
    origin: ['http://localhost:5173'],
    optionsSuccessStatus: 200,
    credentials:true
  }

app.use(cors(corsOptions))
app.use(Errorhandler)

app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended: true, limit: "50mb"}));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet({xssFilter:true,}))
Cloudinary.config({
   cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
   api_secret:process.env.CLOUDINARY_SECRET_KEY,
   api_key:process.env.CLOUDINARY_API_KEY
})
// routes  import
import { userRoutes } from "./routes/user_Routes.js";
import { productRoutes } from "./routes/product_Routes.js";
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/product",productRoutes);


app.all("*",(req,res,next)=>{
    const err = new Error(`Route ${req.originalUrl}not found`)
    res.status(404)
    next(err)
  })
export {app};