import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your registered email.");
      return;
    }

    // backend will send email later
    setMessage(
      "If this email is registered, a password reset link will be sent."
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Faculty Appraisal System</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="your.email@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {message && (
            <p className="info-text">{message}</p>
          )}

          <button type="submit" className="login-btn">
            Send Reset Link
          </button>
        </form>

        <p
          className="forgot-link center-link"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}
