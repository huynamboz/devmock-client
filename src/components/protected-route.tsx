import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component - Requires authentication
 * If user is not authenticated, redirects to login page
 * Calls /me endpoint to verify authentication status
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasToken = useAuthStore(
    (state) => !!state.user || !!localStorage.getItem("access_token"),
  );

  useEffect(() => {
    // Only check auth if we have a token and haven't checked yet
    if (hasToken && !isAuthenticated) {
      checkAuth();
    }
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-default-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  // Render protected content
  return <>{children}</>;
}
