// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  // Role dropdown sirf UI ke liye rakha hai (dummy)
  // Actual role localStorage ke user se aayega
  const [role, setRole] = useState("faculty"); // 🔴 dummy UI state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // ======================================================
    // 🔥 FETCH ALL USERS (DUMMY FRONTEND AUTH)
    // In real system → backend API call
    // ======================================================
    const users = JSON.parse(localStorage.getItem("facultyUsers")) || [];

    // ======================================================
    // 🔥 FIND MATCHING USER
    // ======================================================
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    // ======================================================
    // 🔥 SAVE LOGGED-IN USER (SESSION)
    // Used by Profile, Appraisal, Dashboards
    // Dummy frontend storage
    // ======================================================
    if (remember) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
    } else {
      sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    // ======================================================
    // 🔥 ROLE-BASED REDIRECTION
    // Role is taken from ACCOUNT, not dropdown
    // ======================================================
    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "faculty") {
      navigate("/faculty/dashboard");
    } else if (user.role === "hod") {
      navigate("/hod/dashboard");
    } else if (user.role === "principal") {
      navigate("/principal/dashboard");
    } else {
      setError("Unauthorized role.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header-section">
          <h1 className="app-title">Staff Appraisal System</h1>
          <p className="app-subtitle">Login to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">

          {/* ROLE DROPDOWN (UI ONLY – NOT USED FOR AUTH) */}
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
            >
              {/* 🔴 Dummy – actual role comes from stored user */}
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="hod">HOD</option>
              <option value="principal">Principal</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Official Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@institution.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="form-control"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-options">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              <span>Remember me</span>
            </label>

            {/* 🔴 Dummy – reset password flow later */}
            <button type="button" className="forgot-link">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
        </form>

        <div className="signup-prompt">
          Don't have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={() => navigate("/create-account")}
          >
            Create one now
          </button>
        </div>
      </div>
    </div>
  );
}
