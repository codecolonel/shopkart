import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  getCart,
  updateCartItem,
  removeFromCart,
  getMe,
} from "../services/api.js";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCartData = () => {
    setLoading(true);
    setError("");

    getMe()
      .then((res) => {
        setUser(res.data.customer || res.data.user || res.data);
        return getCart();
      })
      .then((res) => {
        setCartItems(res.data?.items || []);
        setTotalAmount(res.data?.totalAmount || 0);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(err.response?.data?.message || "Failed to load your cart.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleQuantityChange = async (productId, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      setFeedback(`Cannot exceed available stock of ${stock}`);
      setTimeout(() => setFeedback(""), 2500);
      return;
    }

    setUpdatingId(productId);
    try {
      await updateCartItem(productId, newQty);
      // Re-fetch cart for accurate recalculated totals
      const res = await getCart();
      setCartItems(res.data?.items || []);
      setTotalAmount(res.data?.totalAmount || 0);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to update quantity");
      setTimeout(() => setFeedback(""), 2500);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      const res = await getCart();
      setCartItems(res.data?.items || []);
      setTotalAmount(res.data?.totalAmount || 0);
      setFeedback("Item removed from cart");
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to remove item");
    }
    setTimeout(() => setFeedback(""), 2500);
  };

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = totalAmount > 2000 || totalAmount === 0 ? 0 : 99;
  const grandTotal = totalAmount + shippingFee;

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={true} cartCount={totalItemCount} />

      {feedback && (
        <div className="toast-notification">
          <span>{feedback}</span>
        </div>
      )}

      <main className="catalog-container">
        <div className="wishlist-header">
          <div>
            <h1>Shopping Cart</h1>
            <p className="subtitle">
              {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
          <Link to="/products" className="btn btn-outline-dark">
            + Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your shopping cart…</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchCartData}>
              Try Again
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Items List */}
            <div className="cart-items-column">
              {cartItems.map((item) => {
                const product = item.product;
                if (!product) return null;

                const isUpdating = updatingId === product._id;

                return (
                  <div className="cart-item-card" key={product._id}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="cart-item-thumb"
                    />

                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <span className="cart-item-category">{product.category}</span>
                        <h3 className="cart-item-title">
                          <Link to={`/products/${product._id}`}>{product.name}</Link>
                        </h3>
                      </div>

                      <div className="cart-item-price-unit">
                        ₹{product.price.toLocaleString("en-IN")} each
                      </div>

                      <div className="cart-item-controls">
                        {/* Quantity Stepper */}
                        <div className="quantity-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={item.quantity <= 1 || isUpdating}
                            onClick={() =>
                              handleQuantityChange(product._id, item.quantity - 1, product.stock)
                            }
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            disabled={item.quantity >= product.stock || isUpdating}
                            onClick={() =>
                              handleQuantityChange(product._id, item.quantity + 1, product.stock)
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="stock-hint">
                          {product.stock} in stock
                        </span>

                        <button
                          type="button"
                          className="cart-remove-link"
                          onClick={() => handleRemove(product._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-subtotal">
                      <span className="subtotal-label">Subtotal</span>
                      <span className="subtotal-value">
                        ₹{item.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <aside className="cart-summary-sidebar">
              <div className="card summary-card">
                <h2>Order Summary</h2>

                <div className="summary-row">
                  <span>Cart Subtotal</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                </div>

                {shippingFee > 0 && (
                  <p className="shipping-hint">
                    Add ₹{(2000 - totalAmount).toLocaleString("en-IN")} more to get <strong>FREE delivery</strong>!
                  </p>
                )}

                <div className="summary-divider"></div>

                <div className="summary-row summary-total">
                  <span>Estimated Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <button
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
