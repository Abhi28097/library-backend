import { useState } from "react";
import "./Login.css";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    adminCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      adminCode: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = mode === "login" ? "/login" : "/register";
      const payload = {
        email: form.email,
        password: form.password,
        role,
      };

      if (mode === "signup") {
        payload.name = form.name;
      }

      if (mode === "signup" && role === "admin") {
        payload.admin_code = form.adminCode;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const validationMessage = data?.message || Object.values(data?.errors || {}).flat().join(" ");
        const fallbackMessage =
          res.status === 401
            ? "Invalid email or password. Please check your details."
            : res.status === 403
            ? "This account does not have access to the selected panel."
            : `Authentication failed (${res.status}). Please try again.`;
        throw new Error(validationMessage || fallbackMessage);
      }

      onLogin({
        ...data.user,
        token: data.token,
      });
      resetForm();
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop" />

      <div className="login-shell">
        <section className="login-showcase">
          <p className="login-chip">Advanced Library UI</p>
          <h1>Login to the digital library</h1>
          <p className="login-lead">Quick access for readers and admins.</p>

          <div className="showcase-points">
            <article>
              <strong>User Panel</strong>
              <span>Browse and read books.</span>
            </article>
            <article>
              <strong>Admin Panel</strong>
              <span>Protected admin access.</span>
            </article>
            <article>
              <strong>Profile Options</strong>
              <span>Edit profile from the top menu.</span>
            </article>
          </div>
        </section>

        <section className="login-card">
          <div className="login-header">
            <p className="login-chip">{mode === "login" ? "Welcome Back" : "Create Account"}</p>
            <h2>{mode === "login" ? "Enter your account" : "Create your account"}</h2>
            <p>Select whether you want to enter as a user or admin.</p>
          </div>

          <div className="role-switcher">
            <button
              type="button"
              className={role === "user" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("user")}
            >
              User Panel
            </button>
            <button
              type="button"
              className={role === "admin" ? "role-btn active" : "role-btn"}
              onClick={() => setRole("admin")}
            >
              Admin Panel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {mode === "signup" && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder={role === "admin" ? "Admin Password" : "User Password"}
              value={form.password}
              onChange={handleChange}
            />

            {mode === "signup" && role === "admin" && (
              <input
                type="password"
                name="adminCode"
                placeholder="Enter Admin Access Code"
                value={form.adminCode}
                onChange={handleChange}
              />
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? `Login as ${role === "admin" ? "Admin" : "User"}`
                : `Create ${role === "admin" ? "Admin" : "User"} Account`}
            </button>
          </form>

          <button
            type="button"
            className="switch-btn"
            onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
          >
            {mode === "login"
              ? "Need a new account? Sign Up"
              : "Already have an account? Login"}
          </button>

          <p className="login-note">
            Admin signup uses the backend access code.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
