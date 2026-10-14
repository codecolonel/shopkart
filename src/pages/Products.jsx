import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getProducts, getWishlist, addToWishlist, removeFromWishlist, addToCart, getMe } from "../services/api.js";

const CATEGORIES = ["All", "Electronics", "Wearables", "Fashion", "Home", "Furniture"];

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [user, setUser] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Load user session and wishlist
  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data.customer || res.data.user || res.data);
      })
      .catch(() => {});

    getWishlist()
      .then((res) => {
        if (res.data?.wishlist) {
          const ids = new Set(res.data.wishlist.map((item) => (item._id || item)));
          setWishlistIds(ids);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch products from backend
  const fetchProducts = () => {
    setLoading(true);
    setError("");

    const params = {};
    if (selectedCategory && selectedCategory !== "All") {
      params.category = selectedCategory;
    }
    if (search.trim()) {
      params.search = search.trim();
    }

    getProducts(params)
      .then((res) => {
        setProducts(res.data?.products || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load products. Please check your backend.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    const isWishlisted = wishlistIds.has(productId);
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        showNotification("Removed from Wishlist");
      } else {
        await addToWishlist(productId);
        setWishlistIds((prev) => new Set(prev).add(productId));
        showNotification("Added to Wishlist ❤️");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Could not update wishlist");
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(product._id);
      setCartCount((prev) => prev + 1);
      showNotification(`Added "${product.name}" to cart! 🛒`);
    } catch (err) {
      showNotification(err.response?.data?.message || "Could not add to cart");
    }
  };

  const showNotification = (msg) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage("");
    }, 2800);
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={!!user} cartCount={cartCount} />

      {actionMessage && (
        <div className="toast-notification">
          <span>{actionMessage}</span>
        </div>
      )}

      <main className="catalog-container">
        {/* Header & Controls */}
        <section className="catalog-header">
          <div className="catalog-titles">
            <h1>Discover Products</h1>
            <p className="subtitle">Explore our latest electronics, gadgets, wearables, and more.</p>
          </div>

          {/* Search bar */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products by title, category, or specs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </section>

        {/* Category Pills */}
        <div className="category-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading catalog products…</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try clearing your search filters or check another category.</p>
            <button
              className="btn btn-outline-dark"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              const isWishlisted = wishlistIds.has(product._id);
              const outOfStock = product.stock <= 0;

              return (
                <div className="product-card" key={product._id}>
                  {/* Image & Wishlist Button */}
                  <div className="product-image-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                    <button
                      className={`wishlist-heart-btn ${isWishlisted ? "active" : ""}`}
                      onClick={() => handleToggleWishlist(product._id)}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      aria-label="Wishlist"
                    >
                      {isWishlisted ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">
                      <Link to={`/products/${product._id}`}>{product.name}</Link>
                    </h3>
                    <p className="product-desc">{product.description}</p>

                    <div className="product-price-row">
                      <span className="product-price">₹{product.price.toLocaleString("en-IN")}</span>
                      <span className={`stock-status ${outOfStock ? "out" : "in"}`}>
                        {outOfStock ? "Out of Stock" : `${product.stock} in stock`}
                      </span>
                    </div>

                    <div className="product-actions">
                      <Link to={`/products/${product._id}`} className="btn btn-outline-dark btn-sm">
                        Details
                      </Link>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product)}
                      >
                        {outOfStock ? "Sold Out" : "Add to Cart"}
                      </button>
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
