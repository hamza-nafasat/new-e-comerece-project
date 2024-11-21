import cors from "cors";
import { config } from "dotenv";
import express, { Request, Response } from "express";
import morgan from "morgan";
import NodeCache from "node-cache";
import { customErrorMiddleWare } from "./middlewares/errorHandler.js";
import dataRoutes from "./routes/data.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import productsRoutes from "./routes/products.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { configureCloudinary } from "./utils/cloudinary.js";
import { connectDB } from "./utils/features.js";

config({
  path: "./.env",
});

// Constant Variables
const app = express();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL || "";
const dbName = process.env.DB_NAME || "";

app.use(
  cors({
    origin: [process.env.FRONTEND_ULR,"https://mern-e-commerce-2024.vercel.app"],
    credentials: true,
  })
);

// Node Cashing
export const nodeCash = new NodeCache();

// Other Middlewares
// const corsOptions: any = {
//   origin: (origin: any, callback: any) => {
//     const allowedOrigins = ["http://localhost:5173", "https://kooglearden.com"];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

// // Use the CORS middleware
// app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Adding Routes
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", statsRoutes);
app.use("/api/v1/admin", dataRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send(
    `App is running on <a href={${process.env.FRONTEND_ULR}}>Frontend url</a>`
  );
});

// Static Folder for Pics
app.use("/uploads", express.static("uploads"));

// Error Handler Middleware
app.use(customErrorMiddleWare);

// CONNECTING MONGODB ASYNCHRONOUSLY
// =================================
(async () => {
  try {
    await configureCloudinary();
    await connectDB(mongoUrl, dbName);
    //// Server id Listing if database successfully connected
    app.listen(port, () => console.log(`app listening on ${port}`));
  } catch (err: any) {
    console.error(`Failed to start server ${err.message}`);
    process.exit(1);
  }
})();
