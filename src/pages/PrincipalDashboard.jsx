import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HodDashboard.css"; // reuse same CSS

export default function PrincipalDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");

  const [submissions, setSubmissions] = useState({
    pending: [
      {
        id: 1,
        name: "Dr. Meera Kulkarni",
        designation: "HOD – Mechanical",
        department: "Mechanical Engineering",
        academicYear: "2024-25",
        submittedOn: "2025-01-22",
      },
    ],
    processed: [],
  });

  const handleFinalApprove = () => {
    if (!selected) return;

    setSubmissions((prev) => ({
      pending: prev.pending.filter((s) => s.id !== selected.id),
      processed: [
        ...prev.processed,
        {
          ...selected,
          status: "approved",
          remarks,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }));

    setSelected(null);
    setRemarks("");
    alert("Final approval completed.");
  };

  const handleSendBack = () => {
    if (!remarks.trim()) {
      alert("Remarks are required.");
      return;
    }

    setSubmissions((prev) => ({
      pending: prev.pending.filter((s) => s.id !== selected.id),
      processed: [
        ...prev.processed,
        {
          ...selected,
          status: "changes_requested",
          remarks,
          date: new Date().toISOString().split("T")[0],
        },
      ],
    }));

    setSelected(null);
    setRemarks("");
    alert("Sent back to HOD.");
  };

  if (selected) {
    return (
      <div className="hod-container">
        <button className="back-btn" onClick={() => setSelected(null)}>
          ← Back
        </button>

        <div className="card">
          <h2>Appraisal Review (Final)</h2>

          <div className="info-grid">
            <div><b>Name:</b> {selected.name}</div>
            <div><b>Department:</b> {selected.department}</div>
            <div><b>Designation:</b> {selected.designation}</div>
            <div><b>Academic Year:</b> {selected.academicYear}</div>
          </div>

          <h3>View Appraisal Forms</h3>
         <div className="view-forms-row">
            <button className="view-form-btn">View SPPU Form</button>
            <button className="view-form-btn">View PBAS Form</button>
          </div>

          <h3>Principal Remarks</h3>
          <textarea
            placeholder="Enter final remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          <div className="action-btn-row">
            <button className="approve-btn" onClick={handleFinalApprove}>
              Final Approve
            </button>
            <button className="reject-btn" onClick={handleSendBack}>
              Request Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hod-container">
      {/* Header Card */}
      <div className="hod-header-card">
        <div>
          <h1>Principal Dashboard</h1>
          <p className="subtitle">Final Approval of Appraisal Forms</p>
        </div>
        <button className="logout-btn" onClick={() => navigate("/login")}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-row">
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Approvals ({submissions.pending.length})
        </button>
        <button
          className={`tab ${activeTab === "processed" ? "active" : ""}`}
          onClick={() => setActiveTab("processed")}
        >
          Processed ({submissions.processed.length})
        </button>
      </div>

      <div className="list">
        {activeTab === "pending" &&
          (submissions.pending.length === 0 ? (
            <p className="empty">No pending approvals.</p>
          ) : (
            submissions.pending.map((s) => (
              <div className="list-card" key={s.id}>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.department}</p>
                  <p>Academic Year: {s.academicYear}</p>
                  <span className="status pending">Pending Final Approval</span>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => setSelected(s)}
                >
                  View
                </button>
              </div>
            ))
          ))}

        {activeTab === "processed" &&
          (submissions.processed.length === 0 ? (
            <p className="empty">No processed appraisals.</p>
          ) : (
            submissions.processed.map((s, i) => (
              <div className="list-card" key={i}>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.department}</p>
                  <p><b>Remarks:</b> {s.remarks}</p>
                  <span className={`status ${s.status}`}>
                    {s.status === "approved"
                      ? "Approved"
                      : "Changes Requested"}
                  </span>
                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
