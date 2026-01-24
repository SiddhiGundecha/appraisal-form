// HODDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  /* ================= FACULTY SUBMISSIONS ================= */
  const [submissions, setSubmissions] = useState({
    pending: [
      {
        id: 1,
        facultyName: "Dr. Rajesh Kumar",
        department: "Computer Science",
        designation: "Associate Professor",
        academicYear: "2024-25",
      },
    ],
    processed: [],
  });

  useEffect(() => {
    const stored = localStorage.getItem("hodOwnAppraisal");
    if (stored) setHodOwnAppraisal(JSON.parse(stored));
  }, []);

  /* ================= NAVIGATION ================= */
  const handleFillOwnAppraisal = () => {
    const updated = { ...hodOwnAppraisal, status: "in_progress" };
    setHodOwnAppraisal(updated);
    localStorage.setItem("hodOwnAppraisal", JSON.stringify(updated));
    navigate("/hod/appraisal-form"); // SAME FORM AS FACULTY
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

  /* ================= FACULTY REVIEW ================= */
  const handleApprove = () => {
    const updated = {
      ...selectedSubmission,
      status: "approved",
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
      status: "changes_requested",
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
            <div><b>Name:</b> {selectedSubmission.facultyName}</div>
            <div><b>Department:</b> {selectedSubmission.department}</div>
            <div><b>Designation:</b> {selectedSubmission.designation}</div>
            <div><b>Academic Year:</b> {selectedSubmission.academicYear}</div>
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
        <button className="logout-btn" onClick={() => navigate("/login")}>
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
        <button className={activeTab === "pending" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pending")}>
          Pending
        </button>
        <button className={activeTab === "processed" ? "tab active" : "tab"}
          onClick={() => setActiveTab("processed")}>
          Processed
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="list">
          {submissions.pending.map((sub) => (
            <div className="list-card" key={sub.id}>
              <div>
                <h3>{sub.facultyName}</h3>
                <p>{sub.department} | {sub.academicYear}</p>
              </div>
              <button className="primary-btn"
                onClick={() => setSelectedSubmission(sub)}>
                👁 View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
