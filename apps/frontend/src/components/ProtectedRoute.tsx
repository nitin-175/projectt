import type { AppRole } from "@show-booking/types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSessionStore } from "../store/sessionStore";

type ProtectedRouteProps = {
  roles?: AppRole[];
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { token, roles: sessionRoles } = useSessionStore();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.some((role) => sessionRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
