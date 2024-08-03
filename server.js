import dotenv from "dotenv";
import { app } from "./app.js";
import { DbConnect } from "./config/DbConnect.js";
// import { productModel } from "./models/product_model.js";
// import { products } from "./config/products.js";
// import mongoose from "mongoose";
dotenv.config();
 const port = process.env.PORT || 5000

//  db setup
DbConnect();
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to uncaught Exception`)
    process.exit(1);
})

// const insertProducts = async () => {
//     try {
//         await productModel.insertMany(products);
//         console.log("Products inserted successfully.");
//     } catch (error) {
//         console.error("Error inserting products:", error);
//     } finally {
//         mongoose.connection.close();
//     }
// }

// insertProducts();
//  server setup
app.listen(port,()=>{
    console.log(`Server started... in ${port}` )
})
// unhandled promise Rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down the server due to unhandled promise Rejection`);
    server.close(()=>{
        process.exit(1);
    })
})