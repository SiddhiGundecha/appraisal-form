import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HodDashboard.css";
import AppraisalSummary from "../components/AppraisalSummary";

const TABLE2_VERIFIED_FIELDS = [
  { key: "peer_reviewed_journals", label: "1. Research papers (Peer-reviewed/UGC)" },
  { key: "books_international", label: "2(a) Books - International publishers" },
  { key: "books_national", label: "2(a) Books - National publishers" },
  { key: "chapter_edited_book", label: "2(a) Chapter in edited book" },
  { key: "editor_book_international", label: "2(a) Editor - International publisher" },
  { key: "editor_book_national", label: "2(a) Editor - National publisher" },
  { key: "translation_chapter_or_paper", label: "2(b) Translation - Chapter/Paper" },
  { key: "translation_book", label: "2(b) Translation - Book" },
  { key: "pedagogy_development", label: "3(a) Innovative pedagogy" },
  { key: "curriculum_design", label: "3(b) Curriculum/course design" },
  { key: "moocs_4quadrant", label: "3(c) MOOCs 4 quadrant" },
  { key: "moocs_single_lecture", label: "3(c) MOOCs per module/lecture" },
  { key: "moocs_content_writer", label: "3(c) MOOCs content writer/SME" },
  { key: "moocs_coordinator", label: "3(c) MOOCs course coordinator" },
  { key: "econtent_4quadrant_complete", label: "3(d) e-Content complete course/e-book" },
  { key: "econtent_4quadrant_per_module", label: "3(d) e-Content per module" },
  { key: "econtent_module_contribution", label: "3(d) e-Content module contribution" },
  { key: "econtent_editor", label: "3(d) e-Content editor" },
  { key: "phd_awarded", label: "4(a) Ph.D. awarded" },
  { key: "phd_submitted", label: "4(a) Ph.D. submitted" },
  { key: "mphil_pg_dissertation", label: "4(a) M.Phil./P.G. dissertation" },
  { key: "research_project_above_10l", label: "4(b) Completed project >10 lakhs" },
  { key: "research_project_below_10l", label: "4(b) Completed project <10 lakhs" },
  { key: "research_project_ongoing_above_10l", label: "4(c) Ongoing project >10 lakhs" },
  { key: "research_project_ongoing_below_10l", label: "4(c) Ongoing project <10 lakhs" },
  { key: "consultancy", label: "4(d) Consultancy" },
  { key: "patent_international", label: "5(a) Patent - International" },
  { key: "patent_national", label: "5(a) Patent - National" },
  { key: "policy_international", label: "6(b) Policy document - International" },
  { key: "policy_national", label: "6(b) Policy document - National" },
  { key: "policy_state", label: "6(b) Policy document - State" },
  { key: "award_international", label: "7(c) Award/Fellowship - International" },
  { key: "award_national", label: "7(c) Award/Fellowship - National" },
  { key: "conference_international_abroad", label: "8. Conference/Invited - International (Abroad)" },
  { key: "conference_international_country", label: "8. Conference/Invited - International (Within Country)" },
  { key: "conference_national", label: "8. Conference/Invited - National" },
  { key: "conference_state_university", label: "8. Conference/Invited - State/University" },
  { key: "total", label: "Total (Table 2)" },
];

const TABLE2_TOTAL_KEY = "total";
const TABLE2_ITEM_KEYS = TABLE2_VERIFIED_FIELDS
  .map((item) => item.key)
  .filter((key) => key !== TABLE2_TOTAL_KEY);

const buildEmptyTable2Verified = () =>
  TABLE2_VERIFIED_FIELDS.reduce((acc, item) => {
    acc[item.key] = "";
    return acc;
  }, {});

const parseScoreValue = (value) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatScoreValue = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
};

const computeTable2VerifiedTotal = (scores = {}) => {
  const total = TABLE2_ITEM_KEYS.reduce((sum, key) => sum + parseScoreValue(scores[key]), 0);
  return formatScoreValue(total);
};

