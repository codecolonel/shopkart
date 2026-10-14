import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import {
  getProductById,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  getMe,
} from "../services/api.js";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data.customer || res.data.user || res.data))
      .catch(() => {});

    getWishlist()
      .then((res) => {
        if (res.data?.wishlist) {
          const match = res.data.wishlist.some(
            (item) => (item._id || item) === id
          );
          setIsWishlisted(match);
        }
      })
      .catch(() => {});

    setLoading(true);
    getProductById(id)
      .then((res) => {
        setProduct(res.data?.product);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load product details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        setIsWishlisted(false);
        setFeedback("Removed from Wishlist");
      } else {
        await addToWishlist(id);
        setIsWishlisted(true);
        setFeedback("Added to Wishlist ❤️");
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || "Could not update wishlist");
    }
    setTimeout(() => setFeedback(""), 2800);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(id);
      setCartCount((prev) => prev + 1);
      setFeedback("Added to Shopping Cart! 🛒");
    } catch (err) {
      setFeedback(err.response?.data?.message || "Could not add to cart");
    }
    setTimeout(() => setFeedback(""), 2800);
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={!!user} cartCount={cartCount} />

      {feedback && (
        <div className="toast-notification">
          <span>{feedback}</span>
        </div>
      )}

      <main className="catalog-container">
        <div className="breadcrumbs">
          <Link to="/products">← Back to Products</Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading product details…</p>
          </div>
        ) : error || !product ? (
          <div className="error-card">
            <h2>Product Not Found</h2>
            <p>{error || "The requested product does not exist."}</p>
            <Link to="/products" className="btn btn-primary">
              Return to Catalog
            </Link>
          </div>
        ) : (
          <section className="product-detail-card">
            <div className="detail-media">
              <img src={product.image} alt={product.name} className="detail-image" />
            </div>

            <div className="detail-info">
              <span className="badge">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="detail-price">₹{product.price.toLocaleString("en-IN")}</p>

              <div className="stock-badge-wrap">
                {product.stock > 0 ? (
                  <span className="status-pill status-active">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="status-pill status-out">Out of Stock</span>
                )}
              </div>

              <div className="detail-desc-box">
                <h3>About This Product</h3>
                <p>{product.description}</p>
              </div>

              <div className="detail-actions">
                <button
                  className="btn btn-primary btn-lg"
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                >
                  {product.stock <= 0 ? "Out of Stock" : "Add to Cart 🛒"}
                </button>

                <button
                  className={`btn btn-outline-dark btn-lg ${isWishlisted ? "active-wishlist" : ""}`}
                  onClick={handleToggleWishlist}
                >
                  {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
