import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/forgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [debugLink, setDebugLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setDebugLink("");

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await API.post("auth/forgot-password/", {
        email: email.trim(),
      });

      setMessage(
        response?.data?.detail ||
          "If an account exists, a reset link has been sent."
      );
      setDebugLink(response?.data?.debug?.reset_link || "");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.join(" ")
          : detail || "Failed to process request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-header">
        <div className="fp-icon">AC</div>
        <h1>Wadia College of Engineering</h1>
        <p>Faculty Appraisal System</p>
      </div>

      <div className="fp-card">
        <h2>Forgot Password</h2>
        <p className="fp-subtitle">Enter your registered email to receive a reset link.</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="your.email@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {error && <p className="fp-message" style={{ color: "#b91c1c" }}>{error}</p>}
          {message && <p className="fp-message">{message}</p>}
          {debugLink && (
            <p className="fp-message">
              Dev link: <a href={debugLink}>{debugLink}</a>
            </p>
          )}

          <button type="submit" className="fp-btn" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="fp-back">
          <span onClick={() => navigate("/login")}>Back to Login</span>
        </div>
      </div>
    </div>
  );
}
