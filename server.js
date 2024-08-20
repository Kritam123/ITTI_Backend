import dotenv from "dotenv";
import { app } from "./app.js";
import { DbConnect } from "./config/DbConnect.js";
dotenv.config();
 const port = process.env.PORT || 5000
//  db setup
DbConnect();
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to uncaught Exception`)
    process.exit(1);
})
//  server setup
app.listen(port,()=>{
    console.log(`Server started... in ${port}` )
})
// unhandled promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down the server due to unhandled promise Rejection`);
})