import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated, checkAuth, user } = useAuthStore();
  const hasToken = !!user || !!localStorage.getItem("access_token");

  useEffect(() => {
    if (hasToken && !isAuthenticated) {
      checkAuth();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
