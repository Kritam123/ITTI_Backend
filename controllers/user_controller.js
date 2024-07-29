import { asyncHandler } from "../utils/asyncHandler.js";
import { addressModel, userModel } from "../models/user_model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import path from "path"
import sendEmail from "../utils/sendMail.js"
const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await userModel.findById(userId.toString());
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Something went wrong while generating referesh and access token"));
    }
}




const register = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    if (
        [firstName, email, lastName, password].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json(new ApiError(400, "All fields are required"));
    }

    const isUserExisting = await userModel.findOne({
        email
    });
    if (isUserExisting) {

        return res.status(400).json(new ApiError(409, "User with email already exists", "User with email already exists"));
    }
    const user = await userModel.create(req.body);

    const createdUser = await userModel.findById(user._id).select(
        "-password"
    )

    if (!createdUser) {
        return res.status(400).json(new ApiError(500, "Something went wrong while registering the user", "Something went wrong while registering the user"));
    }

    return res.status(201).json(
        new ApiResponse(200, { refreshToken: createdUser.refreshToken, isAuthenticated: true }, "User registered Successfully")
    )
})

// login user
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (
        [email, password].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json(new ApiError(400, "All fields are required", "All fields are required"));
    }
    const isUserExisting = await userModel.findOne({
        email
    });
    if (!isUserExisting) {
        return res.status(404).json(new ApiError(404, "User does not Exists", "User does not Exists"));
    }
    const isPasswordValid = await isUserExisting.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json(new ApiError(401, "Invalid user credentials", "Invalid user credentials"));
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(isUserExisting._id)

    const loggedInUser = await userModel.findById(isUserExisting._id).select("-password")

    const options = {
        httpOnly: true,
        secure: false
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, {httpOnly:false,secure:false})
        .json(
            new ApiResponse(
                200,
                {
                    refreshToken: loggedInUser.refreshToken,
                    isAuthenticated: true,
                    loggedUser:loggedInUser
                },
                "User logged In Successfully"
            )
        )
})

// socialAuth
 const socialAuth = asyncHandler(async (req, res, next) => {

    const { email, firstName, lastName } = req.body;
    const isUserExist = await userModel.findOne({ email });
    if (!isUserExist) {
        const newUser = await userModel.create({
            firstName,
            lastName,
            email,
        })
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(newUser._id)
        const loggedInUser = await userModel.findById(newUser._id).select("-password");
        const options = {
            httpOnly: true,
            secure: false
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, {httpOnly:false,secure:false})
            .json(
                new ApiResponse(
                    200,
                    {
                        refreshToken: loggedInUser.refreshToken,
                        isAuthenticated: true,
                        loggedUser:loggedInUser
                    },
                    "User logged In Successfully"
                )
            )
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(isUserExist._id)

    const loggedInUser = await userModel.findById(isUserExist._id).select("-password")

    const options = {
        httpOnly: true,
        secure: false
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, {httpOnly:false,secure:false})
        .json(
            new ApiResponse(
                200,
                {
                    refreshToken: loggedInUser.refreshToken,
                    isAuthenticated: true,
                    loggedUser:loggedInUser
                },
                "User logged In Successfully"
            )
        )


})

// logout feature

const logout = asyncHandler(async (req, res) => {
    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", {httpOnly:false,secure:false})
        .json(new ApiResponse(200, {}, "User logged Out"))
})
//  access token regenerate
const accessTokenReGenerate = asyncHandler(async (req, res) => {
    const { tokenRefresh } = req.body;
    const token =  req.cookies.refreshToken || tokenRefresh;
     if (!token) {
        return res.status(400).json(new ApiError(401, "Unauthorised Access", "Unauthorised Access"));
    }
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
     if(!decodedToken){
        res.status(403).json(new ApiError(403,"Session Expired","Session Expired"))
        }
    const user = await userModel.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh Token");
    }
    // if (user.refreshToken !== token) {
    //     throw new ApiError(401, "Token Invalid");
    // }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(decodedToken?._id);
    const options = {
        httpOnly: true,
        secure: false
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, {httpOnly:false,secure:false})
        .json(
            new ApiResponse(
                200,
                {refreshToken},
                "AccessToken Refresh Successfully"
            )
        )
})
// get current user 


const getCurrentUser = asyncHandler(async (req, res, next) => {
    const id = req.user?._id;
    const getUser = await userModel.findById(id).select("-password");
    if (!getUser) {
        throw new ApiError(404, "User Doesn't Exist");
    }
    return res.status(200).json(new ApiResponse(200, { user: getUser, isAuthenticated: true, refreshToken: getUser.refreshToken }, "User get Successfully"));
})
// change current password

