import mongoose, { Schema } from "mongoose";


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category:{
        type:String,
        required:true
    },
    rating: {
        type: Number,
    },
    price: {
        type: String,
        required: true,
    },
    discountPrice: {
        type: String,
    },
    slug_name:{
        type:String,
        required:true
    },
    productImages: [
        {
            smallImgUrl: { type: String, required: true },
            smallImgId: { type: String, required: true },
            previewImgUrl: { type: String, required: true },
            previewImgId: { type: String, required: true }
        }
    ],
    quantity: {
        type: Number,
        required: true
    },
    keySpecification: [
        {
            key: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    specifications: [
        {
            key: {
                type: String
            },
            value: {
                type: String
            }
        }
    ],
    description: {
        type: String,
        required: true
    },
    reviews: [{
        type: Schema.Types.ObjectId, ref: 'reviewModel'
    }]
}, { timestamps: true });



const productModel = mongoose.model("productModel", productSchema);
const reviewSchema = new Schema({
    name: { type: String, required: true },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'productModel'
    },
    email: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref:"userModel",
        required: true
    },
    reviewText: { type: String, required: true },
    attachment: { type: String },
    rating: { type: Number, required: true },
}, { timestamps: true });
const reviewModel = mongoose.model("reviewModel", reviewSchema);

export { reviewModel, productModel }