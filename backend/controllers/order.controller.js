import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// POST /orders/checkout (and /orders/create-payment-order)
export const checkoutOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const customer = await Customer.findById(req.user._id).populate("cart.product");

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Validate stock and snapshot items
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of customer.cart) {
      if (!item.product) continue;
      const productDoc = await Product.findById(item.product._id);

      if (!productDoc) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product.name} is no longer available`,
        });
      }

      if (productDoc.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${productDoc.name}". Only ${productDoc.stock} available.`,
        });
      }

      const itemTotal = productDoc.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: productDoc._id,
        name: productDoc.name,
        price: productDoc.price,
        quantity: item.quantity,
        image: productDoc.image,
      });

      // Decrement stock
      productDoc.stock -= item.quantity;
      await productDoc.save();
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products in cart to checkout",
      });
    }

    // Create Order document
    const order = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress,
      totalAmount: calculatedTotal,
      paymentStatus: "PAID",
      status: "PLACED",
      razorpayOrderId: "order_mock_" + Date.now(),
      razorpayPaymentId: "pay_mock_" + Date.now(),
    });

    // Clear user's cart
    customer.cart = [];
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process checkout",
    });
  }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId } = req.body;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "PAID";
    order.status = "CONFIRMED";
    if (razorpayPaymentId) {
      order.razorpayPaymentId = razorpayPaymentId;
    }
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment",
    });
  }
};

// GET /orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve order",
    });
  }
};
