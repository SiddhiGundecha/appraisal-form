import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// FACULTY
import FacultyDashboard from "../pages/faculty/Dashboard";
import FacultyProfile from "../pages/faculty/Profile";
import AppraisalForm from "../pages/faculty/AppraisalForm";

// HOD
import HODDashboard from "../pages/HODDashboard";

// PRINCIPAL
import PrincipalDashboard from "../pages/PrincipalDashboard";
import FacultyAppraisalStatus from "../pages/faculty/FacultyAppraisalStatus";


import CreateAccount from "../pages/CreateAccount";


<Route
  path="/faculty/appraisal/status"
  element={<FacultyAppraisalStatus />}
/>

export default function AppRouter() {
  return (
    <Routes>
      {/* DEFAULT */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* FACULTY ROUTES */}
      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/faculty/profile" element={<FacultyProfile />} />
      <Route path="/faculty/appraisal" element={<AppraisalForm />} />

      {/* HOD ROUTES */}
      <Route path="/hod/dashboard" element={<HODDashboard />} />

      {/* PRINCIPAL ROUTES */}
      <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
   <Route
  path="/faculty/appraisal/status"
  element={<FacultyAppraisalStatus />}
/>
<Route path="/create-account" element={<CreateAccount />} />

<Route path="/hod/appraisal-form" element={<AppraisalForm />} />



    </Routes>
  );
}
