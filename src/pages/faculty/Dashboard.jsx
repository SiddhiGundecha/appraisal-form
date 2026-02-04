import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/dashboard.css";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [appraisal, setAppraisal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  /* ================= FETCH CURRENT APPRAISAL ================= */
  useEffect(() => {
    
    const fetchCurrentAppraisal = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(
        "http://127.0.0.1:8000/api/faculty/appraisal/status/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

        const data = await response.json();

        // if empty object => no appraisal yet
        if (Object.keys(data).length === 0) {
          setAppraisal(null);
        } else {
          setAppraisal(data);
        }
      } catch (error) {
        console.error("Failed to load appraisal status", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentAppraisal();
  }, []);

  /* ================= DERIVED LOGIC ================= */

  // disable form when appraisal is under review or approved
  const disableNewForm =
    appraisal &&
    appraisal.status &&
    ![
      "DRAFT",
      "RETURNED_BY_HOD",
      "RETURNED_BY_PRINCIPAL",
    ].includes(appraisal.status);

  /* ================= UI ================= */
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

      {/* DASHBOARD CARDS */}
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
            {loading
              ? "Checking appraisal status..."
              : !appraisal || !appraisal.status
              ? "Fill and submit your annual faculty appraisal"
              : appraisal.status.includes("RETURNED")
              ? "Edit and re-submit appraisal"
              : "Appraisal already submitted"}
          </p>
        </div>

        {/* APPRAISAL STATUS */}
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
