import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FacultyAppraisalStatus.css";

/* 🔁 TURN THIS OFF WHEN BACKEND IS READY */
const USE_DUMMY_DATA = true;

export default function FacultyAppraisalStatus() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("under-review");
  const [loading, setLoading] = useState(!USE_DUMMY_DATA);
  const [error, setError] = useState(null);

  /* ================= STATE (DJANGO-FRIENDLY) ================= */
  const [appraisalData, setAppraisalData] = useState({
    underReview: [],
    approved: [],
    changesRequested: [],
  });

  /* ================= DUMMY DATA (PREVIEW ONLY) ================= */
  const dummyData = {
    underReview: [
      {
        id: 1,
        academic_year: "2024-25",
        submitted_date: "15 Jan 2025",
        current_level: "HOD",
        status: "Under Review",
      },
    ],
    approved: [
      {
        id: 2,
        academic_year: "2023-24",
        submitted_date: "10 Dec 2023",
        current_level: "Completed",
        status: "Approved",
      },
    ],
    changesRequested: [
      {
        id: 3,
        academic_year: "2022-23",
        submitted_date: "05 Jan 2023",
        current_level: "Principal",
        status: "Changes Requested",
        remarks:
          "Please update the research publications section and attach supporting documents.",
      },
    ],
  };

  /* ================= DATA LOADING ================= */
  useEffect(() => {
    if (USE_DUMMY_DATA) {
      // ✅ Preview mode
      setAppraisalData(dummyData);
      setLoading(false);
      return;
    }

    // ✅ Real Django API mode
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:8000/api/faculty/appraisal/status/",
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response from backend");
        }

        const data = await response.json();

        setAppraisalData({
          underReview: data.under_review || [],
          approved: data.approved || [],
          changesRequested: data.changes_requested || [],
        });
      } catch
      {
        setError("Unable to load appraisal status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  /* ================= RENDER HELPERS ================= */
  const renderEmpty = (msg) => (
    <div className="empty-state">
      <p>{msg}</p>
    </div>
  );

  const renderContent = () => {
    if (loading) return renderEmpty("Loading appraisal status...");
    if (error) return renderEmpty(error);

    const dataMap = {
      "under-review": appraisalData.underReview,
      approved: appraisalData.approved,
      "changes-requested": appraisalData.changesRequested,
    };

    const list = dataMap[activeTab];

    if (!list || list.length === 0) {
      return renderEmpty("No records found");
    }

    return list.map((item) => (
      <div key={item.id} className="status-card">
        <div className="status-card-header">
          <h3>Academic Year {item.academic_year}</h3>
        </div>

        <div className="status-card-body">
       <div className="status-info-grid">
  <div className="status-info-item">
    <span className="status-info-label">Academic Year</span>
    <span className="status-info-value">{item.academic_year}</span>
  </div>

  <div className="status-info-item">
    <span className="status-info-label">Submitted Date</span>
    <span className="status-info-value">
      {item.submitted_date || "—"}
    </span>
  </div>

  <div className="status-info-item">
    <span className="status-info-label">Current Level</span>
    <span className="status-info-value">
      {item.current_level || "—"}
    </span>
  </div>

  <div className="status-info-item">
    <span className="status-info-label">Status</span>
    <span className={`status-badge ${activeTab}`}>
      {item.status}
    </span>
  </div>
</div>


          {activeTab === "changes-requested" && item.remarks && (
            <div className="remarks-section">
              <h4>Remarks</h4>
              <p>{item.remarks}</p>
            </div>
          )}

          {activeTab === "changes-requested" && (
            <button
              className="edit-btn"
              onClick={() => navigate("/faculty/appraisal")}
            >
              Edit & Re-submit
            </button>
          )}
        </div>
      </div>
    ));
  };

  /* ================= UI ================= */
  return (
    <div className="status-page">
      <button className="back-btn" onClick={() => navigate("/faculty/dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="status-header-card">
        <h1>Appraisal Status</h1>
        <p className="subtitle">Track approval status</p>
      </div>

      <div className="status-tabs">
        <button
          className={`status-tab ${activeTab === "under-review" ? "active" : ""}`}
          onClick={() => setActiveTab("under-review")}
        >
          🟡 Under Review
        </button>
        <button
          className={`status-tab ${activeTab === "approved" ? "active" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          🟢 Approved
        </button>
        <button
          className={`status-tab ${
            activeTab === "changes-requested" ? "active" : ""
          }`}
          onClick={() => setActiveTab("changes-requested")}
        >
          🔴 Changes Requested
        </button>
      </div>

      <div className="status-content">{renderContent()}</div>
    </div>
  );
}
