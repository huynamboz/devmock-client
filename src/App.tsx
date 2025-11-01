import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/protected-route";
import { PublicRoute } from "@/components/public-route";
import AboutPage from "@/pages/about";
import BlogPage from "@/pages/blog";
import DocsPage from "@/pages/docs";
import IndexPage from "@/pages/index";
import LoginPage from "@/pages/login";
import PricingPage from "@/pages/pricing";
import RegisterPage from "@/pages/register";

function App() {
  return (
    <Routes>
      {/* Protected Routes - Require Authentication */}
      <Route
        element={
          <ProtectedRoute>
            <IndexPage />
          </ProtectedRoute>
        }
        path="/"
      />
      <Route
        element={
          <ProtectedRoute>
            <DocsPage />
          </ProtectedRoute>
        }
        path="/docs"
      />
      <Route
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
        path="/pricing"
      />
      <Route
        element={
          <ProtectedRoute>
            <BlogPage />
          </ProtectedRoute>
        }
        path="/blog"
      />
      <Route
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
        path="/about"
      />

      {/* Public Routes - Auth pages (no /me call) */}
      <Route
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
        path="/login"
      />
      <Route
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
        path="/register"
      />
    </Routes>
  );
}

export default App;
