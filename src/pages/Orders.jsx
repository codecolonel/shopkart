import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrders, getMe } from "../services/api.js";

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.data.customer || res.data.user || res.data);
        return getOrders();
      })
      .then((res) => {
        setOrders(res.data?.orders || []);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(err.response?.data?.message || "Failed to load orders");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={true} />

      <main className="catalog-container">
        <div className="wishlist-header">
          <div>
            <h1>My Orders</h1>
            <p className="subtitle">
              Track and review your past ShopKart purchases.
            </p>
          </div>
          <Link to="/products" className="btn btn-outline-dark">
            Browse Products
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your orders…</p>
          </div>
        ) : error ? (
          <div className="error-card">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders with ShopKart yet.</p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div className="card order-card" key={order._id}>
                  <div className="order-card-header">
                    <div className="order-meta">
                      <span className="order-id-label">Order Reference:</span>
                      <code>{order._id}</code>
                      <span className="order-date">• Placed on {dateStr}</span>
                    </div>

                    <div className="order-badges">
                      <span className="status-pill status-active">{order.paymentStatus}</span>
                      <span className="status-pill status-placed">{order.status}</span>
                    </div>
                  </div>

                  <div className="order-card-body">
                    {/* Items snapshot */}
                    <div className="order-items-grid">
                      {order.items?.map((item, idx) => (
                        <div className="order-item-row" key={idx}>
                          <img src={item.image} alt={item.name} className="order-item-thumb" />
                          <div className="order-item-desc">
                            <h4>{item.name}</h4>
                            <span className="text-muted">
                              Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="order-item-line-total">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary-footer">
                      <div className="order-ship-to">
                        <strong>Shipping Address:</strong>
                        <p className="text-muted">
                          {order.shippingAddress?.fullName}, {order.shippingAddress?.addressLine1},{" "}
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                          {order.shippingAddress?.pincode} | Phone: {order.shippingAddress?.phone}
                        </p>
                      </div>

                      <div className="order-total-block">
                        <span className="text-muted">Grand Total:</span>
                        <span className="order-grand-total">
                          ₹{order.totalAmount?.toLocaleString("en-IN")}
                        </span>
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
