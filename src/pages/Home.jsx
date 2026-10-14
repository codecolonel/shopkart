import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getMe } from "../services/api.js";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Protected route verification
  useEffect(() => {
    let active = true;

    getMe()
      .then((res) => {
        if (!active) return;
        const payload = res.data;
        const customer =
          payload?.customer ||
          payload?.user ||
          payload?.data?.customer ||
          payload?.data?.user ||
          payload?.data ||
          payload;
        setUser(customer);
      })
      .catch((err) => {
        if (active) {
          console.warn("Protected route: unauthorized or session expired, redirecting to /login", err);
          navigate("/login", { replace: true });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar showLogout={false} />
        <main className="loading-container">
          <div className="spinner"></div>
          <p>Verifying authentication session…</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.fullName || user.name || "Valued Customer";
  const displayEmail = user.email || "No email available";
  const displayPhone = user.phone || user.phoneNumber || "No phone available";

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={true} />

      <main className="dashboard-container">
        {/* Welcome Hero */}
        <section className="welcome-hero">
          <div className="hero-content">
            <span className="badge badge-success">● Active Session</span>
            <h1>Welcome, {displayName}!</h1>
            <p className="subtitle">
              You are securely logged into your ShopKart customer portal.
            </p>
          </div>
        </section>

        {/* Quick Actions Bar */}
        <div className="dashboard-shortcuts">
          <Link to="/products" className="shortcut-card">
            <div className="shortcut-icon">🛍️</div>
            <div className="shortcut-info">
              <h3>Product Catalog</h3>
              <p>Explore electronics, gear & home essentials</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/wishlist" className="shortcut-card">
            <div className="shortcut-icon">❤️</div>
            <div className="shortcut-info">
              <h3>Saved Wishlist</h3>
              <p>View and manage products saved for later</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/cart" className="shortcut-card">
            <div className="shortcut-icon">🛒</div>
            <div className="shortcut-info">
              <h3>Shopping Cart</h3>
              <p>Review items, adjust quantities & checkout</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>

          <Link to="/orders" className="shortcut-card">
            <div className="shortcut-icon">📦</div>
            <div className="shortcut-info">
              <h3>My Orders</h3>
              <p>Track shipments and previous purchases</p>
            </div>
            <span className="shortcut-arrow">→</span>
          </Link>
        </div>

        {/* Customer Information Grid */}
        <div className="dashboard-grid">
          {/* Main Profile Card */}
          <section className="card profile-card">
            <div className="card-header">
              <div className="avatar-large">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>Customer Profile</h2>
                <span className="text-muted">Verified from <code>/customers/me</code></span>
              </div>
            </div>

            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Customer Name</span>
                  <span className="info-value">{displayName}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{displayEmail}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{displayPhone}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Account Status</span>
                  <span className="info-value">
                    <span className="status-pill status-active">Verified Customer</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Authentication Info */}
          <section className="card security-card">
            <div className="card-header">
              <div className="icon-badge">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h2>Security Overview</h2>
                <span className="text-muted">Cookie & Session Architecture</span>
              </div>
            </div>

            <div className="card-body">
              <ul className="security-features">
                <li>
                  <strong>HttpOnly Cookie:</strong> Session tokens are secured against XSS and cannot be read by JavaScript.
                </li>
                <li>
                  <strong>Protected Route:</strong> Authenticated dynamically on every page load via <code>GET /customers/me</code>.
                </li>
                <li>
                  <strong>Full E-Commerce Stack:</strong> Connected across Catalog, Wishlist, Cart, and Checkout modules.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
