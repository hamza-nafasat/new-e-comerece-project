import { NextFunction, Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { nodeCash } from "../app.js";
import { TryCatch } from "../middlewares/errorHandler.js";
import Product from "../models/products.model.js";
import { AllProductsQueryTypes, CreateNewProductTypes, searchBaseQueryTypes } from "../types/apis.types.js";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import CustomError from "../utils/customClass.js";
import { invalidateNodeCash, responseFunc } from "../utils/features.js";
import getDataUri from "../utils/uriParser.js";

// =========================================
// http://localhost:8000/api/v1/products/new = CREATE NEW PRODUCT
// =========================================

export const createNewProduct = TryCatch(
  async (req: Request<{}, {}, CreateNewProductTypes>, res: Response, next: NextFunction) => {
    let { name, price, stock, category, subCategory, offerPrice = 0, sizes, colors } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Separate the size chart photo and product photos based on their fieldname
    const sizeChartPhoto = files.sizeChartPhoto ? files.sizeChartPhoto[0] : null;
    const productPhotos = files.photos || [];

    // Check if all required fields and photos are provided
    if (
      !name ||
      !price ||
      !stock ||
      !category ||
      !subCategory ||
      !productPhotos.length ||
      !sizeChartPhoto ||
      !sizes ||
      !colors
    ) {
      return next(
        new CustomError(
          "Please enter all fields, including at least one product photo and a size chart photo",
          400
        )
      );
    }

    let sizesArr = sizes.split(",");
    let colorsArr = colors.split(",");
    // Check if a product with the same name already exists
    let existingProduct = await Product.findOne({ name: name.toLowerCase() });
    if (existingProduct) {
      return next(new CustomError("Please use a unique name for the new product", 409));
    }

    // Upload product photos to Cloudinary
    const photosCloud = await Promise.all(
      productPhotos.map(async (photo) => {
        const fileUrl = getDataUri(photo);
        const myCloud: any = await uploadOnCloudinary(fileUrl.content!, "products");
        return { publicId: myCloud.public_id, url: myCloud.secure_url };
      })
    );

    // Upload size chart photo to Cloudinary
    const sizeChartFileUrl = getDataUri(sizeChartPhoto);
    const sizeChartPhotoCloud: any = await uploadOnCloudinary(sizeChartFileUrl.content!, "sizeCharts");

    // Create a new product in the database with uploaded data
    const product = await Product.create({
      name: name.toLowerCase(),
      price: Number(price),
      stock,
      category: category.toLowerCase(),
      subCategory: subCategory?.toLowerCase(),
      offerPrice: Number(offerPrice),
      photos: photosCloud,
      sizeChartPhoto: {
        publicId: sizeChartPhotoCloud.public_id,
        url: sizeChartPhotoCloud.secure_url,
      },
      sizes: sizesArr,
      colors: colorsArr,
    });

    // Invalidate cache if necessary and send a success response
    invalidateNodeCash({ isProducts: true, isAdmins: true });
    return responseFunc(res, "Product created successfully", 201);
  }
);

// ============================================
// http://localhost:8000/api/v1/products/latest = LATEST PRODUCTS
// ===========================================

export const getLatestProducts = TryCatch(async (req, res, next) => {
  const nodeCashKey = "latest-products";
  let products;
  //// fetching and cashing data in nodeCash
  if (nodeCash.has(nodeCashKey)) {
    products = JSON.parse(nodeCash.get(nodeCashKey) as string);
  } else {
    products = await Product.find().sort({ createdAt: -1 }).limit(5);
    if (!products) return next(new CustomError("Products Not Found", 404));
    nodeCash.set(nodeCashKey, JSON.stringify(products));
  }
  return responseFunc(res, "", 200, products);
});

// ================================================
// http://localhost:8000/api/v1/products/high-price = High price
// ================================================

export const getHighPrice = TryCatch(async (req, res, next) => {
  let highPrice;
  const nodeCashKey = "high-price";
  //// fetching and cashing data in nodeCash
  if (nodeCash.has(nodeCashKey)) {
    highPrice = JSON.parse(nodeCash.get(nodeCashKey) as string);
  } else {
    highPrice = await Product.find().sort({ price: -1 }).limit(1).select("price");
    if (!highPrice) return next(new CustomError("HighPrice Not Found", 404));
    nodeCash.set(nodeCashKey, JSON.stringify(highPrice));
  }
  return responseFunc(res, "", 200, highPrice);
});
// ================================================
// http://localhost:8000/api/v1/products/categories = CATEGORIES
// ================================================

export const getCategories = TryCatch(async (req, res, next) => {
  let categories;
  const nodeCashKey = "categories";
  //// fetching and cashing data in nodeCash
  if (nodeCash.has(nodeCashKey)) {
    categories = JSON.parse(nodeCash.get(nodeCashKey) as string);
  } else {
    categories = await Product.distinct("category");
    if (!categories) return next(new CustomError("Categories Not Found", 404));
    nodeCash.set(nodeCashKey, JSON.stringify(categories));
  }
  return responseFunc(res, "", 200, categories);
});

// ===================================================
// http://localhost:8000/api/v1/products/admin-prodcuts = ADMIN PRODUCTS
// ===================================================

export const getAdminProducts = TryCatch(async (req, res, next) => {
  const nodeCashKey = "admin-products";
  let products;
  //// fetching and cashing data in nodeCash
  if (nodeCash.has(nodeCashKey)) {
    products = JSON.parse(nodeCash.get(nodeCashKey) as string);
  } else {
    products = await Product.find().sort({ createdAt: -1 });
    nodeCash.set(nodeCashKey, JSON.stringify(products));
  }
  return responseFunc(res, "", 200, products);
});

// ================================================
// http://localhost:8000/api/v1/products/single/:productId =  GET SINGLE PRODUCT
// ================================================

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  const nodeCashKey = `product-${productId}`;
  let product;
  //// fetching and cashing data in nodeCash
  if (nodeCash.has(nodeCashKey)) {
    product = JSON.parse(nodeCash.get(nodeCashKey) as string);
  } else {
    product = await Product.findById(productId);
    if (!product) return next(new CustomError("Product Not Found", 404));
    nodeCash.set(nodeCashKey, JSON.stringify(product));
  }
  return responseFunc(res, "", 200, product);
});