const changeCurrentPassword = asyncHandler(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (
        [oldPassword, newPassword].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json(new ApiError(400, "oldPassword and newPassword"));
    }
    const user = await userModel.findById(req.user?._id);
    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        return res.status(400).json(new ApiError(400, "Invalid old password", "Invalid old password"));
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

// upadate user

const updateUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName } = req.body;
    const currentUser = req.user?._id;
    if (
        [firstName, lastName].some((field) => field?.trim() === "")
    ) {
        res.status(400).json(new ApiError(400, "firstName and lastName is requrired"));
    }
    // getting user
    const getCurrentUser = await userModel.findById(currentUser).select("-password");
    if (!getCurrentUser) {
        res.status(401).json(new ApiError(401, "Invalid Access || User not Found"));
    }
    getCurrentUser.firstName = firstName;
    getCurrentUser.lastName = lastName;
    getCurrentUser.save({ validateBeforeSave: false })

    return res.status(201).json(
        new ApiResponse(201, { user: getCurrentUser, isAuthenticated: true, refreshToken: getCurrentUser.refreshToken }, "User Update Successfully")
    );
})
// update user address 
const updateUserAddress = asyncHandler(async (req, res) => {
    const currentUser = req.user?._id;
    const { isBillingAddress, isShippingAddress } = req.body;
    const getCurrentUser = await userModel.findById(currentUser);
    if (!getCurrentUser) {
        res.status(401).json(new ApiError(401, "Invalid Access", "Invalid Access"));
    }
    const newAddress = await addressModel.create(req.body);
    getCurrentUser.addresses.push(newAddress._id);
    getCurrentUser.save({ validateBeforeSave: false });
    req.user.addresses?.map(async (ele) => {
        const currentAddressUser = await addressModel.findById(ele);
        if (!currentAddressUser) {
            return;
        }
        if (currentAddressUser.isBillingAddress === true && isBillingAddress === true) {
            currentAddressUser.isBillingAddress = false;
        }
        if (currentAddressUser.isShippingAddress === true && isShippingAddress === true) {
            currentAddressUser.isShippingAddress = false;
        }
        await currentAddressUser?.save();
    })
    return res.status(201).json(new ApiResponse(201, {}, "New Address Created SuccessFully"));
})
const getAllUserAddresses = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const getAllAddressUser = await userModel.findById(currentUserId).select("-password -refreshToken").populate('addresses');
    if (!getAllAddressUser) {
        return res.status(401).json(new ApiError(401, "Address not found"));
    }
    return res.status(200).json(new ApiResponse(200, { address: getAllAddressUser }, "Addresses get Successfully"))
})

const getSingleAddressById = asyncHandler(async (req, res) => {
    const { addressId } = req.body;
    const getAddress = await addressModel.findById(addressId);
    if (!getAddress) {
        return res.status(401).json(new ApiError(401, "Address not found"));
    }

    return res.status(200).json(new ApiResponse(200, { address: getAddress }, "Addresses get Successfully"))
})
const updateAddressById = asyncHandler(async (req, res, next) => {
    const data = req.body;
    const { addressId, ...values } = data;
    const { isBillingAddress, isShippingAddress } = values;
    const updateAddressId = addressId;
    const getUserAddress = await addressModel.findById(updateAddressId);
    if (!getUserAddress) {
        throw new ApiError(401, "Address Not Found!");
    }
    req.user.addresses?.filter((ele) => ele._id !== addressId)?.map(async (ele) => {
        const currentAddressUser = await addressModel.findById(ele);
        if (!currentAddressUser) {
            return;
        }
        if (currentAddressUser.isBillingAddress === true && isBillingAddress === true) {
            currentAddressUser.isBillingAddress = false;
        }
        if (currentAddressUser.isShippingAddress === true && isShippingAddress === true) {
            currentAddressUser.isShippingAddress = false;
        }
        await currentAddressUser?.save();
    })
    const updateAddress = await addressModel.findByIdAndUpdate(updateAddressId, values, { new: true })
    return res.status(201).json(
        new ApiResponse(201, { address: updateAddress }, "Updated Address SuccessFully")
    );

});
const makeShippingAddressDefault = asyncHandler(async (req, res) => {
    const { addressId } = req.body;
    const getAddressToUpdate = await addressModel.findById(addressId);
    if (!getAddressToUpdate) {
        throw new ApiError(401, "Address not Found!");
    }
    req.user.addresses?.filter((ele) => ele._id !== addressId).map(async (ele) => {
        const currentAddressUser = await addressModel.findById(ele);
        currentAddressUser && currentAddressUser.isShippingAddress && await addressModel.findByIdAndUpdate(ele, { isShippingAddress: false }, { new: true })
    })

    !getAddressToUpdate.isShippingAddress && await addressModel.findByIdAndUpdate(addressId, { isShippingAddress: true }, { new: true })

    return res.status(201).json(
        new ApiResponse(201, {}, "Updated Default Shipping Address")
    );

});
const makeBillingAddressDefault = asyncHandler(async (req, res) => {
    const { addressId } = req.body;
    const getAddressToUpdate = await addressModel.findById(addressId);
    if (!getAddressToUpdate) {
        throw new ApiError(401, "Address not Found!");
    }
    req.user.addresses?.filter((ele) => ele._id !== addressId)?.map(async (ele) => {
        const currentAddressUser = await addressModel.findById(ele);
        currentAddressUser && currentAddressUser.isBillingAddress && await addressModel.findByIdAndUpdate(ele, { isBillingAddress: false }, { new: true })
    })

    !getAddressToUpdate.isBillingAddress && await addressModel.findByIdAndUpdate(addressId, { isBillingAddress: true }, { new: true })

    return res.status(201).json(
        new ApiResponse(201, {}, "Updated Default Billing Address ")
    );
});
// delete Address 

