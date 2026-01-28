import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";               // ✅ IMPORTANT
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("faculty"); // UI only
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  // ✅ ONE handleLogin ONLY
  const handleLogin = async (e) => {
    console.log("LOGIN BUTTON CLICKED"); // 🧪 DEBUG LINE
    e.preventDefault();
    setError("");

    try {
      console.log("Calling backend API");

      // 🔥 Django JWT login
      const response = await API.post("token/", {
      username: email.trim(),   // email value is actually username
      password: password,
    });

      console.log("Token received");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");

      // 🔐 Save token
      if (remember) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      } else {
        sessionStorage.setItem("access_token", response.data.access);
        sessionStorage.setItem("refresh_token", response.data.refresh);
      }

      // 🔥 Fetch user profile
      const profileRes = await API.get("me/");
      const user = profileRes.data;

      localStorage.setItem("loggedInUser", JSON.stringify(user));

      // 🔁 ROLE-BASED REDIRECT
      if (user.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "FACULTY") {
        navigate("/faculty/dashboard");
      } else if (user.role === "HOD") {
        navigate("/hod/dashboard");
      } else if (user.role === "PRINCIPAL") {
        navigate("/principal/dashboard");
      } else {
        setError("Unauthorized role");
      }

    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
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
