// HODDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/HODDashboard.css";

export default function HODDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [remarks, setRemarks] = useState("");

  /* ================= HOD SELF APPRAISAL (UI STATE ONLY) ================= */
  const [hodOwnAppraisal, setHodOwnAppraisal] = useState({
    academicYear: "2024-25",
    status: "not_started", // not_started | in_progress | submitted
    submissionDate: null,
  });

  /* ================= FACULTY SUBMISSIONS (API) ================= */
  const [submissions, setSubmissions] = useState({
    pending: [],
    processed: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD HOD SELF APPRAISAL ================= */
  useEffect(() => {
    const stored = localStorage.getItem("hodOwnAppraisal");
    if (stored) setHodOwnAppraisal(JSON.parse(stored));
  }, []);

  /* ================= FETCH APPRAISALS FOR HOD ================= */
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("hod/appraisals/");
        const data = res.data || [];

        const pending = data.filter(
          (a) => a.status === "SUBMITTED"
        );

        const processed = data.filter(
          (a) =>
            a.status === "HOD_APPROVED" ||
            a.status === "CHANGES_REQUESTED"
        );

        setSubmissions({ pending, processed });
      } catch (err) {
        console.error(err);
        setError("Failed to load appraisals");
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

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

  const handleSubmitOwnAppraisal = () => {
    const updated = {
      ...hodOwnAppraisal,
      status: "submitted",
      submissionDate: new Date().toISOString().split("T")[0],
    };
    setHodOwnAppraisal(updated);
    localStorage.setItem("hodOwnAppraisal", JSON.stringify(updated));
  };

  /* ================= FACULTY REVIEW (LOCAL STATE ONLY) ================= */
  // TODO: Replace with API calls
  const handleApprove = () => {
    const updated = {
      ...selectedSubmission,
      status: "HOD_APPROVED",
      hodRemarks: remarks,
    };

    setSubmissions((prev) => ({
      pending: prev.pending.filter((s) => s.id !== selectedSubmission.id),
      processed: [...prev.processed, updated],
    }));

    setSelectedSubmission(null);
    setRemarks("");
  };

  const handleRequestChanges = () => {
    if (!remarks.trim()) return;

    const updated = {
      ...selectedSubmission,
      status: "CHANGES_REQUESTED",
      hodRemarks: remarks,
    };

    setSubmissions((prev) => ({
      pending: prev.pending.filter((s) => s.id !== selectedSubmission.id),
      processed: [...prev.processed, updated],
    }));

    setSelectedSubmission(null);
    setRemarks("");
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
            <div><b>Department:</b> {selectedSubmission.department || "—"}</div>
            <div><b>Designation:</b> {selectedSubmission.designation}</div>
            <div><b>Academic Year:</b> {selectedSubmission.academic_year}</div>
          </div>

          <h3>View Appraisal Forms</h3>
          <div className="view-forms-row">
            <button className="view-form-btn">View SPPU Form</button>
            <button className="view-form-btn">View PBAS Form</button>
          </div>

          <h3>HOD Remarks</h3>
          <textarea
            placeholder="Enter remarks here..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="action-btn-row">
            <button className="approve-btn" onClick={handleApprove}>
              ✔ Approve
            </button>
            <button className="reject-btn" onClick={handleRequestChanges}>
              ✎ Request Changes
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

      <div className="card">
        <h2>My Appraisal Form</h2>
        <p><b>Academic Year:</b> {hodOwnAppraisal.academicYear}</p>

        {hodOwnAppraisal.status === "not_started" && (
          <button className="primary-btn" onClick={handleFillOwnAppraisal}>
            📝 Fill My Appraisal Form
          </button>
        )}

        {hodOwnAppraisal.status === "in_progress" && (
          <div className="action-btn-row">
            <button className="secondary-btn" onClick={handleFillOwnAppraisal}>
              ✏ Continue
            </button>
            <button className="approve-btn" onClick={handleSubmitOwnAppraisal}>
              📤 Submit to Principal
            </button>
          </div>
        )}

        {hodOwnAppraisal.status === "submitted" && (
          <p>✅ Submitted on {hodOwnAppraisal.submissionDate}</p>
        )}
      </div>

      <div className="tab-row">
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

      {activeTab === "pending" && (
        <div className="list">
          {loading && <p>Loading appraisals...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && submissions.pending.length === 0 && (
            <p>No pending appraisals.</p>
          )}

          {submissions.pending.map((sub) => (
            <div className="list-card" key={sub.id}>
              <div>
                <h3>{sub.faculty_name}</h3>
                <p>{sub.department || "—"} | {sub.academic_year}</p>
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
            <div className="list-card" key={sub.id}>
              <div>
                <h3>{sub.faculty_name}</h3>
                <p>{sub.department || "—"} | {sub.academic_year}</p>
                <p><b>Status:</b> {sub.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
