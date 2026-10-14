import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { registerCustomer } from "../services/api.js";

const validate = (values) => {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = "Full Name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Full Name must be at least 2 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone Number is required.";
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid 10-digit phone number.";
  }

  return errors;
};

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Controlled component input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        phone: values.phone.trim(),
      });
      // Redirect to login on success as per requirement
      navigate("/login", {
        replace: true,
        state: { registered: true, email: values.email.trim().toLowerCase() },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please check your details and try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="badge">Customer Registration</span>
            <h1>Create Account</h1>
            <p className="subtitle">Join ShopKart to start shopping today.</p>
          </div>

          {serverError && (
            <div className="alert alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="form-stack">
            {/* Full Name */}
            <div className="field-group">
              <label htmlFor="name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Doe"
                value={values.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <span id="name-error" className="field-error">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="field-group">
              <label htmlFor="email">
                Email <span className="req">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="e.g. jane.doe@example.com"
                value={values.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <span id="email-error" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="field-group">
              <label htmlFor="password">
                Password <span className="req">*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={values.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className="field-error">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className="field-group">
              <label htmlFor="phone">
                Phone Number <span className="req">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={values.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className="field-error">
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Create Account Button */}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="spinner-text">Creating Account…</span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="link-highlight">
                Log in
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
