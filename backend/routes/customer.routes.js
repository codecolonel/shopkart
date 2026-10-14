import express from "express";
import {
  registerCustomer,
  loginCustomer,
  getMe,
  logoutCustomer,
  changePassword,
} from "../controllers/customer.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protectRoute, getMe);
router.post("/logout", protectRoute, logoutCustomer);
router.patch("/change-password", protectRoute, changePassword);

export default router;
