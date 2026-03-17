import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
}

const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { user } = useAuth();
  const userRoles = user?.roles || ["User"];

  if (!roles.some((r) => userRoles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
