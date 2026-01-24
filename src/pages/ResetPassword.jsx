import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/resetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Backend integration later (token + API call)
    setMessage("Password reset successful. Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="rp-page">
      <div className="rp-header">
        <div className="rp-icon">📘</div>
        <h1>Wadia College of Engineering</h1>
        <p>Faculty Appraisal System</p>
      </div>

      <div className="rp-card">
        <h2>Reset Password</h2>
        <p className="rp-subtitle">
          Enter your new password below
        </p>

        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && <p className="rp-message">{message}</p>}

          <button type="submit" className="rp-btn">
            Reset Password
          </button>
        </form>

        <div className="rp-back">
          <span onClick={() => navigate("/login")}>
            ← Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}
