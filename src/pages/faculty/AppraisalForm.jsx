import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api";
import AppraisalSummary from "../../components/AppraisalSummary";
import "../../styles/AppraisalForm.css";


export default function FacultyAppraisalForm() {

  const location = useLocation();   // new added

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isHOD = location.pathname.startsWith("/hod") || user.role === "HOD";

  const submitEndpoint = isHOD
    ? "/hod/submit/"
    : "/faculty/submit/";

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const from = location.pathname.startsWith("/hod")
    ? "/hod/dashboard"
    : "/faculty/dashboard";

  const [showSPPUPreview, setShowSPPUPreview] = useState(false);
  const [showPBASPreview, setShowPBASPreview] = useState(false);
  const [studentFeedback, setStudentFeedback] = useState([
    {
      semester: "",
      courseCode: "",
      courseName: "",
      averageScore: "",
      enclosureNo: ""
    }
  ]);



  const [sppuInvolvement, setSppuInvolvement] = useState({
    administrative: "",
    examDuty: "",
    studentActivity: "",
    seminarOrg: "",
    phdGuidance: "",
    researchProject: "",
    publication: ""
  });
  //new added
  const [departmentalActivities, setDepartmentalActivities] = useState([
    {
      semester: "",
      activity: "",
      credit: "",
      criteria: "",
      enclosureNo: "",
      otherActivity: ""
    }
  ]);

  //new added



  const [instituteActivities, setInstituteActivities] = useState([
    {
      semester: "",
      activity: "",
      credit: "",
      criteria: "",
      enclosureNo: "",
      otherActivity: ""
    }
  ]);





  const [acrDetails, setAcrDetails] = useState({
    year: "",
    acrAvailable: "",
    enclosureNo: "",
    creditPoints: ""   // new added
  });


  const [societyActivities, setSocietyActivities] = useState([
    {
      activity: "",
      semester: "",
      credit: "",
      criteria: "",
      enclosureNo: "",
      otherActivity: ""
    }
  ]);



  const handleArrayChange = (setter, index, e) => {
    setter(prev => {
      const copy = [...prev];
      copy[index][e.target.name] = e.target.value;
      return copy;
    });
  };

  /*LAST BLOCK OF <PAYLOAD></PAYLOAD>*/
  const [pbasScores, setPbasScores] = useState({
    teaching_process: 0,
    feedback: 0,
    department: 0,
    institute: 0,
    acr: 0,
    society: 0,
  });


  const addRow = (setter, row) => setter(prev => [...prev, row]);

  const removeRow = (setter, index) =>
    setter(prev => prev.filter((_, i) => i !== index));
  //new added all three 
  const DEPARTMENTAL_ACTIVITIES = [
    "Lab In charge",
    "Consultancy",
    "Time table In charge",
    "NBA coordinator",
    "Class Teacher",
    "Student registration",
    "Student detention In charge",
    "Final Year Student Project Guide",
    "Guest Lecture Organization",
    "Industrial visit in charge",
    "Project / Seminar Coordinator",
    "Departmental Library In charge",
    "Student Association / Chapter Co-coordinator",
    "Cleanliness in charge",
    "Practical / Exam Time table in charge",
    "Departmental store / Purchase in charge",
    "Internal / External Academic Monitoring Co-coordinator",
    "Department Level CSR Activities Co-coordinator",
    "Project Mentoring for project Competition",
    "Student Feedback In charge",
    "Student Counseling",
    "Initiative for CEP / STTP / Testing Consultancy",
    "Organization of MOOCS / NPTEL / Spoken Tutorials / IUCEE",
    "Any other Activity"
  ];

  const INSTITUTE_ACTIVITIES = [
    "In charge Internship",
    "Institute Web site Management",
    "Institute level networking and maintenance",
    "Building / Electrical Maintenance",
    "EPBX Activity",
    "Hardware and Software installation and maintenance",
    "Institute MIS In charge",
    "DTE MIS In charge",
    "Organization of FDP / Conference / Training / Workshop",
    "Exam Activities / Duties",
    "RO / RBTE / Administrative Activity / Duties",
    "Sports in charge and coordinator",
    "AICTE / University / Statutory committee member",
    "NBA / NAAC coordinator",
    "Garden Maintenance / Tree Plantation",
    "AICTE / NIRF / ARIIA / AISHE / TEQIP Activity in-charge",
    "PRO / Gymkhana / Student club activity",
    "HoD / Dean / Associate Dean / Library In-charge",
    "Rector / Warden / Canteen",
    "Earn and Learn Scheme / Scholarship In-charge",
    "Any other Activity"
  ];

  const SOCIETY_ACTIVITIES = [
    "Blood Donation Activity organization",
    "Yoga Classes",
    "Induction Program In charge",
    "Medical / Health Camp Organization",
    "Literacy Camp Organization",
    "Tree Plantation and garden maintenance",
    "Environmental awareness camp",
    "Swachh Bharat / Unnat Bharat / NSS / NCC Activity",
    "Any other Activity"
  ];



  const [research, setResearch] = useState({
    papers: [
      {
        title: "",
        journal: "",
        ugcCare: "",
        impactFactor: "",
        authorship: "",
        year: "",
        enclosureNo: ""
      }
    ],

    publications: [
      {
        type: "",
        title: "",
        publisherType: "",
        year: "",
        enclosureNo: ""
      }
    ],

    projects: [
      {
        status: "",
        amountSlab: "",
        role: "",
        enclosureNo: ""
      }
    ],

    patents: [
      {
        type: "",
        status: "",
        enclosureNo: ""
      }
    ],

    // THIS WAS MISSING
    guidance: [
      {
        degree: "",
        status: "",
        count: "",
        year: "",
        enclosureNo: ""
      }
    ],

    moocsIct: [
      {
        category: "",
        role: "",
        creditClaimed: "",
        year: "",
        enclosureNo: ""
      }
    ],

    consultancyPolicy: [
      {
        category: "",
        level: "",
        enclosureNo: ""
      }
    ],

    awards: [
      {
        level: "",
        title: "",
        year: "",
        enclosureNo: ""
      }
    ],

    invitedTalks: [
      {
        level: "",
        role: "",
        year: "",
        enclosureNo: ""
      }
    ]
  });



  /* ================= FORM STATE ================= */
  const [appraisalId, setAppraisalId] = useState(null);
  const [appraisalStatus, setAppraisalStatus] = useState("DRAFT");
  const [remarks, setRemarks] = useState("");
  /* ================= SECTION 1 ================= */
  const [generalInfo, setGeneralInfo] = useState({
    facultyName: "",
    designation: "",
    department: "",
    dateOfJoining: "",
    email: "",
    mobile: "",
    communicationAddress: "",
    currentDesignation: "",
    payLevel: "",
    promotionDesignation: "",
    promotionDate: "",
    eligibilityDate: "",
    academicYear: ""
  });


  useEffect(() => {
    // 1️⃣ Fetch Profile Data
    API.get("me/")
      .then(res => {
        const data = res.data;
        setGeneralInfo(prev => ({
          ...prev,
          facultyName: data.full_name || "",
          designation: data.designation || "",
          department: data.department || "",
          email: data.email || "",
          mobile: data.mobile_number || "",
        }));
      })
      .catch(err => console.error("Failed to fetch profile", err));

    // 2️⃣ Fetch Existing Draft
    API.get(`appraisal/current/?is_hod=${isHOD}`)
      .then(res => {
        if (res.data && res.data.appraisal_data) {
          const aid = res.data.id || res.data.appraisal_id;
          setAppraisalId(aid);
          setAppraisalStatus(res.data.status);
          setRemarks(res.data.remarks || "");
          console.log("DEBUG: Loaded appraisal", { id: aid, status: res.data.status });
          const draft = res.data.appraisal_data;
          const ui = draft._ui_state;

          if (ui) {
            // BEST: Restore from full state
            if (ui.generalInfo) setGeneralInfo(ui.generalInfo);
            if (ui.teachingActivities) setTeachingActivities(ui.teachingActivities);
            if (ui.studentFeedback) setStudentFeedback(ui.studentFeedback);
            if (ui.sppuInvolvement) setSppuInvolvement(ui.sppuInvolvement);
            if (ui.departmentalActivities) setDepartmentalActivities(ui.departmentalActivities);
            if (ui.instituteActivities) setInstituteActivities(ui.instituteActivities);
            if (ui.societyActivities) setSocietyActivities(ui.societyActivities);
            if (ui.acrDetails) setAcrDetails(ui.acrDetails);
            if (ui.research) setResearch(ui.research);
            if (ui.pbasScores) setPbasScores(ui.pbasScores);
            return;
          }

          // FALLBACK: Restore from structured data (lossy)
          if (draft.general) {
            setGeneralInfo(prev => ({
              ...prev,
              academicYear: res.data.academic_year || prev.academic_year,
              facultyName: draft.general.faculty_name || prev.facultyName,
              department: draft.general.department || prev.department,
              designation: draft.general.designation || prev.designation,
            }));
          }

          if (draft.teaching && draft.teaching.courses) {
            setTeachingActivities(draft.teaching.courses.map(c => ({
              academicYear: res.data.academic_year || "",
              semester: c.semester || "",
              courseCode: c.course_code || "",
              courseName: c.course_name || "",
              totalClassesAssigned: c.scheduled_classes || "",
              classesConducted: c.held_classes || "",
              teachingType: "Lecture",
              academicLevel: "UG",
              classDivision: "",
              enclosureNo: ""
            })));
          }

          if (draft.pbas) {
            if (draft.pbas.student_feedback) {
              setStudentFeedback(draft.pbas.student_feedback.map(f => ({
                semester: f.semester || "",
                courseCode: f.course_code || "",
                courseName: f.course_name || "",
                averageScore: f.feedback_score || "",
                enclosureNo: f.enclosure_no || ""
              })));
            }
            if (draft.pbas.departmental_activities) {
              setDepartmentalActivities(draft.pbas.departmental_activities.map(d => ({
                activity: d.activity || "",
                semester: d.semester || "",
                credit: d.credits_claimed || "",
                enclosureNo: d.enclosure_no || ""
              })));
            }
            if (draft.pbas.institute_activities) {
              setInstituteActivities(draft.pbas.institute_activities.map(i => ({
                activity: i.activity || "",
                semester: i.semester || "",
                credit: i.credits_claimed || "",
                enclosureNo: i.enclosure_no || ""
              })));
            }
            if (draft.pbas.society_activities) {
              setSocietyActivities(draft.pbas.society_activities.map(s => ({
                activity: s.activity || "",
                semester: s.semester || "",
                credit: s.credits_claimed || "",
                enclosureNo: s.enclosure_no || ""
              })));
            }

            setPbasScores({
              teaching_process: draft.pbas.teaching_process || 0,
              feedback: draft.pbas.feedback || 0,
              department: draft.pbas.department || 0,
              institute: draft.pbas.institute || 0,
              acr: draft.pbas.acr || 0,
              society: draft.pbas.society || 0,
            });
          }

          if (draft.acr) {
            setAcrDetails(prev => ({
              ...prev,
              year: draft.acr.year || "",
              acrAvailable: draft.acr.grade || "",
            }));
          }
        }
      })
      .catch(err => console.error("Failed to load draft", err));
  }, []);

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;

    setGeneralInfo({ ...generalInfo, [name]: value });

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };


  /* ================= SECTION 2 ================= */
  /* ================= SECTION 2 : TEACHING ================= */

  /* ================= SECTION 2 : TEACHING ================= */

  const SEMESTERS = ["Sem 1", "Sem 2"];
  const TEACHING_TYPES = ["Lecture", "Tutorial", "Practical", "Lab"];
  const ACADEMIC_LEVELS = ["UG", "PG"];
  const ACADEMIC_YEARS = ["2023-24", "2024-25", "2025-26"];

  const [teachingActivities, setTeachingActivities] = useState([
    {
      academicYear: "",
      semester: "",
      courseCode: "",
      courseName: "",
      classDivision: "",
      teachingType: "",
      academicLevel: "",
      totalClassesAssigned: "",
      classesConducted: "",
      enclosureNo: ""
    }
  ]);
  const handleTeachingChange = (index, e) => {
    const updated = [...teachingActivities];
    updated[index][e.target.name] = e.target.value;
    setTeachingActivities(updated);
  };

  const addTeachingRow = () => {
    setTeachingActivities([
      ...teachingActivities,
      {
        academicYear: "",
        semester: "",
        courseCode: "",
        courseName: "",
        classDivision: "",
        teachingType: "",
        academicLevel: "",
        totalClassesAssigned: "",
        classesConducted: "",
        enclosureNo: ""
      }
    ]);
  };

  const removeTeachingRow = (index) => {
    if (teachingActivities.length > 1) {
      setTeachingActivities(teachingActivities.filter((_, i) => i !== index));
    }
  };



  /* ================= SECTION 3 ================= */
  const [categoryTwo, setCategoryTwo] = useState([
    { activityType: "", description: "", role: "", duration: "", year: " " }
  ]);




  /* ================= SECTION 4 ================= */


  /* ================= SUBMISSION ================= */
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [formStatus, setFormStatus] = useState("draft");

  const buildBackendPayload = (submitAction = "draft") => {
    const researchEntries = [];

    /* ================= RESEARCH ENTRIES ================= */

    research.papers.forEach(p => {
      if (!p.title) return;
      researchEntries.push({
        type: "journal_papers",
        count: 1,
        title: p.title,
        year: Number(p.year),
        enclosure_no: p.enclosureNo
      });
    });

    research.publications.forEach(p => {
      if (!p.title) return;
      researchEntries.push({
        type: "book_national",
        count: 1,
        title: p.title,
        year: Number(p.year),
        enclosure_no: p.enclosureNo
      });
    });

    research.invitedTalks.forEach(t => {
      if (!t.year) return;
      researchEntries.push({
        type: "invited_lecture_national",
        count: 1,
        year: Number(t.year),
        enclosure_no: t.enclosureNo
      });
    });

    /* ================= PBAS RAW COUNTS (FOR BACKEND SCORING) ================= */

    const pbasCounts = {
      research: {
        journal_papers: research.papers.filter(
          p => p.ugcCare === "Yes"
        ).length,

        conference_papers: 0
      },

      publications: {
        book_national: research.publications.filter(
          p => p.type === "Book" && p.publisherType === "National"
        ).length,

        book_international: research.publications.filter(
          p => p.type === "Book" && p.publisherType === "International"
        ).length
      },

      ict: {
        innovative_pedagogy: research.moocsIct.filter(
          m => m.category === "Curriculum Design"
        ).length,

        mooc: {
          module: research.moocsIct.reduce(
            (sum, m) => sum + Number(m.creditClaimed || 0),
            0
          )
        }
      },

      research_guidance: {
        phd_awarded: research.guidance.reduce(
          (sum, g) =>
            g.degree === "PhD" && g.status === "Awarded"
              ? sum + Number(g.count || 0)
              : sum,
          0
        )
      },

      patents: {
        international: research.patents.filter(
          p => p.type === "International" && p.status === "Granted"
        ).length
      },

      invited_lectures: {
        national: research.invitedTalks.filter(
          t => t.level === "National"
        ).length
      }
    };

    /* ================= FINAL PAYLOAD ================= */

    return {
      academic_year: generalInfo.academicYear,     // e.g. "2024-25"
      semester: "Odd",
      form_type: "PBAS",

      appraisal_data: {
        submit_action: submitAction,               // "draft" | "submit"

        // ✅ Save full state for perfect draft restoration
        _ui_state: {
          generalInfo,
          teachingActivities,
          studentFeedback,
          sppuInvolvement,
          departmentalActivities,
          instituteActivities,
          societyActivities,
          acrDetails,
          research,
          pbasScores
        },

        /* ================= GENERAL ================= */
        general: {
          faculty_name: generalInfo.facultyName,
          department: generalInfo.department,
          designation: generalInfo.designation
        },

        /* ================= TEACHING ================= */
        teaching: {
          courses: teachingActivities.map(t => ({
            semester: t.semester,
            course_code: t.courseCode,
            course_name: t.courseName,
            scheduled_classes: Number(t.totalClassesAssigned),
            held_classes: Number(t.classesConducted)
          }))
        },

        /* ================= ACTIVITIES ================= */
        activities: {
          administrative_responsibility: sppuInvolvement.administrative === "Yes",
          exam_duties: sppuInvolvement.examDuty === "Yes",
          student_related: sppuInvolvement.studentActivity === "Yes",
          organizing_events: sppuInvolvement.seminarOrg === "Yes",
          phd_guidance: sppuInvolvement.phdGuidance === "Yes",
          research_project: sppuInvolvement.researchProject === "Yes",
          sponsored_project: false
        },

        /* ================= RESEARCH (LIST – REQUIRED) ================= */
        research: {
          entries: [
            ...research.papers
              .filter(p => p.title)
              .map(p => ({
                type: "journal_papers",
                count: 1,
                title: p.title,
                year: Number(p.year),
                enclosure_no: p.enclosureNo
              })),

            ...research.publications
              .filter(p => p.title)
              .map(p => ({
                type: "book_national",
                count: 1,
                title: p.title,
                year: Number(p.year),
                enclosure_no: p.enclosureNo
              })),

            ...research.invitedTalks
              .filter(t => t.year)
              .map(t => ({
                type: "invited_lecture_national",
                count: 1,
                year: Number(t.year),
                enclosure_no: t.enclosureNo
              }))
          ]
        },

        /* ================= PBAS (MANDATORY BLOCK) ================= */
        pbas: {
          student_feedback: studentFeedback.map(f => ({
            semester: f.semester,
            course_code: f.courseCode,
            course_name: f.courseName,
            feedback_score: Number(f.averageScore),
            enclosure_no: f.enclosureNo
          })),

          departmental_activities: departmentalActivities.map(d => ({
            activity: d.activity,
            semester: d.semester,
            credits_claimed: Number(d.creditsClaimed),
            enclosure_no: d.enclosureNo
          })),

          institute_activities: instituteActivities.map(i => ({
            activity: i.activity,
            semester: i.semester,
            credits_claimed: Number(i.creditsClaimed),
            enclosure_no: i.enclosureNo
          })),

          society_activities: societyActivities.map(s => ({
            activity: s.activity,
            semester: s.semester,
            credits_claimed: Number(s.creditsClaimed),
            enclosure_no: s.enclosureNo
          })),

          /* 🔥 REQUIRED BY validate_pbas_scores */
          teaching_process: Number(pbasScores.teaching_process),
          feedback: Number(pbasScores.feedback),
          department: Number(pbasScores.department),
          institute: Number(pbasScores.institute),
          acr: Number(pbasScores.acr),
          society: Number(pbasScores.society)
        },

        /* ================= ACR ================= */
        acr: {
          year: acrDetails.year,
          grade: acrDetails.acrAvailable
        }
      }
    };
  };



  const handleSaveDraft = async () => {
    try {
      const payload = buildBackendPayload("draft");
      // console.log("DRAFT PAYLOAD", payload);


      let url = submitEndpoint;
      if (appraisalId && appraisalStatus !== "DRAFT") {
        url = isHOD
          ? `/hod/resubmit/${appraisalId}/`
          : `/faculty/appraisal/${appraisalId}/resubmit/`;
      }

      await API.post(url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });


      alert("Draft saved successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save draft");
    }
  };



  const validateStep1 = () => {
    const newErrors = {};

    if (!generalInfo.facultyName)
      newErrors.facultyName = "Faculty Name is required";

    if (!generalInfo.designation)
      newErrors.designation = "Designation is required";

    if (!generalInfo.department)
      newErrors.department = "Department is required";

    if (!generalInfo.dateOfJoining)
      newErrors.dateOfJoining = "Date of Joining is required";

    if (!generalInfo.email)
      newErrors.email = "Email is required";

    if (!generalInfo.mobile)
      newErrors.mobile = "Mobile number is required";

    if (!generalInfo.communicationAddress)
      newErrors.communicationAddress = "Address is required";

    if (!generalInfo.currentDesignation)
      newErrors.currentDesignation = "Current designation is required";

    if (!generalInfo.payLevel)
      newErrors.payLevel = "Pay level is required";

    if (!generalInfo.academicYear)
      newErrors.academicYear = "Academic year is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Teaching
  const validateStep2 = () => {
    const newErrors = {};

    // At least one teaching entry required
    if (!teachingActivities || teachingActivities.length === 0) {
      newErrors.teaching = "At least one teaching entry is required";
    } else {
      teachingActivities.forEach((t, index) => {
        if (!t.academicYear) {
          newErrors[`teaching_${index}_academicYear`] =
            "Academic Year is required";
        }

        if (!t.semester) {
          newErrors[`teaching_${index}_semester`] =
            "Semester is required";
        }

        if (!t.courseCode) {
          newErrors[`teaching_${index}_courseCode`] =
            "Course Code is required";
        }

        if (!t.courseName) {
          newErrors[`teaching_${index}_courseName`] =
            "Course Name is required";
        }

        if (!t.teachingType) {
          newErrors[`teaching_${index}_teachingType`] =
            "Teaching Type is required";
        }

        if (!t.totalClassesAssigned) {
          newErrors[`teaching_${index}_totalClassesAssigned`] =
            "Total Classes Assigned is required";
        }

        if (!t.classesConducted) {
          newErrors[`teaching_${index}_classesConducted`] =
            "Classes Conducted is required";
        }

        // Optional but logical check
        if (
          t.totalClassesAssigned &&
          t.classesConducted &&
          Number(t.classesConducted) > Number(t.totalClassesAssigned)
        ) {
          newErrors[`teaching_${index}_classesConducted`] =
            "Classes conducted cannot exceed classes assigned";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveAndNext = () => {
    setErrors({});
    setCurrentStep(2);
  };
  const validateSPPU = () => {
    const newErrors = {};

    Object.entries(sppuInvolvement).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildResearchEntries = () => {
    const counts = {};

    // Research Papers
    const journalPapers = research.papers.filter(p => p.title).length;
    if (journalPapers > 0) counts.journal_papers = journalPapers;

    // Publications
    research.publications.forEach(p => {
      if (!p.type || !p.publisherType) return;

      if (p.type === "Book" && p.publisherType === "International") {
        counts.book_international = (counts.book_international || 0) + 1;
      }
      if (p.type === "Book" && p.publisherType === "National") {
        counts.book_national = (counts.book_national || 0) + 1;
      }
      if (p.type === "Chapter") {
        counts.edited_book_chapter = (counts.edited_book_chapter || 0) + 1;
      }
    });

    // Research Projects
    research.projects.forEach(p => {
      if (p.status === "Completed" && p.amountSlab === ">10L") {
        counts.project_completed_gt_10_lakhs =
          (counts.project_completed_gt_10_lakhs || 0) + 1;
      }
      if (p.status === "Completed" && p.amountSlab === "<10L") {
        counts.project_completed_lt_10_lakhs =
          (counts.project_completed_lt_10_lakhs || 0) + 1;
      }
    });

    // Research Guidance
    research.guidance.forEach(g => {
      if (g.degree === "PhD" && g.status === "Awarded") {
        counts.phd_awarded =
          (counts.phd_awarded || 0) + Number(g.count || 0);
      }
      if (g.degree === "PG" && g.status === "Submitted") {
        counts.pg_dissertation_awarded =
          (counts.pg_dissertation_awarded || 0) + Number(g.count || 0);
      }
    });

    // MOOCs
    research.moocsIct.forEach(m => {
      if (Number(m.creditClaimed) > 0) {
        counts.mooc_complete_4_quadrant =
          (counts.mooc_complete_4_quadrant || 0) + 1;
      }
    });

    // Consultancy
    research.consultancyPolicy.forEach(c => {
      if (c.category === "Consultancy") {
        counts.consultancy = (counts.consultancy || 0) + 1;
      }
    });

    // Awards
    research.awards.forEach(a => {
      if (a.level === "International") {
        counts.award_international = (counts.award_international || 0) + 1;
      }
      if (a.level === "National") {
        counts.award_national = (counts.award_national || 0) + 1;
      }
    });

    // Invited Talks
    research.invitedTalks.forEach(t => {
      if (t.level === "International Abroad") {
        counts.invited_lecture_international_abroad =
          (counts.invited_lecture_international_abroad || 0) + 1;
      }
      if (t.level === "National") {
        counts.invited_lecture_national =
          (counts.invited_lecture_national || 0) + 1;
      }
    });

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count
    }));
  };


  const buildPBASScores = () => {
    const totalAssigned = teachingActivities.reduce(
      (s, t) => s + Number(t.totalClassesAssigned || 0),
      0
    );

    const totalConducted = teachingActivities.reduce(
      (s, t) => s + Number(t.classesConducted || 0),
      0
    );

    const teaching_process =
      totalAssigned > 0
        ? Math.min(
          Math.round((totalConducted / totalAssigned) * 25),
          25
        )
        : 0;

    const feedback = Math.min(
      studentFeedback.reduce(
        (s, f) => s + Number(f.averageScore || 0),
        0
      ),
      25
    );

    const department = Math.min(
      departmentalActivities.reduce(
        (s, a) => s + Number(a.credit || 0),
        0
      ),
      20
    );

    const institute = Math.min(
      instituteActivities.reduce(
        (s, a) => s + Number(a.credit || 0),
        0
      ),
      10
    );

    const society = Math.min(
      societyActivities.reduce(
        (s, a) => s + Number(a.credit || 0),
        0
      ),
      10
    );

    const acr = acrDetails.acrAvailable === "Yes" ? 10 : 0;

    return {
      teaching_process,
      feedback,
      department,
      institute,
      society,
      acr
    };
  };


  const buildAppraisalPayload = () => {
    const totalAssigned = teachingActivities.reduce(
      (sum, t) => sum + Number(t.totalClassesAssigned),
      0
    );

    const totalTaught = teachingActivities.reduce(
      (sum, t) => sum + Number(t.classesConducted),
      0
    );

    return {
      academic_year: generalInfo.academicYear,
      semester: "SEM_1",
      form_type: "FACULTY",

      appraisal_data: {
        submit_action: "SUBMIT",

        general: {
          faculty_name: generalInfo.facultyName,
          designation: generalInfo.designation,
          department: generalInfo.department
        },

        teaching: {
          total_classes_assigned: totalAssigned,
          classes_taught: totalTaught,
          courses: teachingActivities.map(t => ({
            course_code: t.courseCode,
            total_classes_assigned: Number(t.totalClassesAssigned),
            classes_taught: Number(t.classesConducted)
          }))
        },

        activities: {
          administrative_responsibility: sppuInvolvement.administrative === "Yes",
          exam_duties: sppuInvolvement.examDuty === "Yes",
          student_related: sppuInvolvement.studentActivity === "Yes",
          organizing_events: sppuInvolvement.seminarOrg === "Yes",
          phd_guidance: sppuInvolvement.phdGuidance === "Yes",
          research_project: sppuInvolvement.researchProject === "Yes",
          sponsored_project: false
        },

        research: {
          entries: buildResearchEntries()
        },

        // ✅ PBAS BLOCK
        pbas: {
          ...buildPBASScores(),
          ...buildPBASCounts(),

          teaching_process: teachingActivities.map(t => {
            const assigned = Number(t.totalClassesAssigned || 0);
            const conducted = Number(t.classesConducted || 0);
            const points = assigned > 0 ? (conducted / assigned) * 10 : 0; // Approximate per-course score
            return {
              semester: t.semester,
              course: `${t.courseName} (${t.courseCode})`,
              scheduled: assigned,
              held: conducted,
              points: parseFloat(points.toFixed(2)),
              enclosure: t.enclosureNo || ""
            };
          }),

          student_feedback: studentFeedback.map(f => ({
            semester: f.semester,
            course: `${f.courseName} (${f.courseCode})`,
            average: Number(f.averageScore),
            feedback_score: Number(f.averageScore), // For scoring engine compatibility
            enclosure: f.enclosureNo || ""
          })),

          departmental_activities: departmentalActivities.map(a => ({
            semester: a.semester,
            activity: a.activity,
            criteria: a.criteria,
            credit: Number(a.credit),
            enclosure: a.enclosureNo || ""
          })),

          institute_activities: instituteActivities.map(a => ({
            semester: a.semester,
            activity: a.activity,
            credits_claimed: Number(a.credit),
            enclosure_no: a.enclosureNo || null
          })),

          society_activities: societyActivities.map(a => ({
            semester: a.semester,
            activity: a.activity,
            credits_claimed: Number(a.credit),
            enclosure_no: a.enclosureNo || null
          }))
        },

        acr: {
          grade: acrDetails.acrAvailable === "Yes" ? "A" : "C"
        }
      }
    };
  };



  const buildPBASCounts = () => {
    return {
      research: {
        journal_papers: research.papers.filter(
          p => p.ugcCare === "Yes"
        ).length,
        conference_papers: 0
      },

      publications: {
        book_national: research.publications.filter(
          p => p.type === "Book" && p.publisherType === "National"
        ).length,

        book_international: research.publications.filter(
          p => p.type === "Book" && p.publisherType === "International"
        ).length
      },

      ict: {
        innovative_pedagogy: research.moocsIct.filter(
          m => m.category === "Curriculum Design"
        ).length,

        mooc: {
          module: research.moocsIct.reduce(
            (sum, m) => sum + Number(m.creditClaimed || 0),
            0
          )
        }
      },

      research_guidance: {
        phd_awarded: research.guidance.reduce(
          (sum, g) =>
            g.degree === "PhD" && g.status === "Awarded"
              ? sum + Number(g.count || 0)
              : sum,
          0
        )
      },

      patents: {
        international: research.patents.filter(
          p => p.type === "International" && p.status === "Granted"
        ).length
      },

      invited_lectures: {
        national: research.invitedTalks.filter(
          t => t.level === "National"
        ).length
      }
    };
  };


  const handleSubmitForm = async () => {
    // 1️⃣ Declaration check
    if (!declarationAccepted) {
      alert("Please accept the declaration.");
      return;
    }

    // 2️⃣ Final confirmation
    const confirmed = window.confirm(
      "Once submitted, the form cannot be edited. Continue?"
    );
    if (!confirmed) return;

    try {
      // 3️⃣ Build payload (ONLY ONCE)
      const payload = buildAppraisalPayload();
      // console.log("✅ FINAL SUBMIT PAYLOAD", payload);


      // 4️⃣ API call
      let url = submitEndpoint;
      if (appraisalId && appraisalStatus !== "DRAFT") {
        url = isHOD
          ? `/hod/resubmit/${appraisalId}/`
          : `/faculty/appraisal/${appraisalId}/resubmit/`;
      }

      console.log("DEBUG: Submitting to", url, { appraisalId, appraisalStatus });

      await API.post(url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`
        }
      });



      // 5️⃣ Post-submit actions
      setFormStatus("submitted");
      localStorage.removeItem("facultyDraft");

      alert(
        isHOD
          ? "Appraisal submitted and sent to Principal for review."
          : "Appraisal submitted and sent to HOD for review."
      );
      navigate(isHOD ? "/HOD/dashboard" : "/faculty/dashboard");


    } catch (error) {
      // 6️⃣ Proper error handling
      console.error("❌ SUBMISSION ERROR");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      console.error("Full error:", error);

      alert("Submission failed. Please try again.");
    }
  };





  // ================= DEPARTMENTAL ACTIVITIES HANDLERS =================

  const handleDeptChange = (index, field, value) => {
    setDepartmentalActivities(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };
  const addDeptRow = () => {
    setDepartmentalActivities(prev => [
      ...prev,
      {
        semester: "",
        activity: "",
        credit: "",
        criteria: "",
        enclosureNo: "",
        otherActivity: ""
      }
    ]);


  };

  const removeDeptRow = (index) => {
    setDepartmentalActivities(prev =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };
  // ===== STEP 4 HANDLERS (RESEARCH SECTION) =====

  const handleResearchChange = (section, index, field, value) => {
    setResearch(prev => {
      const updated = [...prev[section]];
      updated[index][field] = value;

      return {
        ...prev,
        [section]: updated
      };
    });
  };

  const addResearchRow = (section, emptyRow) => {
    setResearch(prev => ({
      ...prev,
      [section]: [...prev[section], emptyRow]
    }));
  };

  const removeResearchRow = (section, index) => {
    setResearch(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };
  const handleStudentFeedbackChange = (index, field, value) => {
    setStudentFeedback(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addStudentFeedbackRow = () => {
    setStudentFeedback(prev => [
      ...prev,
      {
        semester: "",
        courseCode: "",
        courseName: "",
        averageScore: "",
        enclosureNo: ""
      }
    ]);
  };

  const removeStudentFeedbackRow = (index) => {
    setStudentFeedback(prev =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };
  const handleAcrChange = (e) => {
    const { name, value } = e.target;
    setAcrDetails(prev => ({ ...prev, [name]: value }));
  };


  /* ================= RENDER ================= */
  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">Faculty Appraisal Form</h2>
        <div className="header-actions">
          <button
            className="btn-logout"
            onClick={() => navigate("/login")}
          >
            Logout
          </button>
        </div>
      </div>

      {remarks && (
        <div style={{
          background: "#fffbeb",
          border: "1px solid #fde68a",
          color: "#92400e",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          marginTop: "20px"
        }}>
          <strong style={{ display: "block", marginBottom: "4px" }}>Reviewer Remarks:</strong>
          <p style={{ margin: 0 }}>{remarks}</p>
        </div>
      )}

      {currentStep === 1 && (
        <div className="form-section">
          <h3>Step 1: General Information</h3>
          <fieldset
            disabled={formStatus === "submitted"}
            style={{ border: "none", padding: 0 }}
          >
            <p className="section-note">
              This information will be used for both SPPU and PBAS appraisal forms.
              Fields marked with <span className="required">*</span> are compulsory.
            </p>

            <div className="form-grid">

              <div className="form-group">
                <label>
                  Faculty Name <span className="required">*</span>
                </label>
                <input
                  name="facultyName"
                  value={generalInfo.facultyName}
                  onChange={handleGeneralChange}
                />
                {errors.facultyName && (
                  <div className="field-error">{errors.facultyName}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Designation <span className="required">*</span>
                </label>
                <input
                  name="designation"
                  value={generalInfo.designation}
                  onChange={handleGeneralChange}
                />
                {errors.designation && (
                  <div className="field-error">{errors.designation}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Department / Centre <span className="required">*</span>
                </label>
                <input
                  name="department"
                  value={generalInfo.department}
                  onChange={handleGeneralChange}
                />
                {errors.department && (
                  <div className="field-error">{errors.department}</div>
                )}
              </div>

              <div className="form-group">
                <label>
                  Date of Joining <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={generalInfo.dateOfJoining}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Email ID <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={generalInfo.email}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Mobile Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={generalInfo.mobile}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group full">
                <label>
                  Communication Address <span className="required">*</span>
                </label>
                <textarea
                  rows={3}
                  name="communicationAddress"
                  value={generalInfo.communicationAddress}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Current Designation (Present Position)
                  <span className="required">*</span>
                </label>
                <input
                  name="currentDesignation"
                  value={generalInfo.currentDesignation}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Pay Level / Grade Pay <span className="required">*</span>
                </label>
                <input
                  name="payLevel"
                  value={generalInfo.payLevel}
                  onChange={handleGeneralChange}
                  placeholder="e.g. Level 13A / AGP 8000"
                />
              </div>

              <div className="form-group">
                <label>Promotion Designation (if any)</label>
                <input
                  name="promotionDesignation"
                  value={generalInfo.promotionDesignation}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>Promotion Date</label>
                <input
                  type="date"
                  name="promotionDate"
                  value={generalInfo.promotionDate}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>Date of Eligibility</label>
                <input
                  type="date"
                  name="eligibilityDate"
                  value={generalInfo.eligibilityDate}
                  onChange={handleGeneralChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Academic Year (Assessment Period)
                  <span className="required">*</span>
                </label>
                <input
                  name="academicYear"
                  value={generalInfo.academicYear}
                  onChange={handleGeneralChange}
                />
              </div>

            </div>
          </fieldset>

          <div className="form-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (validateStep1()) {
                  handleSaveAndNext(); // this should setCurrentStep(2)
                }
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )
      }



      {/* ================= SECTION 2 ================= */}
      {/* ================= STEP 2 ================= */}
      {
        currentStep === 2 && (
          <div className="form-section">

            {/* ================= TEACHING ================= */}
            <h3>
              Step 2A: Teaching Process (Category I)
              <span className="required">*</span>
            </h3>

            <fieldset
              disabled={formStatus === "submitted"}
              style={{ border: "none", padding: 0 }}
            >
              <p className="section-note">
                Fields marked with <span className="required">*</span> are compulsory.
                At least one teaching entry must be provided.
              </p>

              {teachingActivities.map((row, index) => (
                <div className="entry-card" key={index}>

                  <div className="entry-header">
                    <h4>Teaching Entry {index + 1}</h4>

                    {teachingActivities.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeTeachingRow(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* ROW 1 */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Academic Year <span className="required">*</span></label>
                      <select
                        name="academicYear"
                        value={row.academicYear}
                        onChange={(e) => handleTeachingChange(index, e)}
                      >
                        {ACADEMIC_YEARS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Semester <span className="required">*</span></label>
                      <select
                        name="semester"
                        value={row.semester}
                        onChange={(e) => handleTeachingChange(index, e)}
                      >
                        <option value="">-- Select Semester --</option>
                        {SEMESTERS.map((sem) => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROW 2 */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Course Code <span className="required">*</span></label>
                      <input
                        name="courseCode"
                        placeholder="e.g. CSL301"
                        value={row.courseCode}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Course Name <span className="required">*</span></label>
                      <input
                        name="courseName"
                        placeholder="e.g.Database Management Systems"
                        value={row.courseName}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>
                  </div>

                  {/* ROW 3 */}
                  <div className="form-row three">
                    <div className="form-group">
                      <label>Class / Division</label>
                      <input
                        name="classDivision"
                        value={row.classDivision}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Teaching Type <span className="required">*</span></label>
                      <select
                        name="teachingType"
                        value={row.teachingType}
                        onChange={(e) => handleTeachingChange(index, e)}
                      >
                        <option value="">-- Select Type --</option>
                        {TEACHING_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Level</label>
                      <select
                        name="academicLevel"
                        value={row.academicLevel}
                        onChange={(e) => handleTeachingChange(index, e)}
                      >
                        <option value="">-- Select Level --</option>
                        {ACADEMIC_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ROW 4 */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total Classes Assigned <span className="required">*</span></label>
                      <input
                        type="number"
                        placeholder="e.g: 3"
                        name="totalClassesAssigned"
                        value={row.totalClassesAssigned}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Classes Conducted <span className="required">*</span></label>
                      <input
                        type="number"
                        name="classesConducted"
                        placeholder="e.g: 45"
                        value={row.classesConducted}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>
                  </div>

                  {/* ROW 5 */}
                  <div className="form-row full">
                    <div className="form-group">
                      <label>Enclosure / Proof Reference</label>
                      <input
                        name="enclosureNo"
                        value={row.enclosureNo}
                        onChange={(e) => handleTeachingChange(index, e)}
                      />
                    </div>
                  </div>

                </div>
              ))}

              <button
                type="button"
                className="add-row-btn"
                onClick={addTeachingRow}
              >
                + Add Teaching Entry
              </button>

              <hr />


              {/* ================= SPPU INVOLVEMENT ================= */}
              <h3>Step 2B: Involvement in University / College Activities (SPPU)</h3>

              <p className="section-note">
                Select <b>Yes</b> or <b>No</b> for each activity as per SPPU appraisal norms.
              </p>

              {[
                ["administrative", "Administrative responsibilities (HOD / Dean / Coordinator etc.)"],
                ["examDuty", "Examination & evaluation duties"],
                ["studentActivity", "Student related co-curricular / extension activities"],
                ["seminarOrg", "Organizing seminars / workshops / conferences"],
                ["phdGuidance", "Guiding PhD students"],
                ["researchProject", "Conducting minor / major research projects"],
                ["publication", "Publication in UGC / Peer-reviewed journals"]
              ].map(([key, label]) => (
                <div className="sppu-row" key={key}>
                  <label className="sppu-label">
                    {label} <span className="required">*</span>
                  </label>

                  <div className="sppu-options">
                    {["Yes", "No"].map((opt) => (
                      <label key={opt}>
                        <input
                          type="radio"
                          name={key}
                          value={opt}
                          checked={sppuInvolvement[key] === opt}
                          onChange={(e) =>
                            setSppuInvolvement({
                              ...sppuInvolvement,
                              [key]: e.target.value
                            })
                          }
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
            {/* NAVIGATION */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-back"
                onClick={() => setCurrentStep(1)}
              >
                ← Back
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (validateSPPU()) {
                    setCurrentStep(3);
                  }
                }}
              >
                Next →
              </button>

            </div>

          </div>
        )
      }

      {
        currentStep === 3 && (

          <div className="form-section">
            <fieldset
              disabled={formStatus === "submitted"}
              style={{ border: "none", padding: 0 }}
            >
              <h4>A. ACR Details</h4>

              <div className="activity-card">
                <div className="activity-row">
                  <input
                    name="year"
                    placeholder="ACR Year (e.g. 2024-25)"
                    value={acrDetails.year}
                    onChange={handleAcrChange}
                  />

                  <select
                    name="acrAvailable"
                    value={acrDetails.acrAvailable}
                    onChange={handleAcrChange}
                  >
                    <option value="">Is ACR Available?</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>

                  <input
                    name="enclosureNo"
                    placeholder="Enclosure No."
                    value={acrDetails.enclosureNo}
                    onChange={handleAcrChange}
                  />
                  {/*new added */}
                  {/*  Credit Points Input */}

                  <input
                    type="number"
                    name="creditPoints"
                    placeholder="Credit Points"
                    value={acrDetails.creditPoints}
                    onChange={handleAcrChange}
                    min="0"
                  />
                </div>
              </div>



              <hr />

              <h4>B. Student Feedback (Max Point 25)</h4>

              {studentFeedback.map((row, index) => (
                <div className="activity-card" key={index}>

                  {/* ROW 1 */}
                  <div className="activity-row">
                    <input
                      placeholder="Semester (e.g. 1/2024-25)"
                      value={row.semester}
                      onChange={(e) =>
                        handleStudentFeedbackChange(index, "semester", e.target.value)
                      }
                    />

                    <input
                      placeholder="Course Code"
                      value={row.courseCode}
                      onChange={(e) =>
                        handleStudentFeedbackChange(index, "courseCode", e.target.value)
                      }
                    />

                    <input
                      placeholder="Course Name"
                      value={row.courseName}
                      onChange={(e) =>
                        handleStudentFeedbackChange(index, "courseName", e.target.value)
                      }
                    />
                  </div>

                  {/* ROW 2 */}
                  <div className="activity-row">
                    <input
                      type="number"
                      min="0"
                      max="25"
                      placeholder="Average Feedback (out of 25)"
                      value={row.averageScore}
                      onChange={(e) =>
                        handleStudentFeedbackChange(index, "averageScore", e.target.value)
                      }
                    />

                    <input
                      placeholder="Enclosure No."
                      value={row.enclosureNo}
                      onChange={(e) =>
                        handleStudentFeedbackChange(index, "enclosureNo", e.target.value)
                      }
                    />

                    {studentFeedback.length > 1 ? (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeStudentFeedbackRow(index)}
                      >
                        ✕
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>

                </div>
              ))}

              <button
                type="button"
                className="btn-outline"
                onClick={addStudentFeedbackRow}
              >
                + Add Student Feedback Entry
              </button>
              <hr />
              {/*new added */}
              <h4>C. Departmental Activities (Max Credit 20)</h4>

              {departmentalActivities.map((row, index) => (
                <div className="activity-card" key={index}>
                  <div className="activity-row">

                    <input
                      placeholder="Semester"
                      value={row.semester}
                      onChange={(e) =>
                        handleDeptChange(index, "semester", e.target.value)
                      }
                    />

                    <select
                      value={row.activity}
                      onChange={(e) =>
                        handleDeptChange(index, "activity", e.target.value)
                      }
                    >
                      <option value="">Select Activity</option>
                      {DEPARTMENTAL_ACTIVITIES.map((act, i) => (
                        <option key={i} value={act}>{act}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Credit Point"
                      value={row.credit}
                      onChange={(e) =>
                        handleDeptChange(index, "credit", e.target.value)
                      }
                    />

                    <input
                      placeholder="Criteria (e.g. 3 Point / semester)"
                      value={row.criteria}
                      onChange={(e) =>
                        handleDeptChange(index, "criteria", e.target.value)
                      }
                    />

                    <input
                      placeholder="Enclosure No."
                      value={row.enclosureNo}
                      onChange={(e) =>
                        handleDeptChange(index, "enclosureNo", e.target.value)
                      }
                    />

                    {departmentalActivities.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeDeptRow(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {row.activity === "Any other Activity" && (
                    <div className="activity-row">
                      <input
                        placeholder="Specify other departmental activity"
                        value={row.otherActivity}
                        onChange={(e) =>
                          handleDeptChange(index, "otherActivity", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-outline"
                onClick={addDeptRow}
              >
                + Add Departmental Activity
              </button>





              <hr />
              {/*new added */}
              <h4>D. Institute Activities (Max Credit 10)</h4>

              {instituteActivities.map((row, index) => (
                <div className="activity-card" key={index}>
                  <div className="activity-row">

                    <input
                      name="semester"
                      placeholder="Semester"
                      value={row.semester}
                      onChange={(e) =>
                        handleArrayChange(setInstituteActivities, index, e)
                      }
                    />

                    <select
                      name="activity"
                      value={row.activity}
                      onChange={(e) =>
                        handleArrayChange(setInstituteActivities, index, e)
                      }
                    >
                      <option value="">Select Activity</option>
                      {INSTITUTE_ACTIVITIES.map((act, i) => (
                        <option key={i} value={act}>{act}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      name="credit"
                      placeholder="Credit Point"
                      value={row.credit}
                      onChange={(e) =>
                        handleArrayChange(setInstituteActivities, index, e)
                      }
                    />

                    <input
                      name="criteria"
                      placeholder="Criteria"
                      value={row.criteria}
                      onChange={(e) =>
                        handleArrayChange(setInstituteActivities, index, e)
                      }
                    />

                    <input
                      name="enclosureNo"
                      placeholder="Enclosure No."
                      value={row.enclosureNo}
                      onChange={(e) =>
                        handleArrayChange(setInstituteActivities, index, e)
                      }
                    />

                    {instituteActivities.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() =>
                          removeRow(setInstituteActivities, index)
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {row.activity === "Any other Activity" && (
                    <div className="activity-row">
                      <input
                        name="otherActivity"
                        placeholder="Specify other institute activity"
                        value={row.otherActivity}
                        onChange={(e) =>
                          handleArrayChange(setInstituteActivities, index, e)
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <hr />
              {/*new added */}

              {/* ================= STEP 3C: CONTRIBUTION TO SOCIETY ================= */}
              <h4>E. Contribution to Society (Max Credit 10)</h4>

              {societyActivities.map((row, index) => (
                <div className="activity-card" key={index}>
                  <div className="activity-row">

                    <select
                      name="activity"
                      value={row.activity}
                      onChange={(e) =>
                        handleArrayChange(setSocietyActivities, index, e)
                      }
                    >
                      <option value="">Select Activity</option>
                      {SOCIETY_ACTIVITIES.map((act, i) => (
                        <option key={i} value={act}>{act}</option>
                      ))}
                    </select>

                    <input
                      name="semester"
                      placeholder="Semester / Year"
                      value={row.semester}
                      onChange={(e) =>
                        handleArrayChange(setSocietyActivities, index, e)
                      }
                    />

                    <input
                      name="credit"
                      placeholder="Credit Point"
                      value={row.credit}
                      onChange={(e) =>
                        handleArrayChange(setSocietyActivities, index, e)
                      }
                    />

                    <input
                      name="criteria"
                      placeholder="Criteria (e.g. 5 Point / event)"
                      value={row.criteria}
                      onChange={(e) =>
                        handleArrayChange(setSocietyActivities, index, e)
                      }
                    />

                    <input
                      name="enclosureNo"
                      placeholder="Enclosure No."
                      value={row.enclosureNo}
                      onChange={(e) =>
                        handleArrayChange(setSocietyActivities, index, e)
                      }
                    />

                    {societyActivities.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() =>
                          removeRow(setSocietyActivities, index)
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {row.activity === "Any other Activity" && (
                    <div className="activity-row">
                      <input
                        name="otherActivity"
                        placeholder="Specify other social activity"
                        value={row.otherActivity}
                        onChange={(e) =>
                          handleArrayChange(setSocietyActivities, index, e)
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  addRow(setSocietyActivities, {
                    activity: "",
                    semester: "",
                    credit: "",
                    criteria: "",
                    enclosureNo: "",
                    otherActivity: ""
                  })
                }
              >
                + Add Society Contribution
              </button>



            </fieldset>
            {/* ================= NAVIGATION ================= */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-back"
                onClick={() => setCurrentStep(2)}
              >
                ← Back
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setCurrentStep(4)}
              >
                Next →
              </button>
            </div>

          </div>
        )
      }

      {/* ================= STEP 4: RESEARCH & ACADEMIC CONTRIBUTIONS ================= */}
      {
        currentStep === 4 && (
          <div className="form-section">

            <h3>Step 4: Research & Academic Contributions</h3>
            <fieldset
              disabled={formStatus === "submitted"}
              style={{ border: "none", padding: 0 }}
            >
              {/* ========== 1. RESEARCH PAPERS ========== */}
              <h4>1. Research Papers</h4>


              {research.papers.map((row, index) => (
                <div className="research-card" key={index}>

                  <input placeholder="Title"
                    value={row.title}
                    onChange={e => handleResearchChange("papers", index, "title", e.target.value)}
                  />

                  <input placeholder="Journal"
                    value={row.journal}
                    onChange={e => handleResearchChange("papers", index, "journal", e.target.value)}
                  />

                  <select
                    value={row.ugcCare}
                    onChange={e => handleResearchChange("papers", index, "ugcCare", e.target.value)}
                  >
                    <option value="">UGC CARE?</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>

                  <select
                    value={row.authorship}
                    onChange={e => handleResearchChange("papers", index, "authorship", e.target.value)}
                  >
                    <option value="">Authorship</option>
                    <option value="Single">Single</option>
                    <option value="First">First / Corresponding</option>
                    <option value="Co-author">Co-author</option>
                  </select>

                  <input placeholder="Impact Factor"
                    value={row.impactFactor}
                    onChange={e => handleResearchChange("papers", index, "impactFactor", e.target.value)}
                  />

                  <input placeholder="Year"
                    value={row.year}
                    onChange={e => handleResearchChange("papers", index, "year", e.target.value)}
                  />

                  <input placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e => handleResearchChange("papers", index, "enclosureNo", e.target.value)}
                  />

                  {research.papers.length > 1 && (
                    <button className="btn-remove-small" onClick={() => removeResearchRow("papers", index)}>✕</button>
                  )}
                </div>
              ))}

              <button className="btn-add" onClick={() =>
                addResearchRow("papers", {
                  title: "", journal: "", ugcCare: "",
                  impactFactor: "", authorship: "",
                  year: "", enclosureNo: ""
                })
              }>
                + Add Paper
              </button>

              <hr />

              {/* ========== 2. PUBLICATIONS ========== */}
              <h4>2. Books / Chapters / Publications</h4>

              {research.publications.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.type}
                    onChange={e => handleResearchChange("publications", index, "type", e.target.value)}
                  >
                    <option value="">Type</option>
                    <option value="Book">Book</option>
                    <option value="Chapter">Chapter</option>
                    <option value="Editor">Editor</option>
                    <option value="Translation">Translation</option>
                  </select>

                  <select
                    value={row.publisherType}
                    onChange={e => handleResearchChange("publications", index, "publisherType", e.target.value)}
                  >
                    <option value="">Publisher</option>
                    <option value="International">International</option>
                    <option value="National">National</option>
                  </select>

                  <input placeholder="Title"
                    value={row.title}
                    onChange={e => handleResearchChange("publications", index, "title", e.target.value)}
                  />

                  <input placeholder="Year"
                    value={row.year}
                    onChange={e => handleResearchChange("publications", index, "year", e.target.value)}
                  />

                  <input placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e => handleResearchChange("publications", index, "enclosureNo", e.target.value)}
                  />

                  <button className="btn-remove-small" onClick={() => removeResearchRow("publications", index)}>✕</button>
                </div>
              ))}

              <button className="btn-add" onClick={() =>
                addResearchRow("publications", {
                  type: "", title: "",
                  publisherType: "", year: "",
                  enclosureNo: ""
                })
              }>
                + Add Publication
              </button>

              <hr />

              {/* ========== 3. RESEARCH PROJECTS ========== */}
              <h4>3. Research Projects</h4>

              {research.projects.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.status}
                    onChange={e => handleResearchChange("projects", index, "status", e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>

                  <select
                    value={row.amountSlab}
                    onChange={e => handleResearchChange("projects", index, "amountSlab", e.target.value)}
                  >
                    <option value="">Grant</option>
                    <option value=">10L">More than 10 Lakhs</option>
                    <option value="<10L">Less than 10 Lakhs</option>
                  </select>

                  <select
                    value={row.role}
                    onChange={e => handleResearchChange("projects", index, "role", e.target.value)}
                  >
                    <option value="">Role</option>
                    <option value="PI">PI</option>
                    <option value="Co-PI">Co-PI</option>
                  </select>

                  <input placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e => handleResearchChange("projects", index, "enclosureNo", e.target.value)}
                  />

                  <button className="btn-remove-small" onClick={() => removeResearchRow("projects", index)}>✕</button>
                </div>
              ))}

              <button className="btn-add" onClick={() =>
                addResearchRow("projects", {
                  status: "", amountSlab: "",
                  role: "", enclosureNo: ""
                })
              }>
                + Add Project
              </button>

              <hr />

              {/* ========== 4. PATENTS ========== */}
              <h4>4. Patents</h4>

              {research.patents.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.type}
                    onChange={e => handleResearchChange("patents", index, "type", e.target.value)}
                  >
                    <option value="">Type</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>

                  <select
                    value={row.status}
                    onChange={e => handleResearchChange("patents", index, "status", e.target.value)}
                  >
                    <option value="">Status</option>
                    <option value="Filed">Filed</option>
                    <option value="Granted">Granted</option>
                  </select>

                  <input placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e => handleResearchChange("patents", index, "enclosureNo", e.target.value)}
                  />

                  <button className="btn-remove-small" onClick={() => removeResearchRow("patents", index)}>✕</button>
                </div>
              ))}

              <button className="btn-add" onClick={() =>
                addResearchRow("patents", {
                  type: "", status: "", enclosureNo: ""
                })
              }>
                + Add Patent
              </button>

              <hr />
              <hr />
              <h4>5. Research Guidance</h4>

              {research.guidance.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.degree}
                    onChange={e =>
                      handleResearchChange("guidance", index, "degree", e.target.value)
                    }
                  >
                    <option value="">Degree</option>
                    <option value="PhD">Ph.D</option>
                    <option value="PG">PG</option>
                  </select>

                  <select
                    value={row.status}
                    onChange={e =>
                      handleResearchChange("guidance", index, "status", e.target.value)
                    }
                  >
                    <option value="">Status</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Submitted">Submitted</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Number of Students"
                    value={row.count}
                    onChange={e =>
                      handleResearchChange("guidance", index, "count", e.target.value)
                    }
                  />

                  <input
                    placeholder="Year"
                    value={row.year}
                    onChange={e =>
                      handleResearchChange("guidance", index, "year", e.target.value)
                    }
                  />

                  <input
                    placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e =>
                      handleResearchChange("guidance", index, "enclosureNo", e.target.value)
                    }
                  />

                  <button
                    className="btn-remove-small"
                    onClick={() => removeResearchRow("guidance", index)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="btn-add"
                onClick={() =>
                  addResearchRow("guidance", {
                    degree: "",
                    status: "",
                    count: "",
                    year: "",
                    enclosureNo: ""
                  })
                }
              >
                + Add Research Guidance
              </button>
              <hr />
              <h4>6. MOOCs / ICT Enabled Content</h4>

              {research.moocsIct.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.category}
                    onChange={e =>
                      handleResearchChange("moocsIct", index, "category", e.target.value)
                    }
                  >
                    <option value="">Category</option>
                    <option value="MOOC">MOOC</option>
                    <option value="E-Content">E-Content</option>
                    <option value="Curriculum Design">Curriculum Design</option>
                  </select>

                  <select
                    value={row.role}
                    onChange={e =>
                      handleResearchChange("moocsIct", index, "role", e.target.value)
                    }
                  >
                    <option value="">Role</option>
                    <option value="Course Coordinator">Course Coordinator</option>
                    <option value="Content Developer">Content Developer</option>
                    <option value="Module Writer">Module Writer</option>
                    <option value="Subject Expert">Subject Expert</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Number of Quadrants (1–4)"
                    min="1"
                    max="4"
                    value={row.creditClaimed}
                    onChange={e =>
                      handleResearchChange("moocsIct", index, "creditClaimed", e.target.value)
                    }
                  />

                  <input
                    placeholder="Year"
                    value={row.year}
                    onChange={e =>
                      handleResearchChange("moocsIct", index, "year", e.target.value)
                    }
                  />

                  <input
                    placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e =>
                      handleResearchChange("moocsIct", index, "enclosureNo", e.target.value)
                    }
                  />

                  <button
                    className="btn-remove-small"
                    onClick={() => removeResearchRow("moocsIct", index)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="btn-add"
                onClick={() =>
                  addResearchRow("moocsIct", {
                    category: "",
                    role: "",
                    creditClaimed: "",
                    year: "",
                    enclosureNo: ""
                  })
                }
              >
                + Add MOOCs / ICT Entry
              </button>
              <hr />
              <h4>7. Consultancy</h4>

              {research.consultancyPolicy.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.category}
                    onChange={e =>
                      handleResearchChange("consultancyPolicy", index, "category", e.target.value)
                    }
                  >
                    <option value="">Type</option>
                    <option value="Consultancy">Consultancy</option>
                    <option value="Policy Document">Policy Document</option>
                  </select>

                  <select
                    value={row.level}
                    onChange={e =>
                      handleResearchChange("consultancyPolicy", index, "level", e.target.value)
                    }
                  >
                    <option value="">Level</option>
                    <option value="International">International</option>
                    <option value="National">National</option>
                    <option value="State">State</option>
                  </select>

                  <input
                    placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e =>
                      handleResearchChange("consultancyPolicy", index, "enclosureNo", e.target.value)
                    }
                  />

                  <button
                    className="btn-remove-small"
                    onClick={() => removeResearchRow("consultancyPolicy", index)}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                className="btn-add"
                onClick={() =>
                  addResearchRow("consultancyPolicy", {
                    category: "",
                    level: "",
                    enclosureNo: ""
                  })
                }
              >
                + Add Consultancy / Policy Document
              </button>
              <hr />
              <h4>8. Awards / Fellowship</h4>

              {research.awards.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.level}
                    onChange={e =>
                      handleResearchChange("awards", index, "level", e.target.value)
                    }
                  >
                    <option value="">Level</option>
                    <option value="International">International</option>
                    <option value="National">National</option>
                  </select>

                  <input
                    placeholder="Award Title"
                    value={row.title}
                    onChange={e =>
                      handleResearchChange("awards", index, "title", e.target.value)
                    }
                  />

                  <input
                    placeholder="Year"
                    value={row.year}
                    onChange={e =>
                      handleResearchChange("awards", index, "year", e.target.value)
                    }
                  />

                  <input
                    placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e =>
                      handleResearchChange("awards", index, "enclosureNo", e.target.value)
                    }
                  />

                  <button
                    className="btn-remove-small"
                    onClick={() => removeResearchRow("awards", index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <hr />
              <h4>9. Invited Lectures / Resource Person</h4>

              {research.invitedTalks.map((row, index) => (
                <div className="research-card" key={index}>

                  <select
                    value={row.level}
                    onChange={e =>
                      handleResearchChange("invitedTalks", index, "level", e.target.value)
                    }
                  >
                    <option value="">Level</option>
                    <option value="International Abroad">International (Abroad)</option>
                    <option value="International India">International (India)</option>
                    <option value="National">National</option>
                    <option value="State">State / University</option>
                  </select>

                  <select
                    value={row.role}
                    onChange={e =>
                      handleResearchChange("invitedTalks", index, "role", e.target.value)
                    }
                  >
                    <option value="">Role</option>
                    <option value="Invited Lecture">Invited Lecture</option>
                    <option value="Resource Person">Resource Person</option>
                    <option value="Paper Presentation">Paper Presentation</option>
                  </select>

                  <input
                    placeholder="Year"
                    value={row.year}
                    onChange={e =>
                      handleResearchChange("invitedTalks", index, "year", e.target.value)
                    }
                  />

                  <input
                    placeholder="Enclosure No"
                    value={row.enclosureNo}
                    onChange={e =>
                      handleResearchChange("invitedTalks", index, "enclosureNo", e.target.value)
                    }
                  />

                  <button
                    className="btn-remove-small"
                    onClick={() => removeResearchRow("invitedTalks", index)}
                  >
                    ✕
                  </button>
                </div>
              ))}

            </fieldset>
            {/* ========== NAVIGATION ========== */}
            <div className="form-actions">
              <button className="btn-back" onClick={() => setCurrentStep(3)}>
                ← Back
              </button>

              <button className="btn-primary" onClick={() => setCurrentStep(5)}>
                Next →
              </button>
            </div>

          </div>
        )
      }


      {
        currentStep === 5 && (
          <div className="form-section">

            <h3>Step 5: Final Preview & Declaration</h3>

            <p className="section-note">
              Please preview both appraisal forms carefully before final submission.
            </p>

            {/* ================= PREVIEW BUTTONS ================= */}
            <div className="entry-card">

              <h4>Preview Generated Forms</h4>

              <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowSPPUPreview(true)}
                >
                  Preview Form Data
                </button>
              </div>
            </div>

            {/* ================= APPRAISAL DATA PREVIEW ================= */}
            {showSPPUPreview && (
              <div className="entry-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4>Appraisal Data Preview</h4>
                  <button
                    className="btn-back"
                    style={{ margin: 0 }}
                    onClick={() => setShowSPPUPreview(false)}
                  >
                    Close Preview
                  </button>
                </div>

                <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", maxHeight: "600px", overflowY: "auto" }}>
                  <AppraisalSummary data={{
                    generalInfo,
                    teachingActivities,
                    studentFeedback,
                    departmentalActivities,
                    instituteActivities,
                    societyActivities,
                    research,
                    acrDetails
                  }} />
                </div>
              </div>
            )}

            {/* ================= DECLARATION ================= */}

            <fieldset
              disabled={formStatus === "submitted"}
              style={{ border: "none", padding: 0 }}
            >
              <div className="declaration-row" style={{ marginTop: "20px" }}>
                <input
                  type="checkbox"
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                />
                <label>
                  I hereby declare that I have reviewed both appraisal forms and confirm
                  that the information provided is correct.
                </label>
              </div>
            </fieldset>


            {/* ================= ACTIONS ================= */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-back"
                onClick={() => setCurrentStep(4)}
              >
                ← Back
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitForm}
                disabled={formStatus === "submitted"}
              >
                {formStatus === "submitted" ? "Submitted" : "Final Submit"}
              </button>

            </div>

          </div>
        )
      }



      {/* FINAL ACTIONS */}
      <div className="form-actions">
        <div className="actions-left">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate(from)}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="actions-right">
          {formStatus !== "submitted" && currentStep < 5 && (
            <button
              type="button"
              className="btn-outline"
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
          )}




        </div>
      </div>
    </div >
  );
}