const withAutoTable2Total = (scores = {}) => ({
  ...scores,
  [TABLE2_TOTAL_KEY]: computeTable2VerifiedTotal(scores),
});

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const deriveSelfTeaching = (reviewData, appraisalData) => {
  if (reviewData?.table1_teaching) return reviewData.table1_teaching;
  const courses = appraisalData?.teaching?.courses || [];
  const totalAssigned = courses.reduce(
    (sum, c) => sum + toNumber(c.total_classes_assigned ?? c.scheduled_classes),
    0
  );
  const totalTaught = courses.reduce(
    (sum, c) => sum + toNumber(c.classes_taught ?? c.held_classes),
    0
  );
  const percentage = totalAssigned > 0 ? (totalTaught / totalAssigned) * 100 : 0;
  const selfGrade =
    percentage >= 80 ? "Good" : percentage >= 70 ? "Satisfactory" : "Not Satisfactory";
  return {
    total_assigned: totalAssigned,
    total_taught: totalTaught,
    percentage: percentage.toFixed(2),
    self_grade: selfGrade,
  };
};

const getTable2SelfValue = (reviewData, key) => {
  if (!reviewData) return "";
  if (key === "total") return reviewData.table2_total_score ?? "";
  const row = reviewData.table2_research?.[key];
  return row?.total_score ?? "";
};

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
    if (selected.is_hod_appraisal && (!table1VerifiedTeaching || !table1VerifiedActivities)) {
      alert("Please set both Table 1 verified gradings for HOD submission.");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/principal/appraisal/${selected.id}/approve/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            table1_verified_teaching: table1VerifiedTeaching,
            table1_verified_activities: table1VerifiedActivities,
            table2_verified_scores: withAutoTable2Total(table2VerifiedScores),
            principal_remarks: remarks
          })
        }
      );

      if (!res.ok) throw new Error("Approve failed");

      alert("Approved by Principal. Now finalize.");

      // Update UI state
      setSelected((prev) => ({
        ...prev,
        status: "PRINCIPAL_APPROVED",
        remarks: remarks,
      }));
      setTable1VerifiedTeaching("");
      setTable1VerifiedActivities("");
      setTable2VerifiedScores(withAutoTable2Total(buildEmptyTable2Verified()));
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

  const downloadPdf = async (url, filename) => {
    try {
      const authToken =
        localStorage.getItem("access") || sessionStorage.getItem("access");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF.");
    }
  };

  const previewPdf = async (url) => {
    try {
      const authToken =
        localStorage.getItem("access") || sessionStorage.getItem("access");
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Preview failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error(err);
      alert("Failed to preview PDF.");
    }
  };

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
        setSelected((prev) => ({
          ...prev,
          appraisal_data: data.appraisal_data,
          verified_grade: data.verified_grade,
          sppu_review_data: data.sppu_review_data || null,
          calculated_total_score: data.calculated_total_score,
        }));
        const grading = data?.verified_grading || {};
        setTable1VerifiedTeaching(grading.table1_verified_teaching || "");
        setTable1VerifiedActivities(grading.table1_verified_activities || "");
        setTable2VerifiedScores(
          withAutoTable2Total({
            ...buildEmptyTable2Verified(),
            ...(grading.table2_verified_scores || {}),
          })
        );
        const principalReviewRemarks = data?.appraisal_data?.principal_review?.remarks || data?.remarks || "";
        setRemarks(principalReviewRemarks);
      } catch (err) {
        console.error("Failed to fetch appraisal data", err);
      }
    };

    fetchDetails();
  }, [selected?.id]);

  const [table1VerifiedTeaching, setTable1VerifiedTeaching] = useState("");
  const [table1VerifiedActivities, setTable1VerifiedActivities] = useState("");
  const [table2VerifiedScores, setTable2VerifiedScores] = useState(
    withAutoTable2Total(buildEmptyTable2Verified())
  );

  const updateTable2Verified = (key, value) => {
    if (key === TABLE2_TOTAL_KEY) return;
    setTable2VerifiedScores((prev) =>
      withAutoTable2Total({
        ...prev,
        [key]: value,
      })
    );
  };

  const selfTeaching = deriveSelfTeaching(
    selected?.sppu_review_data,
    selected?.appraisal_data
  );
  const selfActivities = selected?.sppu_review_data?.table1_activities || {};
  const formattedTotalScore =
    selected?.calculated_total_score === null ||
    selected?.calculated_total_score === undefined
      ? "-"
      : Number(selected.calculated_total_score).toFixed(2);


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

          {/* VERIFIED GRADE INPUT (Only for HOD Appraisals) */}
          {selected.status === "REVIEWED_BY_PRINCIPAL" && selected.is_hod_appraisal && (
            <div style={{ marginTop: '16px' }}>
              <h3>Verified Grading (HOD Appraisal)</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Enter verified grading for Table 1 and the verified column values for Table 2.
              </p>
              <div style={{ margin: '12px 0', padding: '12px', border: '1px dashed #d1d5db', borderRadius: '6px', background: '#f8fafc' }}>
                <div style={{ fontSize: '0.9rem', color: '#4b5563' }}>Auto-calculated Total Score</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>{formattedTotalScore}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Computed from submitted data; updates after reload/approval.</div>
              </div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Table 1 - Teaching (Verified Grade)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px', alignItems: 'start' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '4px' }}><b>Self Appraisal</b></div>
                  <div style={{ fontSize: '0.9rem' }}>Assigned: {selfTeaching.total_assigned ?? 0}</div>
                  <div style={{ fontSize: '0.9rem' }}>Taught: {selfTeaching.total_taught ?? 0}</div>
                  <div style={{ fontSize: '0.9rem' }}>% Classes: {selfTeaching.percentage ?? "0.00"}%</div>
                  <div style={{ fontSize: '0.9rem' }}><b>Grade: {selfTeaching.self_grade || "-"}</b></div>
                </div>
                <select
                  value={table1VerifiedTeaching}
                  onChange={(e) => setTable1VerifiedTeaching(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Select Grade...</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Not Satisfactory">Not Satisfactory</option>
                </select>
              </div>
              <label style={{ fontWeight: 600, display: 'block', marginTop: '10px', marginBottom: '6px' }}>
                Table 1 - Activity (Verified Grade)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '12px', alignItems: 'start' }}>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '4px' }}><b>Self Appraisal</b></div>
                  <div style={{ fontSize: '0.9rem' }}>Selected Activities: {selfActivities.count ?? 0}</div>
                  <div style={{ fontSize: '0.9rem' }}><b>Grade: {selfActivities.self_grade || "-"}</b></div>
                </div>
                <select
                  value={table1VerifiedActivities}
                  onChange={(e) => setTable1VerifiedActivities(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Select Grade...</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Not Satisfactory">Not Satisfactory</option>
                </select>
              </div>
              <div style={{ marginTop: '14px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Table 2 - Verified Column
                </label>
                <div style={{ display: 'grid', gap: '8px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px', padding: '10px' }}>
                  {TABLE2_VERIFIED_FIELDS.map((field) => (
                    <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 130px', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem' }}>{field.label}</span>
                      <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                        Self: {getTable2SelfValue(selected?.sppu_review_data, field.key)}
                      </span>
                      <input
                        type="text"
                        value={table2VerifiedScores[field.key] || ""}
                        onChange={(e) => updateTable2Verified(field.key, e.target.value)}
                        placeholder={field.key === TABLE2_TOTAL_KEY ? "Auto" : "Verified"}
                        readOnly={field.key === TABLE2_TOTAL_KEY}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          background: field.key === TABLE2_TOTAL_KEY ? '#f3f4f6' : '#fff',
                          color: field.key === TABLE2_TOTAL_KEY ? '#111827' : 'inherit',
                          fontWeight: field.key === TABLE2_TOTAL_KEY ? 600 : 400,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selected.id && (
            <div style={{ marginTop: '18px', marginBottom: '4px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="approve-btn"
                style={{ height: '36px', padding: '0 14px' }}
                onClick={() => previewPdf(`http://127.0.0.1:8000/api/appraisal/${selected.id}/pdf/sppu-enhanced/`)}
              >
                Preview SPPU Form
              </button>
              <button
                type="button"
                className="approve-btn"
                style={{ height: '36px', padding: '0 14px' }}
                onClick={() => previewPdf(`http://127.0.0.1:8000/api/appraisal/${selected.id}/pdf/pbas-enhanced/`)}
              >
                Preview PBAS Form
              </button>
            </div>
          )}

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

                  {/* PDF Download Buttons for Finalized Appraisals */}
                  {s.status === "FINALIZED" && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Download PDFs:</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => downloadPdf(`http://127.0.0.1:8000/api/appraisal/${s.id}/pdf/sppu-enhanced/`, `SPPU_${s.academic_year}.pdf`)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>SPPU PDF</button>
                        <button type="button" onClick={() => downloadPdf(`http://127.0.0.1:8000/api/appraisal/${s.id}/pdf/pbas-enhanced/`, `PBAS_${s.academic_year}.pdf`)} style={{ padding: '6px 12px', background: '#8b5cf6', color: 'white', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>PBAS PDF</button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}


