import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import { seedDatabase } from "./utils/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup allowing credentials for cookies
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount Routes matching Lab 01 to Lab 06 specifications
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ShopKart Unified Backend (Labs 01-06)",
    timestamp: new Date().toISOString(),
  });
});

// Database connection logic with automated fallback to in-memory MongoDB
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/shopkart";

  try {
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Successfully connected to MongoDB!");
    await seedDatabase();
  } catch (err) {
    console.warn("Could not connect to external MongoDB server. Launching embedded MongoMemoryServer fallback...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      console.log(`Connected to In-Memory MongoDB: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log("In-Memory MongoDB connected successfully!");
      await seedDatabase();
    } catch (memErr) {
      console.error("Critical error starting database:", memErr);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` ShopKart Backend Server running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(`===============================================`);
  });
});
