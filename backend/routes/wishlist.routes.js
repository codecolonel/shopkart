import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", protectRoute, addToWishlist);
router.get("/", protectRoute, getWishlist);
router.delete("/:productId", protectRoute, removeFromWishlist);

export default router;
