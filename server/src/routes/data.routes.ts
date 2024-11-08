import express from "express";
import {
  deleteSingleOrder,
  getAllOrders,
  getMyOrders,
  getSingleOrder,
  newOrderCreate,
  processSingleOrder,
} from "../controllers/orders.controllers.js";
import { isAdmin } from "../middlewares/auth.js";
import { addOrUpdateBanner, getBanner } from "../controllers/data.controllers.js";
import singleUpload from "../middlewares/multer.js";

const app = express();

// add new banner or update banner
app.post("/banner", isAdmin, singleUpload, addOrUpdateBanner);
// get banner
app.get("/banner", getBanner);

export default app;
