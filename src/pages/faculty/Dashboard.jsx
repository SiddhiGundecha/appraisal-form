import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  // read status
  const appraisalStatus = localStorage.getItem("appraisalStatus");

  // disable form ONLY when under review or approved
  const disableNewForm =
    appraisalStatus === "under_review" ||
    appraisalStatus === "approved";

  return (
    <div className="dashboard-page">
      {/* HEADER CARD */}
      <div className="dashboard-header-card">
        <div>
          <h2>Faculty Dashboard</h2>
          <p className="dashboard-subtitle">
            Access your profile, appraisal forms, and status
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* CARDS */}
      <div className="dashboard-grid">

        {/* PROFILE */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/faculty/profile")}
        >
          <h3>My Profile</h3>
          <p>View official details and update personal information</p>
        </div>

        {/* APPRAISAL FORM */}
        <div
          className={`dashboard-card ${disableNewForm ? "disabled" : ""}`}
          onClick={() => {
            if (!disableNewForm) navigate("/faculty/appraisal");
          }}
        >
          <h3>Appraisal Form</h3>
          <p>
            {disableNewForm
              ? "Appraisal already submitted"
              : appraisalStatus === "changes_requested"
              ? "Edit and re-submit appraisal"
              : "Fill and submit your annual faculty appraisal"}
          </p>
        </div>

        {/* STATUS – ALWAYS ENABLED */}
        <div
          className="dashboard-card"
          onClick={() => navigate("/faculty/appraisal/status")}
        >
          <h3>Appraisal Status</h3>
          <p>Track approval status from HOD and Principal</p>
        </div>

      </div>
    </div>
  );
}
