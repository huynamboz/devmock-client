import { Navigate, useLocation, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

/**
 * PublicRoute component - For auth pages (login, register)
 * If user is already authenticated, redirects to home page
 * Does not call /me endpoint to avoid unnecessary API calls
 */
export function PublicRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasToken = useAuthStore(
    (state) => !!state.user || !!localStorage.getItem("access_token"),
  );

  // If user is already authenticated, redirect to home
  // Only check token existence, don't call /me for auth pages
  if (hasToken && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/";

    return <Navigate to={from} replace />;
  }

  // Render public content
  return <Outlet />;
}

