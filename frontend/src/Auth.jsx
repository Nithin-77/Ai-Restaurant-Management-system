import { useState } from "react";
import { loginUser, registerUser } from "./api";

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = isRegistering
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password });

      // Store JWT token
      if (response.token) {
        localStorage.setItem("paradise_token", response.token);
      }

      onAuthenticated(response.user);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCustomer = () => {
    onAuthenticated({
      id: 101,
      name: "Nithin",
      email: "nithin@example.com",
      role: "customer",
    });
  };

  const handleQuickAdmin = async () => {
    try {
      setSubmitting(true);
      const res = await loginUser({ email: "admin@paradise.com", password: "admin123" });
      if (res.token) {
        localStorage.setItem("paradise_token", res.token);
      }
      onAuthenticated(res.user);
    } catch {
      onAuthenticated({
        id: 1,
        name: "Admin Nithin",
        email: "admin@paradise.com",
        role: "admin",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand-mark">P</div>
        <span className="auth-kicker">AN INTEGRATED AI-POWERED RESTAURANT MANAGEMENT SYSTEM</span>
        <h1>{isRegistering ? "Create your workspace" : "Welcome back"}</h1>
        <p className="auth-intro">
          {isRegistering
            ? "Unified platform combining restaurant operations, customer dining, AI analytics, and decision support."
            : "Sign in to access your digital restaurant operations and AI decision engines."}
        </p>

        <div className="quick-access-box">
          <span className="quick-access-title">⚡ Instant Demonstration Access:</span>
          <div className="quick-access-row">
            <button
              type="button"
              className="quick-btn customer"
              onClick={handleQuickCustomer}
            >
              🍽️ Open Customer Portal
            </button>
            <button
              type="button"
              className="quick-btn admin"
              onClick={handleQuickAdmin}
            >
              🛡️ Open Admin Portal
            </button>
          </div>
        </div>

        <div className="auth-divider">
          <span>or enter credentials</span>
        </div>

        {isRegistering && (
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength="6"
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting
            ? "Working..."
            : isRegistering
              ? "Create account"
              : "Sign in"}
        </button>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(isRegistering ? "login" : "register");
            setError("");
          }}
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "New to Paradise? Create an account"}
        </button>

        <div className="team-credits-auth">
          <span>Project by: Y.Nithin, N.Sasidharreddy, N.Lakshmi Charan, Y.Sri Sai Teja</span>
        </div>
      </form>
    </main>
  );
}

export default Auth;