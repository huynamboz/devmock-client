import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * PublicRoute component - For auth pages (login, register)
 * If user is already authenticated, redirects to home page
 * Does not call /me endpoint to avoid unnecessary API calls
 */
export function PublicRoute({
  children,
  redirectTo = "/",
}: PublicRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasToken = useAuthStore(
    (state) => !!state.user || !!localStorage.getItem("access_token"),
  );

  // If user is already authenticated, redirect to home
  // Only check token existence, don't call /me for auth pages
  if (hasToken && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;

    return <Navigate to={from} replace />;
  }

  // Render public content
  return <>{children}</>;
}

