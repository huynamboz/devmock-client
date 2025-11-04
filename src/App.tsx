// App.tsx
import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import ProjectDetailPage from "./pages/project-detail";
import IndexPage from "./pages";
import DocsPage from "./pages/docs";
import PricingPage from "./pages/pricing";
import BlogPage from "./pages/blog";
import AboutPage from "./pages/about";
import ProjectsPage from "./pages/projects";

import { PublicRoute } from "@/components/public-route";
import { ProtectedRoute } from "@/components/protected-route";

function App() {
  return (
    <Routes>
      {/* Protected Layout - chỉ check auth 1 lần */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<ProjectsPage />} path="/projects" />
        <Route element={<ProjectDetailPage />} path="/projects/:id" />
      </Route>

      {/* Public Layout */}
      <Route element={<PublicRoute />}>
        <Route element={<IndexPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />
      </Route>
    </Routes>
  );
}

export default App;
