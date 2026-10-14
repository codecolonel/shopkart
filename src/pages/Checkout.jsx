import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getCart, checkoutOrder, getMe } from "../services/api.js";

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    getMe()
      .then((res) => {
        const u = res.data.customer || res.data.user || res.data;
        setUser(u);
        setAddress((prev) => ({
          ...prev,
          fullName: u?.fullName || u?.name || "",
          phone: u?.phone || "",
        }));
        return getCart();
      })
      .then((res) => {
        const items = res.data?.items || [];
        setCartItems(items);
        setTotalAmount(res.data?.totalAmount || 0);
        if (items.length === 0) {
          navigate("/cart", { replace: true });
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          setError(err.response?.data?.message || "Failed to load checkout details");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setError("");
  };

  const validate = () => {
    const errs = {};
    if (!address.fullName.trim()) errs.fullName = "Full name is required";
    if (!/^\d{10}$/.test(address.phone.trim())) errs.phone = "Enter a valid 10-digit phone number";
    if (!address.addressLine1.trim()) errs.addressLine1 = "Street address is required";
    if (!address.city.trim()) errs.city = "City is required";
    if (!address.state.trim()) errs.state = "State is required";
    if (!/^\d{6}$/.test(address.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    return errs;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await checkoutOrder({
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          addressLine1: address.addressLine1.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
      });

      setOrderSuccess(res.data?.order);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const shippingFee = totalAmount > 2000 ? 0 : 99;
  const grandTotal = totalAmount + shippingFee;

  if (orderSuccess) {
    return (
      <div className="page-wrapper">
        <Navbar user={user} showLogout={true} />
        <main className="catalog-container">
          <div className="order-confirmation-card">
            <div className="conf-icon">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p className="subtitle">
              Thank you for shopping with ShopKart. Your order has been confirmed.
            </p>

            <div className="conf-details-box">
              <div className="conf-row">
                <span>Order Reference ID:</span>
                <code>{orderSuccess._id}</code>
              </div>
              <div className="conf-row">
                <span>Total Amount Paid:</span>
                <strong>₹{orderSuccess.totalAmount.toLocaleString("en-IN")}</strong>
              </div>
              <div className="conf-row">
                <span>Payment Status:</span>
                <span className="status-pill status-active">PAID</span>
              </div>
              <div className="conf-row">
                <span>Deliver To:</span>
                <span>
                  {orderSuccess.shippingAddress?.fullName}, {orderSuccess.shippingAddress?.addressLine1},{" "}
                  {orderSuccess.shippingAddress?.city} - {orderSuccess.shippingAddress?.pincode}
                </span>
              </div>
            </div>

            <div className="conf-actions">
              <Link to="/orders" className="btn btn-primary btn-lg">
                View My Orders
              </Link>
              <Link to="/products" className="btn btn-outline-dark btn-lg">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar user={user} showLogout={true} />

      <main className="catalog-container">
        <div className="wishlist-header">
          <div>
            <h1>Checkout</h1>
            <p className="subtitle">Complete your shipping address to place the order.</p>
          </div>
          <Link to="/cart" className="btn btn-outline-dark">
            ← Back to Cart
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading checkout details…</p>
          </div>
        ) : (
          <form className="checkout-layout" onSubmit={handlePlaceOrder} noValidate>
            {/* Shipping Address Form */}
            <div className="checkout-form-column">
              <div className="card checkout-card">
                <h2>1. Shipping Address</h2>

                {error && (
                  <div className="alert alert-error" role="alert">
                    <span>{error}</span>
                  </div>
                )}

                <div className="form-grid">
                  <div className="field-group">
                    <label htmlFor="fullName">Full Name <span className="req">*</span></label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={address.fullName}
                      onChange={handleChange}
                      className={fieldErrors.fullName ? "input-error" : ""}
                    />
                    {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
                  </div>

                  <div className="field-group">
                    <label htmlFor="phone">Phone Number <span className="req">*</span></label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={address.phone}
                      onChange={handleChange}
                      className={fieldErrors.phone ? "input-error" : ""}
                    />
                    {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                  </div>

                  <div className="field-group full-width">
                    <label htmlFor="addressLine1">Address / Street <span className="req">*</span></label>
                    <input
                      id="addressLine1"
                      name="addressLine1"
                      type="text"
                      placeholder="House/Flat number, Street name, Area"
                      value={address.addressLine1}
                      onChange={handleChange}
                      className={fieldErrors.addressLine1 ? "input-error" : ""}
                    />
                    {fieldErrors.addressLine1 && <span className="field-error">{fieldErrors.addressLine1}</span>}
                  </div>

                  <div className="field-group">
                    <label htmlFor="city">City <span className="req">*</span></label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={address.city}
                      onChange={handleChange}
                      className={fieldErrors.city ? "input-error" : ""}
                    />
                    {fieldErrors.city && <span className="field-error">{fieldErrors.city}</span>}
                  </div>

                  <div className="field-group">
                    <label htmlFor="state">State <span className="req">*</span></label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={address.state}
                      onChange={handleChange}
                      className={fieldErrors.state ? "input-error" : ""}
                    />
                    {fieldErrors.state && <span className="field-error">{fieldErrors.state}</span>}
                  </div>

                  <div className="field-group">
                    <label htmlFor="pincode">Pincode (6 digits) <span className="req">*</span></label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      maxLength={6}
                      value={address.pincode}
                      onChange={handleChange}
                      className={fieldErrors.pincode ? "input-error" : ""}
                    />
                    {fieldErrors.pincode && <span className="field-error">{fieldErrors.pincode}</span>}
                  </div>
                </div>
              </div>

              {/* Payment Method Option */}
              <div className="card checkout-card">
                <h2>2. Payment Method</h2>
                <div className="payment-options">
                  <label className="payment-option selected">
                    <input type="radio" name="payment" defaultChecked readOnly />
                    <div>
                      <strong>Online Payment / Razorpay Test Mode</strong>
                      <p className="text-muted">Instant mock card, UPI, & NetBanking authorization</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Review Sidebar */}
            <aside className="checkout-summary-column">
              <div className="card summary-card">
                <h2>Order Items ({cartItems.length})</h2>

                <div className="checkout-items-preview">
                  {cartItems.map((item) => (
                    <div className="preview-row" key={item.product?._id || item._id}>
                      <img src={item.product?.image} alt={item.product?.name} className="preview-thumb" />
                      <div className="preview-details">
                        <span className="preview-name">{item.product?.name}</span>
                        <span className="preview-qty-price">
                          Qty: {item.quantity} × ₹{item.product?.price}
                        </span>
                      </div>
                      <span className="preview-subtotal">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total Payable</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={submitting}
                >
                  {submitting ? "Processing Order…" : `Pay ₹${grandTotal.toLocaleString("en-IN")} & Place Order`}
                </button>
              </div>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
