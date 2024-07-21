import express from "express";
import { accessTokenReGenerate,changeCurrentPassword, deleteAddressById, forgetPasswordChangeApi, forgetPasswordOtpGenerate, getAllUserAddresses, getCurrentUser, getSingleAddressById, login,logout,makeBillingAddressDefault,makeShippingAddressDefault,register, socialAuth, updateAddressById, updateUser, updateUserAddress } from "../controllers/user_controller.js";
import {verifyJWT} from "../middlewares/auth_verify.js"
const userRoutes = express.Router();
userRoutes.get("/health",(req,res,next)=>{
        res.send("Health check");
})
userRoutes.post("/login",login);
userRoutes.post("/socialAuth",socialAuth);
userRoutes.post("/register",register);
userRoutes.post("/logout",verifyJWT,logout);
userRoutes.post("/accessTokenRefresh",accessTokenReGenerate);
userRoutes.get("/getUser",verifyJWT,getCurrentUser);
userRoutes.post("/changepassword",verifyJWT,changeCurrentPassword);
userRoutes.post("/update/profile",verifyJWT,updateUser);
userRoutes.post("/update/address",verifyJWT,updateAddressById);
userRoutes.post("/delete/address/",verifyJWT,deleteAddressById);
userRoutes.post("/address/create/new",verifyJWT,updateUserAddress);
userRoutes.get("/allAddresses",verifyJWT,getAllUserAddresses);
userRoutes.post("/getSingleAddress",verifyJWT,getSingleAddressById);
userRoutes.post("/makeDefaultBilling",verifyJWT,makeBillingAddressDefault);
userRoutes.post("/makeDefaultShipping",verifyJWT,makeShippingAddressDefault);
userRoutes.post("/forgetPassword/",forgetPasswordOtpGenerate)
userRoutes.post("/forgetPassword/reset",forgetPasswordChangeApi)

export {userRoutes};