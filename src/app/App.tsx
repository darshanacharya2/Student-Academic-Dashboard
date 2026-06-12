/**
 * Academic Management Portal
 * 
 * A comprehensive multi-college academic management system with role-based access control.
 * 
 * FEATURES:
 * - Multi-college support with data isolation
 * - Role-based dashboards (Super Admin, HOD, Staff, Student)
 * - Attendance tracking with shortage alerts
 * - Internal Assessment (IA) marks management
 * - Assignment submission and grading
 * - Achievement portfolio tracking
 * - Real-time analytics and reporting
 * 
 * ARCHITECTURE:
 * - Frontend: React with TypeScript
 * - Routing: React Router v6
 * - State: React Context API
 * - UI: Shadcn/ui components with Tailwind CSS
 * - Charts: Recharts
 * - Data: Mock data with localStorage persistence (ready for backend integration)
 * 
 * DEMO CREDENTIALS:
 * - Super Admin: admin@system.com / password
 * - HOD: hod@college1.com / password
 * - Staff: staff@college1.com / password
 * - Student: student@college1.com / password
 */

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SharedDataProvider } from "./context/SharedDataContext";
import { AppRoutes } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SharedDataProvider>
          <AppRoutes />
          <Toaster />
        </SharedDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}