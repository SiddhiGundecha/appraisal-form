import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔐 JWT Login
      const response = await API.post("token/", {
        username: email.trim(), // backend treats this as username
        password: password,
      });

      // Clear any old tokens
      localStorage.clear();
      sessionStorage.clear();

      // Store tokens
      if (remember) {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
      } else {
        sessionStorage.setItem("access_token", response.data.access);
        sessionStorage.setItem("refresh_token", response.data.refresh);
      }

      // 🔥 Fetch logged-in user profile
      const profileRes = await API.get("me/");
      const user = profileRes.data;

      localStorage.setItem("loggedInUser", JSON.stringify(user));

      // 🔁 Backend-controlled role routing
      switch (user.role) {
        case "Admin":
          navigate("/admin/dashboard");
          break;
        case "FACULTY":
          navigate("/faculty/dashboard");
          break;
        case "HOD":
          navigate("/hod/dashboard");
          break;
        case "PRINCIPAL":
          navigate("/principal/dashboard");
          break;
        default:
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
