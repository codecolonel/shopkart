import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutCustomer, getCart, getWishlist } from "../services/api.js";

export default function Navbar({ user, showLogout = false, cartCount: propCartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [cartCount, setCartCount] = useState(propCartCount || 0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // If user is logged in or on an internal app page, fetch counts
  useEffect(() => {
    let active = true;
    const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

    if (!isAuthPage) {
      getCart()
        .then((res) => {
          if (active && res.data?.items) {
            const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(count);
          }
        })
        .catch(() => {});

      getWishlist()
        .then((res) => {
          if (active && res.data?.wishlist) {
            setWishlistCount(res.data.wishlist.length);
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [location.pathname, propCartCount]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to={showLogout || user ? "/products" : "/login"} className="brand">
          <svg
            className="brand-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="brand-text">
            Shop<span className="brand-accent">Kart</span>
          </span>
        </Link>

        {/* Navigation links */}
        {!isAuthPage && (
          <nav className="main-nav">
            <Link
              to="/products"
              className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}
            >
              Products
            </Link>
            <Link
              to="/wishlist"
              className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""}`}
            >
              Wishlist {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </Link>
            <Link
              to="/cart"
              className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
            >
              Cart {cartCount > 0 && <span className="nav-badge nav-badge-accent">{cartCount}</span>}
            </Link>
            <Link
              to="/orders"
              className={`nav-link ${location.pathname === "/orders" ? "active" : ""}`}
            >
              Orders
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="navbar-actions">
          {showLogout || user ? (
            <div className="user-nav">
              <Link to="/home" className="user-badge" title="Go to Account Profile">
                <div className="avatar">
                  {(user?.name || user?.fullName || "C").charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user?.name || user?.fullName || "Account"}</span>
              </Link>

              <button
                className="btn btn-outline"
                onClick={handleLogout}
                disabled={loggingOut}
                aria-label="Log out"
              >
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            </div>
          ) : isAuthPage ? (
            <nav className="auth-nav">
              <Link
                to="/login"
                className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}
              >
                Register
              </Link>
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
