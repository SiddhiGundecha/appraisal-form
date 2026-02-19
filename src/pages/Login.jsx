import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/Login.css";
import useSessionState from "../hooks/useSessionState";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useSessionState("login.email", "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useSessionState("login.remember", false);
  const [error, setError] = useSessionState("login.error", "");

  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const lastRoute = sessionStorage.getItem("lastRoute");
    if (access && lastRoute && lastRoute !== "/login") {
      navigate(lastRoute, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("token/", {
        username: email.trim(),
        password,
      });

      const { access, refresh } = response.data;

      localStorage.clear();
      sessionStorage.clear();

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      API.defaults.headers.common["Authorization"] = `Bearer ${access}`;

      const profileRes = await API.get("me/");
      const user = profileRes.data;

      localStorage.setItem("loggedInUser", JSON.stringify(user));

      if (user.must_change_password) {
        navigate("/faculty/profile?tab=password");
        return;
      }

      const lastRoute = sessionStorage.getItem("lastRoute");
      if (lastRoute && !["/login", "/forgot-password", "/reset-password"].includes(lastRoute)) {
        navigate(lastRoute);
        return;
      }

      switch (user.role) {
        case "FACULTY":
          navigate("/faculty/dashboard");
          break;
        case "HOD":
          navigate("/hod/dashboard");
          break;
        case "PRINCIPAL":
          navigate("/principal/dashboard");
          break;
        case "ADMIN":
          navigate("/admin/dashboard");
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

            <button
              type="button"
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
