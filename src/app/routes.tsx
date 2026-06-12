import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { HODDashboard } from "./pages/HODDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StudentPerformanceDetails } from "./pages/StudentPerformanceDetails";
import { AssignmentSubmissionsPage } from "./pages/AssignmentSubmissionsPage";
import { AssignmentGradingPage } from "./pages/AssignmentGradingPage";
import { AssignmentEditPage } from "./pages/AssignmentEditPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={["hod"]}>
            <HODDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/student/:id"
        element={
          <ProtectedRoute allowedRoles={["hod"]}>
            <StudentPerformanceDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/assignments/:id/view"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AssignmentSubmissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/assignments/:id/grade"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AssignmentGradingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff/assignments/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["staff"]}>
            <AssignmentEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}