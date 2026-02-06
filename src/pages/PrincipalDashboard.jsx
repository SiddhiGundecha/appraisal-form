import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HodDashboard.css";
import AppraisalSummary from "../components/AppraisalSummary";

export default function PrincipalDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");
  const token = localStorage.getItem("access");

  const handleStartReview = async () => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/start-review/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Start review failed");

      alert("Moved to Principal Review");

      setSelected((prev) => ({
        ...prev,
        status: "REVIEWED_BY_PRINCIPAL",
      }));
    } catch (err) {
      alert("Failed to start review");
      console.error(err);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/approve/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Approve failed");

      alert("Approved by Principal. Now finalize.");

      // Update UI state
      setSelected((prev) => ({
        ...prev,
        status: "PRINCIPAL_APPROVED",
      }));
    } catch (err) {
      alert("Approval failed");
      console.error(err);
    }
  };

  const handleFinalize = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/finalize/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Finalize failed");

      alert("Appraisal finalized & PDFs generated");

      setSelected(null); // go back to list
    } catch (err) {
      alert("Finalize failed");
      console.error(err);
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [submissions, setSubmissions] = useState({
    pending: [],
    processed: [],
  });

  /* ================= FETCH PRINCIPAL APPRAISALS ================= */
  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access");

        const res = await fetch(
          "http://127.0.0.1:8000/api/principal/appraisals/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        // Split pending vs processed
        const pending = [];
        const processed = [];

        data.forEach((a) => {
          if (
            a.status === "REVIEWED_BY_PRINCIPAL" ||
            a.status === "HOD_APPROVED" ||
            a.status === "SUBMITTED"
          ) {
            pending.push(a);
          } else {
            processed.push(a);
          }
        });

        setSubmissions({ pending, processed });
      } catch (err) {
        console.error(err);
        setError("Unable to load appraisals");
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

  /* ================= FETCH DETAILS WHEN SELECTED ================= */
  useEffect(() => {
    if (!selected) return;

    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`http://127.0.0.1:8000/api/appraisal/${selected.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSelected((prev) => ({ ...prev, appraisal_data: data.appraisal_data }));
      } catch (err) {
        console.error("Failed to fetch appraisal data", err);
      }
    };

    fetchDetails();
  }, [selected?.id]);


  /* ================= FINAL APPROVE ================= */
  const handleFinalApprove = async () => {
    if (!selected) return;

    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/finalize/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Approval failed");

      setSubmissions((prev) => ({
        pending: prev.pending.filter((a) => a.id !== selected.id),
        processed: [...prev.processed, { ...selected, status: "APPROVED" }],
      }));

      setSelected(null);
      setRemarks("");
      alert("Final approval completed");
    } catch (err) {
      console.error(err);
      alert("Failed to approve appraisal");
    }
  };

  /* ================= REQUEST CHANGES ================= */
  const handleSendBack = async () => {
    if (!remarks.trim()) {
      alert("Remarks are required");
      return;
    }

    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/return/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ remarks }),
        }
      );

      if (!res.ok) throw new Error("Return failed");

      setSubmissions((prev) => ({
        pending: prev.pending.filter((a) => a.id !== selected.id),
        processed: [
          ...prev.processed,
          { ...selected, status: "CHANGES_REQUESTED", remarks },
        ],
      }));

      setSelected(null);
      setRemarks("");
      alert("Sent back to faculty");
    } catch (err) {
      console.error(err);
      alert("Failed to send back");
    }
  };

  /* ================= REVIEW SCREEN ================= */
  if (selected) {
    return (
      <div className="hod-container">
        <button className="back-btn" onClick={() => setSelected(null)}>
          ← Back
        </button>

        <div className="card">
          <h2>Appraisal Review (Final)</h2>

          <div className="info-grid">
            <div><b>Name:</b> {selected.faculty_name}</div>
            <div><b>Department:</b> {selected.department}</div>
            <div><b>Designation:</b> {selected.designation}</div>
            <div><b>Academic Year:</b> {selected.academic_year}</div>
          </div>

          <h3>Principal Remarks</h3>
          <textarea
            placeholder="Enter final remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />

          {selected.appraisal_data && (
            <div className="form-data-view" style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', maxHeight: '400px', overflowY: 'auto' }}>
              <AppraisalSummary data={selected.appraisal_data} />
            </div>
          )}


          <div className="action-btn-row">

            {(selected.status === "HOD_APPROVED" || (selected.status === "SUBMITTED" && selected.is_hod_appraisal)) && (
              <button className="approve-btn" onClick={handleStartReview}>
                Start Review
              </button>
            )}


            {selected.status === "REVIEWED_BY_PRINCIPAL" && (
              <button className="approve-btn" onClick={handleApprove}>
                Approve
              </button>
            )}

            {selected.status === "PRINCIPAL_APPROVED" && (
              <button className="approve-btn" onClick={handleFinalize}>
                Finalize & Generate PDF
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

  /* ================= LIST VIEW ================= */
  return (
    <div className="hod-container">
      <div className="hod-header-card">
        <div>
          <h1>Principal Dashboard</h1>
          <p className="subtitle">Final Approval of Appraisal Forms</p>
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

      {loading && <p className="empty">Loading…</p>}
      {error && <p className="empty">{error}</p>}

      <div className="list">
        {activeTab === "pending" &&
          (submissions.pending.length === 0 ? (
            <p className="empty">No pending approvals</p>
          ) : (
            submissions.pending.map((s) => (
              <div className="list-card" key={s.id}>
                <div>
                  <h3>{s.faculty_name}</h3>
                  <p>{s.department}</p>
                  <p>Academic Year: {s.academic_year}</p>
                  {s.is_hod_appraisal && (
                    <span className="badge-hod" style={{ background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px' }}>
                      HOD SUBMISSION
                    </span>
                  )}
                  <span className="status pending">
                    Pending Final Approval
                  </span>
                </div>
                <button className="primary-btn" onClick={() => setSelected(s)}>
                  View
                </button>
              </div>
            ))
          ))}

        {activeTab === "processed" &&
          (submissions.processed.length === 0 ? (
            <p className="empty">No processed appraisals</p>
          ) : (
            submissions.processed.map((s, i) => (
              <div className="list-card" key={i}>
                <div>
                  <h3>{s.faculty_name}</h3>
                  <p>{s.department}</p>
                  {s.is_hod_appraisal && (
                    <span className="badge-hod" style={{ background: '#6366f1', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px' }}>
                      HOD SUBMISSION
                    </span>
                  )}
                  {s.remarks && <p><b>Remarks:</b> {s.remarks}</p>}
                  <span className={`status ${s.status?.toLowerCase()}`}>
                    {s.status === "FINALIZED"
                      ? "Finalized"
                      : s.status === "PRINCIPAL_APPROVED"
                        ? "Principal Approved"
                        : s.status === "RETURNED_BY_PRINCIPAL" || s.status === "RETURNED_BY_HOD"
                          ? "Changes Requested"
                          : s.status}
                  </span>

                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
