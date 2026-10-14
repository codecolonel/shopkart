import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

export const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable earcups.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB tenkeyless mechanical keyboard with tactile blue switches, hot-swappable PCB, and PBT double-shot keycaps.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Wireless Ergonomic Mouse",
    description: "Precision optical mouse with 4000 DPI sensor, Bluetooth + 2.4GHz dual mode, and silent click switches.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    stock: 18,
  },
  {
    name: "Smart Fitness Watch",
    description: "AMOLED display smartwatch with heart rate tracking, SpO2 sensor, sleep monitoring, and 5 ATM water resistance.",
    price: 3499,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    stock: 22,
  },
  {
    name: "Minimalist Leather Backpack",
    description: "Water-resistant vegan leather daily carry backpack with 15.6-inch laptop compartment and hidden anti-theft pocket.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "USB-C Multiport Dock",
    description: "7-in-1 USB-C Hub with 4K HDMI, 100W Power Delivery, SD/TF card reader, and 3x USB 3.0 high-speed ports.",
    price: 1899,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Double-Walled Ceramic Coffee Mug",
    description: "Handcrafted 350ml ceramic coffee mug with heat-insulating wooden handle and splash-proof lid.",
    price: 699,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    stock: 45,
  },
  {
    name: "Ergonomic Mesh Desk Chair",
    description: "Breathable mesh office chair with adjustable lumbar support, 3D armrests, and 120-degree recline mechanism.",
    price: 8999,
    category: "Furniture",
    image: "https://images.unsplash.com/photo-1580481077195-c2664923f95e?w=600&auto=format&fit=crop&q=80",
    stock: 8,
  },
];

export const seedDatabase = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("Seeding initial products into database...");
      await Product.insertMany(sampleProducts);
      console.log("Successfully seeded 8 sample products!");
    } else {
      console.log(`Database already has ${count} products.`);
    }
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};
