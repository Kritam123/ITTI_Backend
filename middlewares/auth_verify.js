import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

import { userModel } from "../models/user_model.js";


export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token ){
         throw new ApiError(401,"Unauthorised access");
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken){
            res.status(403).clearCookie("accessToken", options)
            .clearCookie("refreshToken", {httpOnly:false,secure:false}).json(new ApiError(403,"Session Expired","Session Expired"))
            }
        const user = await userModel.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401,"Invalid ACCESS TOKEN");
        }
        req.user = user;
        next();
    }catch (error){
            throw new ApiError(401,error.message || "Invalid access token")
    }
})


export const userRoles = asyncHandler(async(req,res,next)=>{
    try {
        const currentUserRoles = req.user?.roles;
        if(currentUserRoles !== "admin"){
        return  res.status(401).json(new ApiError(401,"UnAuthorised Access!" || "Something went Wrong","UnAuthorised Access!"))
        }
        next();
    } catch (error) {
      console.log(error)
    }
})