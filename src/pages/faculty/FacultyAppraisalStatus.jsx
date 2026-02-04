import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/FacultyAppraisalStatus.css";

/* 🔁 TURN THIS OFF WHEN BACKEND IS READY */
const USE_DUMMY_DATA = false;

export default function FacultyAppraisalStatus() {
  const navigate = useNavigate();

  // ✅ FIX: use plain string, NOT API constant
  const [activeTab, setActiveTab] = useState("under-review");
  const [loading, setLoading] = useState(!USE_DUMMY_DATA);
  const [error, setError] = useState(null);

  /* ================= STATE ================= */
  const [appraisalData, setAppraisalData] = useState({
    underReview: [],
    approved: [],
    changesRequested: [],
  });

  /* ================= DUMMY DATA ================= */
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
    approved: [],
    changesRequested: [],
  };

  /* ================= DATA LOADING ================= */
  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setAppraisalData(dummyData);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);

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

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();

        setAppraisalData({
          underReview: data.under_review || [],
          approved: data.approved || [],
          changesRequested: data.changes_requested || [],
        });
      } catch (err) {
        console.error(err);
        setError("Unable to load appraisal status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  /* ================= RENDER ================= */
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
