// App.tsx
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ProjectDetailPage from "./pages/project-detail";
import IndexPage from "./pages";
import DocsPage from "./pages/docs";
import PricingPage from "./pages/pricing";
import BlogPage from "./pages/blog";
import AboutPage from "./pages/about";
import ProjectsPage from "./pages/projects";
import WebhooksPage from "./pages/webhooks";
import WebhookDetailPage from "./pages/webhook-detail";
import AdminSpeakingTopicsPage from "./pages/admin/speaking/topics";
import AdminSpeakingTopicDetailPage from "./pages/admin/speaking/topic-detail";
import AdminSpeakingLessonDetailPage from "./pages/admin/speaking/lesson-detail";
import AdminDevelopmentPage from "./pages/admin/development";

import { PublicRoute } from "@/components/public-route";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminRoute } from "@/components/admin-route";

function App() {
  return (
    <Routes>
      {/* Admin Routes - requires ADMIN role */}
      <Route element={<AdminRoute />} path="/admin">
        <Route index element={<Navigate replace to="/admin/speaking" />} />
        <Route element={<AdminSpeakingTopicsPage />} path="speaking" />
        <Route
          element={<AdminSpeakingTopicDetailPage />}
          path="speaking/topics/:id"
        />
        <Route
          element={<AdminSpeakingLessonDetailPage />}
          path="speaking/lessons/:id"
        />
        <Route element={<AdminDevelopmentPage />} path="dev" />
      </Route>

      {/* Protected Layout - chỉ check auth 1 lần */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<ProjectsPage />} path="/projects" />
        <Route element={<ProjectDetailPage />} path="/projects/:id" />
        <Route element={<WebhooksPage />} path="/webhooks" />
        <Route element={<WebhookDetailPage />} path="/webhooks/:id" />
      </Route>

      {/* Public Layout */}
      <Route element={<PublicRoute />}>
        <Route element={<IndexPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
      </Route>
      <Route element={<PricingPage />} path="/pricing" />
    </Routes>
  );
}

export default App;
