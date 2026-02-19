import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

import FacultyDashboard from "../pages/faculty/Dashboard";
import FacultyProfile from "../pages/faculty/Profile";
import AppraisalForm from "../pages/faculty/AppraisalForm";
import FacultyAppraisalStatus from "../pages/faculty/FacultyAppraisalStatus";

import HODDashboard from "../pages/HODDashboard";

import PrincipalDashboard from "../pages/PrincipalDashboard";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/faculty/profile" element={<FacultyProfile />} />
      <Route path="/faculty/appraisal" element={<AppraisalForm />} />
      <Route path="/faculty/appraisal/status" element={<FacultyAppraisalStatus />} />

      <Route path="/hod/dashboard" element={<HODDashboard />} />
      <Route path="/hod/appraisal-form" element={<AppraisalForm />} />

      <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
    </Routes>
  );
}