// =========== same route =========== = DELETE SINGLE PRODUCT

export const deleteProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) return next(new CustomError("Invalid Product Id", 400));
  const product = await Product.findByIdAndDelete({ _id: productId });
  if (!product) return next(new CustomError("Product Not Found", 404));
  //// deleting image from cloudinary
  product.photos.forEach(async (photo) => {
    await removeFromCloudinary(photo?.publicId);
  });
  //// deleting nodeCash data bcz one product deleted
  invalidateNodeCash({ isProducts: true, isAdmins: true, productId: String(product._id) });
  //// sending response
  return responseFunc(res, "Product Deleted Successfully", 200);
});

// =========== same route =========== = UPDATE SINGLE PRODUCT

export const updateProduct = TryCatch(async (req, res, next) => {
  const { productId } = req.params;
  if (!isValidObjectId(productId)) return next(new CustomError("Invalid Product Id", 404));
  //// destructure data from body and file
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  // Separate the size chart photo and product photos based on their fieldname
  const sizeChartPhoto = files.sizeChartPhoto ? files.sizeChartPhoto[0] : null;
  const productPhotos = files.photos || [];
  const { name, stock, price, category, subCategory, offerPrice = 0, sizes, colors } = req.body;
  //// if not provided anything
  if (
    !name &&
    !price &&
    !stock &&
    !category &&
    !sizeChartPhoto &&
    !productPhotos.length &&
    !subCategory &&
    !offerPrice &&
    !sizes &&
    !colors
  ) {
    return next(new CustomError("Please Enter Something First", 400));
  }
  //// if product is available in database then go next
  let product = await Product.findById(productId);
  if (!product) return next(new CustomError("Product Not Found", 400));
  if (name) product.name = name;
  if (stock) product.stock = stock;
  if (price) product.price = price;
  if (category) product.category = category;
  if (subCategory) product.subCategory = subCategory;
  if (offerPrice > 0) product.offerPrice = offerPrice;
  if (sizes) product.sizes = sizes.split(",");
  if (colors) product.colors = colors.split(",");
  if (productPhotos) {
    // Upload product photos to Cloudinary
    const photosCloud = await Promise.all(
      productPhotos.map(async (photo) => {
        const fileUrl = getDataUri(photo);
        const myCloud: any = await uploadOnCloudinary(fileUrl.content!, "products");
        return { publicId: myCloud.public_id, url: myCloud.secure_url };
      })
    );
    product.photos = [...product?.photos, ...photosCloud];
  }
  if (sizeChartPhoto) {
    // Upload size chart photo to Cloudinary
    const sizeChartFileUrl = getDataUri(sizeChartPhoto);
    const sizeChartPhotoCloud: any = await uploadOnCloudinary(sizeChartFileUrl.content!, "sizeCharts");
    // remove old size chart from cloudinary
    await removeFromCloudinary(product?.sizeChartPhoto?.publicId);
    product.sizeChartPhoto = {
      publicId: sizeChartPhotoCloud.public_id,
      url: sizeChartPhotoCloud.secure_url,
    };
  }
  //// now update the product
  await product.save();
  //// deleting nodeCash data bcz one product update
  invalidateNodeCash({ isProducts: true, isAdmins: true, productId: String(product._id) });
  //// sending response
  return responseFunc(res, "Product Updated Successfully", 200);
});

