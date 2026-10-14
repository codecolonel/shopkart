import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  getWishlist,
  removeFromWishlist,
  addToCart,
  getMe,
} from "../services/api.js";

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const fetchWishlistData = () => {
    setLoading(true);
    setError("");

    getMe()
      .then((res) => {
        setUser(res.data.customer || res.data.user || res.data);
        return getWishlist();
      })
      .then((res) => {
        setWishlist(res.data?.wishlist || []);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(err.response?.data?.message || "We couldn't load your wishlist.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setFeedback("Product removed from wishlist");
    } catch (err) {
      setFeedback(err.response?.data?.message || "Failed to remove item");
    }
    setTimeout(() => setFeedback(""), 2800);
  };

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product._id);
      await removeFromWishlist(product._id);
      setWishlist((prev) => prev.filter((item) => item._id !== product._id));
      setCartCount((prev) => prev + 1);
      setFeedback(`Moved "${product.name}" to cart! 🛒`);
    } catch (err) {
      setFeedback(err.response?.data?.message || "Could not move to cart");
    }
    setTimeout(() => setFeedback(""), 2800);
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={true} cartCount={cartCount} />

      {feedback && (
        <div className="toast-notification">
          <span>{feedback}</span>
        </div>
      )}

      <main className="catalog-container">
        <div className="wishlist-header">
          <div>
            <h1>My Wishlist</h1>
            <p className="subtitle">
              {wishlist.length} {wishlist.length === 1 ? "product saved" : "products saved"}
            </p>
          </div>
          <Link to="/products" className="btn btn-outline-dark">
            + Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your wishlist…</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchWishlistData}>
              Try Again
            </button>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map((product) => {
              const outOfStock = product.stock <= 0;

              return (
                <div className="product-card" key={product._id}>
                  <div className="product-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>

                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </h3>

                    <div className="product-price-row">
                      <span className="product-price">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className={`stock-status ${outOfStock ? "out" : "in"}`}>
                        {outOfStock ? "Out of Stock" : `${product.stock} units left`}
                      </span>
                    </div>

                    <div className="product-actions-stacked">
                      <button
                        className="btn btn-primary btn-sm btn-block"
                        disabled={outOfStock}
                        onClick={() => handleMoveToCart(product)}
                      >
                        {outOfStock ? "Out of Stock" : "Move to Cart 🛒"}
                      </button>

                      <div className="card-btn-split">
                        <Link
                          to={`/products/${product._id}`}
                          className="btn btn-outline-dark btn-sm"
                        >
                          Details
                        </Link>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemove(product._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
