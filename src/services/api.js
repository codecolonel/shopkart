import axios from "axios";

// withCredentials lets the browser store and send the HttpOnly auth cookie.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ==========================================
// Lab 01 & 02: Authentication APIs
// ==========================================
export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");
export const changePassword = (data) => api.patch("/customers/change-password", data);

// ==========================================
// Lab 03: Product Catalog APIs
// ==========================================
export const getProducts = (params) => api.get("/products", { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post("/products", data);

// ==========================================
// Lab 04: Wishlist APIs
// ==========================================
export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);

// ==========================================
// Lab 05: Shopping Cart APIs
// ==========================================
export const getCart = () => api.get("/cart");
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const updateCartItem = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// ==========================================
// Lab 06: Checkout & Orders APIs
// ==========================================
export const checkoutOrder = (data) => api.post("/orders/checkout", data);
export const verifyPayment = (data) => api.post("/orders/verify-payment", data);
export const getOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
