import { Navigate, Outlet, useLocation } from "react-router-dom";
import { tokenStore } from "@/lib/axios";

export function RequireAuth() {
  const location = useLocation();
  const token = tokenStore.get();

  if (!token) {
    // Redirect to sign-in and preserve the attempted location
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
