import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CreateAccount.css";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    designation: "", // Teaching Staff / HOD / Principal / Admin
    joiningDate: "",
    department: "",
    address: "",
    email: "",
    mobile: "",
    gradePay: "",
    promotionDesignation: "",
    eligibilityDate: "",
    assessmentPeriod: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);

    if (name === "password" || name === "confirmPassword") {
      setPasswordMismatch(
        updated.confirmPassword &&
        updated.password !== updated.confirmPassword
      );
    }

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔴 BASIC VALIDATION
    if (
      !form.name ||
      !form.designation ||
      !form.joiningDate ||
      !form.address ||
      !form.email ||
      !form.mobile ||
      !form.department
    ) {
      setError("Please fill all mandatory fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    // ======================================================
    // 🔥 IMPORTANT LOGIC: DESIGNATION → ROLE MAPPING
    // This is REQUIRED for role-based login & dashboards
    // (Frontend dummy logic – backend will do this later)
    // ======================================================
    const role =
      form.designation === "HOD"
        ? "hod"
        : form.designation === "Principal"
        ? "principal"
        : form.designation === "Admin"
        ? "admin"
        : "faculty"; // Teaching Staff → faculty

    // ======================================================
    // 🔥 USER OBJECT STORED FOR LOGIN (DUMMY FRONTEND AUTH)
    // This replaces backend + database for now
    // ======================================================
    const userForLogin = {
      email: form.email,
      password: form.password, // ❗ Dummy: never store plain password in real apps
      role, // faculty / hod / principal / admin
      department: form.department, // used for HOD filtering later
    };

    // ======================================================
    // 🔥 SAVE MULTIPLE USERS (FACULTY / HOD / PRINCIPAL)
    // ======================================================
    const users = JSON.parse(localStorage.getItem("facultyUsers")) || [];

    // ❌ Prevent duplicate email accounts
    const emailExists = users.some((u) => u.email === form.email);
    if (emailExists) {
      setError("Account with this email already exists.");
      return;
    }

    users.push(userForLogin); // ✅ ADD USER
    localStorage.setItem("facultyUsers", JSON.stringify(users));

    // ======================================================
    // 🔥 SAVE FULL PROFILE DATA (FOR PROFILE PAGE)
    // Dummy storage – later backend will handle this
    // ======================================================
    const { password, confirmPassword, ...profileOnlyData } = form;

    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        ...profileOnlyData,
        role, // needed to show role on profile page
      })
    );

    // ======================================================
    // 🔥 REDIRECT TO LOGIN
    // ======================================================
    navigate("/login");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        {/* HEADER */}
        <div className="header-section">
          <h1 className="app-title">Create Account</h1>
          <p className="app-subtitle">
            Join our academic platform today
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* FORM */}
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Name *</label>
              <input name="name" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <select name="designation" onChange={handleChange}>
                <option value="">-- Choose your designation --</option>

                {/* These values are mapped to roles internally */}
                <option>Teaching Staff</option> {/* → faculty */}
                <option>HOD</option>             {/* → hod */}
                <option>Principal</option>       {/* → principal */}
                <option>Admin</option>           {/* → admin */}
              </select>
            </div>

            <div className="form-group">
              <label>Date of Joining *</label>
              <input type="date" name="joiningDate" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Department / Centre *</label>
              <input name="department" onChange={handleChange} />
            </div>

            <div className="form-group full-width">
              <label>Communication Address *</label>
              <textarea name="address" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Mobile Number *</label>
              <input name="mobile" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Current Designation & Grade Pay</label>
              <input name="gradePay" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Designation of Promotion</label>
              <input name="promotionDesignation" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Eligibility Date</label>
              <input type="date" name="eligibilityDate" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Assessment Period</label>
              <input
                name="assessmentPeriod"
                placeholder="e.g. 2023–2024"
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                className={passwordMismatch ? "input-error" : ""}
              />
              {passwordMismatch && (
                <span className="field-error">Passwords do not match</span>
              )}
            </div>

          </div>

          {/* ACTIONS */}
          <div className="form-actions">
            <button className="btn btn-primary">Create Account</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
