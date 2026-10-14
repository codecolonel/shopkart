# 🛍️ ShopKart — Complete Full-Stack E-Commerce Platform

A production-grade, full-stack e-commerce web application implementing the entire **Lab-01 through Lab-06** problem statement curriculum from [mrinal1224/Lab-2029-Problem-Statements](https://github.com/mrinal1224/Lab-2029-Problem-Statements).

---

## 📑 Curriculum Coverage

| Lab | Module | Scope | Key Technologies |
|:---:|---|---|---|
| **Lab 01** | **Customer Auth Service** | Backend API, password hashing, JWT generation, HttpOnly cookies | Express, Mongoose, bcryptjs, JWT |
| **Lab 02** | **Client-Server Auth** | React UI with controlled forms, validation, and protected routes | React 18, React Router v6, Axios |
| **Lab 03** | **Product Catalog** | Product schema, REST endpoints, search, category filters, product details | Mongoose models, dynamic rendering, URL params |
| **Lab 04** | **Wishlist System** | MongoDB relationship references, toggle heart actions, saved items page | Mongoose `populate()`, ObjectId refs, duplicate checks |
| **Lab 05** | **Shopping Cart** | Cart quantities, stock limits, subtotal calculation, cart badge counter | Embedded document models, business rule validation |
| **Lab 06** | **Checkout & Orders** | Multi-step checkout, stock snapshotting & decrement, order history | Atomic cart-to-order mutations, status lifecycles |

---

## ⚡ Quick Start

### 1. Install Dependencies
Run `npm install` for both the frontend and backend:
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..
```

### 2. Start the Application

You can run both backend and frontend concurrently:

#### Terminal 1 — Start the Backend (Port 5000):
```bash
npm run server
```
> **Note:** The backend automatically tries to connect to `mongodb://localhost:27017/shopkart`. If no MongoDB server is active, it seamlessly launches an embedded in-memory MongoDB server with 8 pre-seeded products!

#### Terminal 2 — Start the Frontend (Port 5173):
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🏗️ Architecture & Folder Structure

```
shopkart-client/
│
├── backend/                             # Express & Mongoose MVC Backend (Labs 01, 03-06)
│   ├── controllers/
│   │   ├── customer.controller.js      # Register, Login, Me, Logout, ChangePassword
│   │   ├── product.controller.js       # Create Product, Get All, Get By ID, Search/Filter
│   │   ├── wishlist.controller.js      # Add to Wishlist, Get User Wishlist, Remove
│   │   ├── cart.controller.js          # Add to Cart, Get Cart, Update Qty, Remove Item
│   │   └── order.controller.js         # Checkout, Verify Payment, Order History
│   ├── models/
│   │   ├── customer.model.js           # Customer schema with Wishlist & Cart refs
│   │   ├── product.model.js            # Product schema with price, stock, category
│   │   └── order.model.js              # Order schema with snapshot items & address
│   ├── routes/
│   │   ├── customer.routes.js          # /customers/*
│   │   ├── product.routes.js           # /products/*
│   │   ├── wishlist.routes.js          # /wishlist/*
│   │   ├── cart.routes.js              # /cart/*
│   │   └── order.routes.js             # /orders/*
│   ├── middlewares/
│   │   └── auth.middleware.js          # Cookie & Bearer JWT token verification
│   ├── utils/
│   │   ├── generateToken.js            # JWT generator and HttpOnly cookie injector
│   │   └── seed.js                     # Sample catalog data seed script
│   ├── index.js                        # Server entry point with CORS & Mongo fallback
│   ├── package.json
│   └── .env
│
├── src/                                # React Frontend (Labs 02-06)
│   ├── components/
│   │   └── Navbar.jsx                  # Brand, navigation, cart badge & profile
│   ├── pages/
│   │   ├── Register.jsx                # /register (Controlled form with validation)
│   │   ├── Login.jsx                   # /login (HttpOnly cookie authentication)
│   │   ├── Home.jsx                    # /home (Protected dashboard & profile)
│   │   ├── Products.jsx                # /products (Catalog, search, category chips)
│   │   ├── ProductDetails.jsx          # /products/:id (Specs, stock, cart/wishlist)
│   │   ├── Wishlist.jsx                # /wishlist (Saved items, remove, move-to-cart)
│   │   ├── Cart.jsx                    # /cart (Quantity stepper, totals, checkout link)
│   │   ├── Checkout.jsx                # /checkout (Shipping address form & place order)
│   │   └── Orders.jsx                  # /orders (Order history, items snapshot, status)
│   ├── services/
│   │   └── api.js                      # Axios client with withCredentials: true
│   ├── App.jsx                         # React Router routes definition
│   ├── main.jsx
│   └── index.css                       # Responsive e-commerce styling
│
├── docs/                               # Problem statement files (Labs 01 to 06)
└── package.json
```

---

## 🔌 API Reference Summary

### Authentication (`/customers`)
- `POST /customers/register` — Create a new customer account
- `POST /customers/login` — Authenticate and set HttpOnly JWT cookie
- `GET /customers/me` — Protected session verification
- `POST /customers/logout` — Clear session cookie
- `PATCH /customers/change-password` — Update user password

### Products (`/products`)
- `POST /products` — Add a new product (stock, price, category, image)
- `GET /products?category=...&search=...` — Browse and filter products
- `GET /products/:id` — Fetch single product details

### Wishlist (`/wishlist`)
- `POST /wishlist/:productId` — Add product reference to user wishlist
- `GET /wishlist` — Get populated wishlist for current user
- `DELETE /wishlist/:productId` — Remove product from wishlist

### Cart (`/cart`)
- `POST /cart/:productId` — Add product to cart or increment quantity
- `GET /cart` — Get populated cart items and recalculated totalAmount
- `PATCH /cart/:productId` — Update item quantity (validates stock)
- `DELETE /cart/:productId` — Remove item from cart

### Orders (`/orders`)
- `POST /orders/checkout` — Validate stock, snapshot items, decrement stock, clear cart
- `POST /orders/verify-payment` — Confirm order payment
- `GET /orders` — Current user's past order history
- `GET /orders/:id` — Single order details

---

## 🎓 Viva Questions & Answers Guide

### Q1: Why do we use `withCredentials: true` in Axios?
**Answer:** By default, browsers do not attach cookies to cross-origin AJAX/fetch requests. Setting `withCredentials: true` enables the browser to send the HttpOnly session cookie across origins (from port 5173 to port 5000) and store `Set-Cookie` headers received in response.

### Q2: Why can't JavaScript read an `HttpOnly` cookie?
**Answer:** The `HttpOnly` flag prevents client-side scripts (`document.cookie`) from accessing the cookie. Even if malicious JavaScript is injected via an XSS attack, the attacker cannot steal the authentication token.

### Q3: Why do we store Product ObjectIds in Wishlist/Cart instead of full product copies?
**Answer:** Normalization prevents stale data. The `Product` collection is the single source of truth. If a product's price, stock, or image is updated, referencing its ObjectId ensures the wishlist always displays current data via `populate()`.

### Q4: Why do Orders snapshot product name, price, and image?
**Answer:** Orders represent a historical financial transaction. If a product price increases next month or the product is later deleted, the customer's order invoice must still display the exact price and name at the moment of purchase.

### Q5: What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication:** Verifying *who you are* (e.g., verifying email & password via `/customers/login`).
- **Authorization:** Verifying *what you can do* (e.g., checking if a user has permission to view an order, delete a product, or access admin routes).
