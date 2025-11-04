import { useMemo } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";
import { STORAGE_KEYS } from "@/config/api";

/**
 * PublicRoute component - For auth pages (login, register, landing page)
 * Best practices:
 * 1. If user is already authenticated, redirects to intended destination or home
 * 2. Does not call /me endpoint to avoid unnecessary API calls
 * 3. Only checks token existence and isAuthenticated state
 */
export function PublicRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  // Check if token exists (avoid direct localStorage access in render)
  const hasToken = useMemo(() => {
    return !!user || !!localStorage.getItem(STORAGE_KEYS.accessToken);
  }, [user]);

  // If user is already authenticated, redirect to intended destination or home
  // Only check token existence and isAuthenticated state, don't call /me
  if (hasToken && isAuthenticated) {
    const from =
      (location.state as { from?: Location })?.from?.pathname || "/projects";

    return <Navigate replace to={from} />;
  }

  // Render public content
  return <Outlet />;
}
