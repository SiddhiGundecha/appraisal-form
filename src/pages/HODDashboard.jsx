import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/HODDashboard.css";
import "../styles/dashboard.css";

export default function HODDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= HOD SELF APPRAISAL ================= */
  const [hodOwnAppraisal, setHodOwnAppraisal] = useState({
    academicYear: "2024-25",
    status: "not_started", // not_started | in_progress | submitted
    submissionDate: null,
  });

  /* ================= FACULTY SUBMISSIONS ================= */
  const [submissions, setSubmissions] = useState({
    pending: [],
    processed: [],
  });

  /* ================= LOAD HOD SELF APPRAISAL ================= */
  useEffect(() => {
    const stored = localStorage.getItem("hodOwnAppraisal");
    if (stored) setHodOwnAppraisal(JSON.parse(stored));
  }, []);

  /* ================= FETCH APPRAISALS ================= */
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        setError("");

        // 1️⃣ Fetch Faculty submissions to review
        const res = await API.get("hod/appraisals/");
        const data = res.data || [];

        const pending = data.filter(
          (a) => a.status === "SUBMITTED" || a.status === "REVIEWED_BY_HOD"
        );

        const processed = data.filter(
          (a) => ["HOD_APPROVED", "REVIEWED_BY_PRINCIPAL", "PRINCIPAL_APPROVED", "FINALIZED"].includes(a.status)
        );

        setSubmissions({ pending, processed });

        // 2️⃣ Fetch HOD's OWN appraisals
        const ownRes = await API.get("hod/appraisals/me/");
        const ownData = ownRes.data || [];
        if (ownData.length > 0) {
          const latest = ownData[0];
          const actualStatus = latest.status;
          const isReturned = actualStatus === "RETURNED_BY_PRINCIPAL";

          setHodOwnAppraisal({
            academicYear: latest.academic_year,
            status: (actualStatus.toLowerCase() === "draft" || isReturned) ? "in_progress" : "submitted",
            submissionDate: latest.updated_at ? latest.updated_at.split("T")[0] : null,
            appraisal_id: latest.appraisal_id,
            actual_status: actualStatus
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load appraisals");
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

  /* ================= FETCH DETAILS FOR REVIEW ================= */
  useEffect(() => {
    if (!selectedSubmission) return;

    const fetchDetails = async () => {
      try {
        const res = await API.get(`appraisal/${selectedSubmission.appraisal_id}/`);
        setSelectedSubmission((prev) => ({ ...prev, appraisal_data: res.data.appraisal_data }));
      } catch (err) {
        console.error("Failed to fetch details", err);
      }
    };

    fetchDetails();
  }, [selectedSubmission?.appraisal_id]);

  /* ================= ACTIONS ================= */
  const handleStartReview = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/hod/appraisal/${selectedSubmission.appraisal_id}/start-review/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      alert("Moved to HOD Review");

      setSelectedSubmission((prev) => ({
        ...prev,
        status: "REVIEWED_BY_HOD",
      }));
    } catch {
      alert("Failed to start review");
    }
  };

  const handleApprove = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/hod/appraisal/${selectedSubmission.appraisal_id}/approve/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error();

      alert("Approved by HOD");
      setSelectedSubmission(null);
    } catch {
      alert("Approval failed");
    }
  };

  const handleSendBack = async () => {
    if (!remarks.trim()) {
      alert("Remarks required");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/hod/appraisal/${selectedSubmission.appraisal_id}/return/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remarks }),
        }
      );

      if (!res.ok) throw new Error();

      alert("Returned to faculty");
      setSelectedSubmission(null);
      setRemarks("");
    } catch {
      alert("Failed to return appraisal");
    }
  };

  /* ================= AUTH ================= */
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  /* ================= HOD SELF APPRAISAL ================= */
  const handleFillOwnAppraisal = () => {
    const updated = { ...hodOwnAppraisal, status: "in_progress" };
    setHodOwnAppraisal(updated);
    localStorage.setItem("hodOwnAppraisal", JSON.stringify(updated));
    navigate("/hod/appraisal-form");
  };

  const handleSubmitOwnAppraisal = async () => {
    try {
      const token =
        localStorage.getItem("access") ||
        sessionStorage.getItem("access");

      if (!token) {
        alert("Not authenticated");
        return;
      }

      const payload = JSON.parse(
        localStorage.getItem("hodAppraisalPayload")
      );

      if (!payload) {
        alert("No appraisal data found");
        return;
      }

      const res = await fetch(
        "http://127.0.0.1:8000/api/hod/submit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      alert("HOD appraisal submitted successfully");

      const updated = {
        academicYear: payload.academic_year,
        status: "submitted",
        submissionDate: new Date().toISOString().split("T")[0],
      };

      setHodOwnAppraisal(updated);
      localStorage.setItem(
        "hodOwnAppraisal",
        JSON.stringify(updated)
      );
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit appraisal");
    }
  };



  /* ================= REVIEW SCREEN ================= */
  if (selectedSubmission) {
    return (
      <div className="hod-container">
        <button className="back-btn" onClick={() => setSelectedSubmission(null)}>
          ← Back to Dashboard
        </button>

        <div className="card">
          <h2>Faculty Submission Review</h2>

          <div className="info-grid">
            <div><b>Name:</b> {selectedSubmission.faculty_name}</div>
            <div><b>Department:</b> {selectedSubmission.department}</div>
            <div><b>Designation:</b> {selectedSubmission.designation}</div>
            <div><b>Academic Year:</b> {selectedSubmission.academic_year}</div>
          </div>

          <h3>HOD Remarks</h3>
          <textarea
            placeholder="Enter remarks here..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          {selectedSubmission.appraisal_data && (
            <div className="form-data-view" style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '400px', overflowY: 'auto' }}>
              <h3>Appraisal Form Details</h3>
              <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(selectedSubmission.appraisal_data, null, 2)}
              </pre>
            </div>
          )}


          <div className="action-btn-row">
            {selectedSubmission.status === "SUBMITTED" && (
              <button className="approve-btn" onClick={handleStartReview}>
                Start Review
              </button>
            )}

            {selectedSubmission.status === "REVIEWED_BY_HOD" && (
              <button className="approve-btn" onClick={handleApprove}>
                Approve
              </button>
            )}

            <button className="reject-btn" onClick={handleSendBack}>
              Request Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================= MAIN DASHBOARD ================= */
  return (
    <div className="hod-container">
      <div className="hod-header-card">
        <div>
          <h1>HOD Dashboard</h1>
          <p className="subtitle">Faculty Review & Self Appraisal</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

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
          className={`dashboard-card ${hodOwnAppraisal.status === "submitted" ? "disabled" : ""}`}
          onClick={() => {
            if (hodOwnAppraisal.status !== "submitted") handleFillOwnAppraisal();
          }}
        >
          <h3>My Appraisal Form</h3>
          <p>
            {hodOwnAppraisal.actual_status === "RETURNED_BY_PRINCIPAL"
              ? "Returned for Changes - Please edit and resubmit"
              : hodOwnAppraisal.status === "not_started"
                ? "Fill and submit your annual faculty appraisal"
                : hodOwnAppraisal.status === "in_progress"
                  ? "Continue filling your appraisal form"
                  : "Appraisal already submitted"}
          </p>

          {(hodOwnAppraisal.status === "in_progress" || hodOwnAppraisal.actual_status === "RETURNED_BY_PRINCIPAL") && (
            <button className="approve-btn" style={{ marginTop: '12px', height: '40px', padding: '0 16px', fontSize: '14px' }} onClick={(e) => { e.stopPropagation(); navigate("/hod/appraisal-form"); }}>
              {hodOwnAppraisal.actual_status === "RETURNED_BY_PRINCIPAL" ? "✍️ Edit & Resubmit" : "📤 Submit to Principal"}
            </button>
          )}
        </div>
      </div>

      <div className="tab-row" style={{ marginTop: '32px' }}>
        <button
          className={activeTab === "pending" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={activeTab === "processed" ? "tab active" : "tab"}
          onClick={() => setActiveTab("processed")}
        >
          Processed
        </button>
      </div>

      {/* SUBMISSION HISTORY (HOD OWN) moved down */}
      {hodOwnAppraisal.appraisal_id && (
        <div className="dashboard-history-section" style={{ marginBottom: '32px' }}>
          <h3>My Submission History</h3>
          <div className="history-list">
            <div className="history-item">
              <div className="history-info">
                <span className="history-year">AY {hodOwnAppraisal.academicYear}</span>
                <span className={`history-status ${hodOwnAppraisal.actual_status?.toLowerCase().replace(/_/g, "-")}`}>
                  {hodOwnAppraisal.actual_status?.replace(/_/g, " ")}
                </span>
              </div>
              <button
                className="view-btn"
                onClick={() => navigate("/faculty/appraisal/status")}
              >
                Track Status
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="list">
          {loading && <p>Loading appraisals...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && submissions.pending.length === 0 && (
            <p>No pending appraisals.</p>
          )}

          {submissions.pending.map((sub) => (
            <div className="list-card" key={sub.appraisal_id}>
              <div>
                <h3>{sub.faculty_name}</h3>
                <p>{sub.department} | {sub.academic_year}</p>
              </div>
              <button
                className="primary-btn"
                onClick={() => setSelectedSubmission(sub)}
              >
                👁 View
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "processed" && (
        <div className="list">
          {submissions.processed.length === 0 && (
            <p>No processed appraisals.</p>
          )}

          {submissions.processed.map((sub) => (
            <div className="list-card" key={sub.appraisal_id}>
              <div>
                <h3>{sub.faculty_name}</h3>
                <p>{sub.department} | {sub.academic_year}</p>
                <span className={`status ${sub.status?.toLowerCase().replace(/_/g, "-")}`}>
                  {sub.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
