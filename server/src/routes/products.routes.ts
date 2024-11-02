import express from "express";
import {
  addReviewsInProduct,
  createNewProduct,
  deletePhotoFromProduct,
  deleteProduct,
  getAdminProducts,
  getAllProducts,
  getCategories,
  getHighPrice,
  getLatestProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/products.controllers.js";
import singleUpload, { multiUpload } from "../middlewares/multer.js";
import { isAdmin, isUser } from "../middlewares/auth.js";

const app = express();

// get latest products
app.get("/latest", getLatestProducts);

// get all products and search queries
app.get("/all-products", getAllProducts);

// get all categories
app.get("/categories", getCategories);

// get all categories
app.get("/high-price", getHighPrice);

app.get("/admin-products", isAdmin, getAdminProducts);

// ADMIN ONLY === create new product
app.post("/new", isAdmin, multiUpload, createNewProduct);

// ADMIN ONLY === update or delete one product
app
  .route("/single/:productId")
  .get(getSingleProduct)
  .delete(isAdmin, deleteProduct)
  .put(isAdmin, multiUpload, updateProduct);

//   delete photo from product
app.delete("/delete-photo", isAdmin, deletePhotoFromProduct);

app.post("/add-review", isUser, addReviewsInProduct);

export default app;
