import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { loginCustomer } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // If user just registered, pre-fill email if passed
  const prefillEmail = location.state?.email || "";
  const [values, setValues] = useState({
    email: prefillEmail,
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Controlled component input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setAuthError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    const fieldErrors = {};
    if (!values.email.trim()) {
      fieldErrors.email = "Please enter your email.";
    }
    if (!values.password) {
      fieldErrors.password = "Please enter your password.";
    }

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      // Sends credentials with cookies (withCredentials: true configured in Axios)
      await loginCustomer({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      // On success -> Navigate to /home
      navigate("/home", { replace: true });
    } catch {
      // Problem statement requirement: Show "Invalid Credentials" on failure.
      setAuthError("Invalid Credentials");
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
            <span className="badge">Customer Login</span>
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to access your ShopKart account.</p>
          </div>

          {location.state?.registered && (
            <div className="alert alert-success" role="status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Account created successfully! Please log in to continue.</span>
            </div>
          )}

          {authError && (
            <div className="alert alert-error" role="alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="form-stack">
            {/* Email Field */}
            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={values.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "login-email-error" : undefined}
              />
              {errors.email && (
                <span id="login-email-error" className="field-error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "login-password-error" : undefined}
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
                <span id="login-password-error" className="field-error">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Login Button */}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <span className="spinner-text">Logging in…</span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <footer className="auth-footer">
            <p>
              New to ShopKart?{" "}
              <Link to="/register" className="link-highlight">
                Create an account
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
