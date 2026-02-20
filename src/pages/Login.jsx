import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/Login.css";
import useSessionState from "../hooks/useSessionState";

const AUTH_KEYS = [
  "access",
  "refresh",
  "access_token",
  "refresh_token",
  "loggedInUser",
  "userProfile",
  "role",
];

const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const saveAuth = ({ access, refresh, user, remember }) => {
  const target = remember ? localStorage : sessionStorage;
  target.setItem("access", access);
  target.setItem("refresh", refresh);
  target.setItem("loggedInUser", JSON.stringify(user));
  if (user?.role) {
    target.setItem("role", user.role);
  }
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const routeByRole = (navigate, role, fallback = true) => {
  switch (role) {
    case "FACULTY":
      navigate("/faculty/dashboard", { replace: true });
      return true;
    case "HOD":
      navigate("/hod/dashboard", { replace: true });
      return true;
    case "PRINCIPAL":
      navigate("/principal/dashboard", { replace: true });
      return true;
    case "ADMIN":
      navigate("/admin/dashboard", { replace: true });
      return true;
    default:
      if (fallback) navigate("/login", { replace: true });
      return false;
  }
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useSessionState("login.email", "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useSessionState("login.remember", false);
  const [error, setError] = useSessionState("login.error", "");

  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (!access) return;

    const lastRoute = sessionStorage.getItem("lastRoute");
    if (lastRoute && !["/login", "/forgot-password", "/reset-password"].includes(lastRoute)) {
      navigate(lastRoute, { replace: true });
      return;
    }

    const user = getStoredUser();
    if (user?.role) {
      routeByRole(navigate, user.role, false);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await API.post("auth/login/", {
        username: email.trim(),
        password,
      });

      const { access, refresh } = response.data;
      const user = response.data?.user || (await API.get("me/")).data;
      const lastRoute = sessionStorage.getItem("lastRoute");

      clearAuthStorage();

      API.defaults.headers.common.Authorization = `Bearer ${access}`;

      saveAuth({ access, refresh, user, remember });

      if (user?.must_change_password) {
        navigate("/faculty/profile?tab=password", { replace: true });
        return;
      }

      if (lastRoute && !["/login", "/forgot-password", "/reset-password"].includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
        return;
      }

      if (!routeByRole(navigate, user?.role, false)) {
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


