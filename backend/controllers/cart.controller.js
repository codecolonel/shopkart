import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const customer = await Customer.findById(req.user._id);
    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const currentQty = customer.cart[existingIndex].quantity;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than ${product.stock} units in stock`,
        });
      }
      customer.cart[existingIndex].quantity += 1;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to cart",
    });
  }
};

// GET /cart
export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price category image stock description",
    });

    // Filter out any cart items where product might have been deleted
    const validItems = customer.cart.filter((item) => item.product !== null);

    let totalAmount = 0;
    const formattedItems = validItems.map((item) => {
      const subtotal = item.product.price * item.quantity;
      totalAmount += subtotal;
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        subtotal,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedItems.length,
      items: formattedItems,
      cart: formattedItems,
      totalAmount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve cart",
    });
  }
};

// PATCH /cart/:productId
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock of ${product.stock}`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const item = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    item.quantity = numQty;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user._id);
    const initialLen = customer.cart.length;
    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === initialLen) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove item from cart",
    });
  }
};
