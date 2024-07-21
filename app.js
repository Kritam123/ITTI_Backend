import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import Errorhandler from "./middlewares/error.js";
const app = express();

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
// routes  import
import { userRoutes } from "./routes/user_Routes.js";
app.use("/api/v1/user",userRoutes);


app.all("*",(req,res,next)=>{
    const err = new Error(`Route ${req.originalUrl}not found`)
    res.status(404)
    next(err)
  })
export {app};