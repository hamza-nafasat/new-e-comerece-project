import mongoose from "mongoose";
import { ProductSchemaTypes } from "../types/schema.types.js";

const productSchema = new mongoose.Schema<ProductSchemaTypes>(
  {
    name: { type: String, required: [true, "Please entered product name"] },
    price: { type: Number, required: [true, "Please entered product price"] },
    stock: { type: Number, required: [true, "Please entered product stock"] },
    photos: [
      { type: { publicId: { type: String, required: true }, url: { type: String, required: true } } },
    ],
    sizeChartPhoto: {
      type: { publicId: { type: String, required: true }, url: { type: String, required: true } },
    },
    reviews: [
      {
        username: { type: String, required: [true, "Please enter your username"] },
        rating: { type: Number, required: [true, "Please enter your rating"] },
        gender: { type: String, required: [true, "Please enter your gender"] },
        email: { type: String, required: [true, "Please enter your email"] },
        comment: { type: String, required: [true, "Please enter your comment"] },
      },
    ],
    category: { type: String, trim: true, required: [true, "Please entered product category"] },
    subCategory: { type: String, trim: true, required: [true, "Please entered product sub category"] },
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductSchemaTypes>("Product", productSchema);

export default Product;
