import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema( {
    firstName:{
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    imgUrl: {
        type: String,
        default: ""
    },
    refreshToken:{
        type:String,
    },
    roles:{
        type:String,
        default :"user"
    },
    addresses: [ { type: Schema.Types.ObjectId, ref: 'addressModel'}],
    whishlists: [ { type: Schema.Types.ObjectId, ref: 'productModel'}],
    orders: [ { type: Schema.Types.ObjectId, ref: 'orderModel'}],
    reviews: [ { type: Schema.Types.ObjectId, ref: 'reviewModel'}],
}, { timestamps: true } );
// encrypt the password before save in db
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
});
// isPassword Correct to check the plain password to hash password and compare it
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
// generateAccessToken
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            firstName:this.firstName,
            lastName: this.lastName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// generateRefreshToken
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const userModel = mongoose.model( "userModel", userSchema );


const addressSchema = new Schema( {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    additionalInfo:{
        type:String,
    },
    phone: { type: String, required: true },
    company:{type:String,reqired:true},
    landmark: { type: String, required: true },
    state_Province: { type: String, required: true },
    district: { type: String, required: true },
    vatNumber: { type: Number, required: true },
    isBillingAddress:{
        type:Boolean,
        default:false
    },
    isShippingAddress:{
        type:Boolean,
        default:false
    }
});
const addressModel = mongoose.model( "addressModel", addressSchema );
export { userModel, addressModel };