const deleteAddressById = asyncHandler(async (req, res) => {
    const data = req.body
    const deleteAddressId = data.address;
    const getUserAddress = await addressModel.findById(deleteAddressId);
    const getCurrentUser = await userModel.findById(req.user?._id)
    if (!getUserAddress) {
        throw new ApiError(400, "Address Not Found!");
    }
    const filterAddressesId = req.user.addresses.filter((ele) => ele.toString() !== deleteAddressId);
    getCurrentUser.addresses = filterAddressesId;
    await getCurrentUser?.save();
    await addressModel.findByIdAndDelete(deleteAddressId);
    return res.status(201).json(
        new ApiResponse(201, { deleteAddressId }, "Delete Address SuccessFully")
    );
});

// forgetPassword otp generate


const forgetPasswordOtpGenerate = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(401).json(new ApiError(401, "Email is Required."));
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(401).json(new ApiError(401, "User Not Found!"));
    }
    const { firstName, _id, ...others } = user;
    const { token, otpCode } = createPasswordChangeToken(firstName, _id);
    const data = { user: { name: firstName }, otpCode }
    const html = await ejs.renderFile(path.join(process.cwd(), "../itt.com_Backend/mail", "passwordChange.ejs"), data);
    try {
        await sendEmail({
            email: email,
            subject: "Forget Password Changed",
            html
        })
        const options = {
            httpOnly: true,
            secure: false
        }
        res.status(201).cookie("forgetPasswordToken", token, options).json(new ApiResponse(
            201,
            { passwordToken: token },
            `Please check your email ${email} to Changed your password`,
        ))
    } catch (error) {
        throw new ApiError(400, error.message);
    }

});
const createPasswordChangeToken = (firstName, id) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const token = jwt.sign({
        otpCode, firstName, id
    }, process.env.PASSWORD_CHANGE, {
        expiresIn: '5m'
    });
    return { token, otpCode };
}
const forgetPasswordChangeApi = asyncHandler(async (req, res) => {
    const { newPassword, forgetToken, otpCode } = req.body;
    const token = forgetToken || req.cookies?.forgetPasswordToken;
    if (!newPassword || !token || !otpCode) {
        return res.status(400).json(new ApiError(400, "Please enter the newPassword and otpCode and forgetToken"))
    }
    const isVerifiedToken = jwt.verify(
        token,
        process.env.PASSWORD_CHANGE)

    if (isVerifiedToken.otpCode !== otpCode) {
        return res.status(400).json(new ApiError(400, "Invalid PassWord Change Code"))
    }
    const { id } = isVerifiedToken;
    const user = await userModel.findById(id);
    user.password = newPassword;
    await user?.save();
    const options = {
        httpOnly: true,
        secure: false
    }
    res.status(201).clearCookie("forgetPasswordToken",options).json(new ApiResponse(201, {}, "Password Change successfully"));
})
export { makeShippingAddressDefault,socialAuth,forgetPasswordChangeApi, forgetPasswordOtpGenerate, makeBillingAddressDefault, getSingleAddressById, getAllUserAddresses, updateAddressById, deleteAddressById, register, login, logout, accessTokenReGenerate, getCurrentUser, changeCurrentPassword, updateUserAddress, updateUser }