import { Schema, Types, model } from "mongoose";
import { OrderSchemaTypes } from "../types/schema.types.js";

const singleCartItem = {
  name: {
    type: String,
    required: true,
  },
  photo: {
    publicId: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  productId: {
    type: Types.ObjectId,
    ref: "Product",
    required: true,
  },
};

const orderSchema = new Schema<OrderSchemaTypes>(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    cartItem: [singleCartItem],
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "delivered", "shipped"],
      default: "processing",
    },
  },
  { timestamps: true }
);

const Order = model<OrderSchemaTypes>("Order", orderSchema);
export default Order;
