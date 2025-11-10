import { useEffect, useMemo } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { STORAGE_KEYS } from "@/config/api";

/**
 * AdminRoute component - Protects routes that require ADMIN role
 * Best practices:
 * 1. Check auth on mount and when dependencies change
 * 2. Show loading state during auth check
 * 3. Redirect to login if not authenticated
 * 4. Redirect to home if authenticated but not admin
 * 5. Use Navigate component instead of navigate() for declarative redirects
 * 6. Only check auth if token exists to avoid unnecessary API calls
 * 7. Proper dependency array to prevent infinite loops
 */
export function AdminRoute() {
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

  // If authenticated but not admin, redirect to home
  if (user?.role !== "ADMIN") {
    return <Navigate replace to="/projects" />;
  }

  // User is authenticated and is admin, render admin content
  return <Outlet />;
}

