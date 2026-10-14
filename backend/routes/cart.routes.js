import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", protectRoute, addToCart);
router.get("/", protectRoute, getCart);
router.patch("/:productId", protectRoute, updateCartItem);
router.delete("/:productId", protectRoute, removeFromCart);

export default router;
