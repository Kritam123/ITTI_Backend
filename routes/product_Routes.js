import {Router} from "express";
import multer from "multer";
import { userRoles, verifyJWT } from "../middlewares/auth_verify.js";
import { createNewProduct, getFilterProducts } from "../controllers/product_controller.js";
const storage = multer.diskStorage({});
const upload = multer({storage});
const productRoutes  = Router();
productRoutes.post("/create/new",verifyJWT,userRoles,upload.array("images",5),createNewProduct)
productRoutes.get("/products",getFilterProducts)


export {productRoutes}