import { productModel } from "../models/product_model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadAndResize } from "../utils/uploadAndResize.js";
import { CatergoryData } from "../utils/lib/ProductCategories.js"

// api for creating product access for admin only
const createNewProduct = asyncHandler(async (req, res) => {
  try {
    const data = req.body;
    // todo:image upload
    let uploadImages;
    const files = req.files;
    // Extract paths of uploaded images
    const imagePaths = files?.map(file => ({ path: file.path }));
    if (imagePaths?.length > 0) {
      uploadImages = await uploadAndResize(imagePaths);
    }
    else {
      return res.status(400).json(new ApiError(400, "Please Provide at least one Image", "Please Provide at least one Image"))
    }
    // create product 
    const newProduct = await productModel.create({ productImages: uploadImages, ...data });
    // response
    return res.status(201).json(new ApiResponse(201, { newProduct }, "New Product Created Successfully"));
  } catch (error) {
    console.log(error);
  }
});


// api for getting product by filtering price ,categories 

const getFilterProducts = asyncHandler(async (req, res) => {
  try {
    const { categories, q, minPrice, maxPrice, page = 1, order, sortBy, limit = 10 } = req.query;
    let query = {};
    if (q) query.type = q;
    if (categories) {
      function findNamesByIds(ids) {
        const foundItems = [];
        for (const category of CatergoryData) {
          for (const item of category.lists) {
            if (ids.includes(item.id.toString())) {
              foundItems.push(item.name);
            }
          }
        }
        return foundItems;
      }
      const categoriesArray = categories.split(",");
      const filteredNames = findNamesByIds(categoriesArray);
      query.keySpecification = { $elemMatch: { value: { $in: filteredNames } } };
    }
    if (minPrice) query.price = { ...query.price, $gte: parseInt(minPrice) }
    if (maxPrice) query.price = { ...query.price, $lte: parseInt(maxPrice) }
    let sort = {};
    if (sortBy) {
      sort[sortBy] = order === 'desc' ? -1 : 1;
    }
    // calulate skip value 
    const skip = (page - 1) * limit;
    // fetchProducts according to filters
    const products = await productModel.find(query).sort(sort).limit(parseInt(limit)).skip(skip)
    // get the total product size for pagination
    const totalProduct = await productModel.countDocuments(query);
    console.log(Math.floor(totalProduct / limit));
    return res.status(200).json(new ApiResponse(200, { totalProduct, products, page: parseInt(page), pages: Math.ceil(totalProduct / limit) }, "Get Products Successfully"))
  } catch (error) {
    console.log(error)
  }
})

// api for getting product by slug_name

const getProductBySlugName = asyncHandler(async(req,res)=>{
  try {
    const {slug_name} = req.params;
    if(!slug_name){
      return res.status(400).json(new ApiError(400,"SommethingWentWrong","SomethingWrong"));
    }
    const product = await productModel.findOne({slug_name})
    if(!product){
      return res.status(404).json(new ApiError(404,"Product Not Found!","Product Not Found!"))
    }
    return res.status(200).json(new ApiResponse(200,{product},"Product Get SucessFully"));
  } catch (error) {
    console.log(error);
  }
})
export { createNewProduct, getFilterProducts,getProductBySlugName }