import { Navigate } from "react-router";
import { useAuth, UserRole } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    const roleRoutes: Record<UserRole, string> = {
      super_admin: "/super-admin",
      hod: "/hod",
      staff: "/staff",
      student: "/student",
    };
    
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}