//==================================================
// http://localhost:8000/api/v1/products/all-products =  ALL PRODUCTS FOR SEARCH AND FILTERS
// ===================================================

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, AllProductsQueryTypes>, res, next) => {
    const { category, price, search, sort, subCategory } = req.query;
    ////  creating a logic of pages dataLimit on one page and skip data on page change
    const page = Number(req.query.page) || 1;
    const onePageLimit = Number(process.env.PRODUCT_PER_PAGE) || 10;
    const skipProducts = onePageLimit * (page - 1);
    //// creating searchQuery according given fields
    const searchBaseQuery: searchBaseQueryTypes = {};
    if (search) {
      searchBaseQuery.name = {
        $regex: new RegExp(String(search), "i"),
      };
    }
    if (price) {
      searchBaseQuery.price = {
        $lte: Number(price),
      };
    }
    if (category) {
      searchBaseQuery.category = String(category);
    }
    if (subCategory) {
      searchBaseQuery.subCategory = String(subCategory);
    }
    //// get filteredData and total count of data according search query in parallel promises
    const [filteredProducts, totalSearchProducts, totalSubCateGories] = await Promise.all([
      Product.find(searchBaseQuery)
        .skip(skipProducts)
        .limit(onePageLimit)
        .lean()
        .sort(
          sort && {
            price: sort === "ascending" ? 1 : -1,
          }
        ),
      Product.countDocuments(searchBaseQuery),
      Product?.find({ category: category }).select("subCategory"),
    ]);
    //// creating total page count according total product with searchBaseQuery
    const totalPages = Math.ceil(totalSearchProducts / onePageLimit);
    //// sending response with data

    // find Total SubCategories
    let subCategories = [
      ...new Set(totalSubCateGories.map((subCategory: any) => subCategory?.subCategory)),
    ];
    return responseFunc(res, "", 200, {
      totalPages,
      filteredProducts,
      subCategories: category ? subCategories : [],
    });
  }
);

export const deletePhotoFromProduct = TryCatch(async (req, res, next) => {
  console.log(req.params, req.query);
  const { publicId, productId } = req.query;
  if (!isValidObjectId(productId)) return next(new CustomError("Invalid Product Id", 404));
  if (!publicId) return next(new CustomError("Invalid Public Id", 404));
  const product = await Product.findById(productId);
  if (!product) return next(new CustomError("Product Not Found", 404));

  const isPublicIdExist = product.photos.find((photo: any) => photo.publicId === publicId);
  if (!isPublicIdExist) return next(new CustomError("Photo Not Found", 404));
  //   remove publicId from cloudinary
  await removeFromCloudinary(publicId as string);
  //   remove publicId from product
  product.photos = product.photos.filter((photo) => photo.publicId !== publicId);
  await product.save();
  invalidateNodeCash({ isProducts: true, isAdmins: true, productId: String(product._id) });
  return responseFunc(res, "Photo Deleted Successfully", 200);
});

export const addReviewsInProduct = TryCatch(async (req, res, next) => {
  const { productId, rating, comment, username, gender, email } = req.body;
  if (!isValidObjectId(productId)) return next(new CustomError("Invalid Product Id", 404));
  if (!rating || !comment || !username || !gender || !email)
    return next(new CustomError("Please Enter All Fields", 400));
  const product: any = await Product.findById(productId);
  if (!product) return next(new CustomError("Product Not Found", 404));
  if (product?.reviews) {
    const alreadyReviewed = product?.reviews?.find((review: any) => review?.email == email);
    if (alreadyReviewed) return next(new CustomError("You Already Reviewed This Product", 404));
  }
  const review = { username, rating: Number(rating), comment, gender, email };
  product.reviews.unshift(review);
  await product.save();
  invalidateNodeCash({ isProducts: true, isAdmins: true, productId: String(product._id) });
  return responseFunc(res, "Review Added Successfully", 200);
});
