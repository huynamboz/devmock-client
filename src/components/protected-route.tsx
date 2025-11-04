import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { STORAGE_KEYS } from "@/config/api";

/**
 * ProtectedRoute component - Protects routes that require authentication
 * Best practices:
 * 1. Check auth on mount and when dependencies change
 * 2. Show loading state during auth check
 * 3. Redirect to login if not authenticated, preserving intended destination
 * 4. Use Navigate component instead of navigate() for declarative redirects
 * 5. Only check auth if token exists to avoid unnecessary API calls
 * 6. Proper dependency array to prevent infinite loops
 */
export function ProtectedRoute() {
  const location = useLocation();
  const { isLoading, isAuthenticated, checkAuth, user, setLoading } =
    useAuthStore();

  // Check if token exists in localStorage (avoid direct localStorage access in render)
  const hasToken = useMemo(() => {
    return !!user || !!localStorage.getItem(STORAGE_KEYS.accessToken);
  }, [user]);

  // Check authentication on mount and when token state changes
  useEffect(() => {
    // If no token and still loading, set loading to false
    // This prevents infinite loading state when there's no token
    if (!hasToken && isLoading) {
      setLoading(false);

      return;
    }

    // Only check auth if token exists and user is not authenticated
    // This prevents unnecessary API calls
    if (hasToken && !isAuthenticated) {
      checkAuth().catch((error) => {
        // Error is already handled in checkAuth
        // eslint-disable-next-line no-console
        console.error("Auth check failed:", error);
      });
    }
  }, [hasToken, isAuthenticated, isLoading, checkAuth, setLoading]);

  // Show loading state during initial auth check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-default-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no token or not authenticated, redirect to login
  // Preserve the intended destination in location state for redirect after login
  if (!hasToken || !isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  // User is authenticated, render protected content
  return <Outlet />;
}
