import type { Project } from "@/types/project";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Code2,
  Clock,
} from "lucide-react";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { title } from "@/components/primitives";
import { CreateProjectModal } from "@/components/projects";
import { projectsService } from "@/services/projects.service";
import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

function formatDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsService.getAll();

      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setIsDeleting(id);
      const project = projects.find((p) => p.id === id);

      await projectsService.delete(id);
      setProjects(projects.filter((p) => p.id !== id));

      addToast({
        title: "Project deleted successfully",
        description: project
          ? `Project "${project.name}" has been deleted.`
          : "Project has been deleted.",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-default-600">Loading projects...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="background-grid flex-grow">
        <BackgroundRippleEffect cellSize={50} />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={title({ size: "md" })}>My Projects</h1>
              <p className="text-default-600 mt-2">
                Create and manage your mock API projects
              </p>
            </div>
            <Button
              color="primary"
              size="lg"
              startContent={<Plus size={20} />}
              onPress={onOpen}
            >
              New Project
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="rounded-full bg-default-100 p-6 mb-4">
                <Folder className="h-12 w-12 text-default-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
              <p className="text-default-600 mb-6 max-w-md">
                Create your first project to start building mock APIs. It only
                takes a few seconds!
              </p>
              <Button
                color="primary"
                size="lg"
                startContent={<Plus size={20} />}
                onPress={onOpen}
              >
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative bg-content1 border border-default-200 rounded-3xl p-6 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/projects/${project.id}`);
                    }
                  }}
                >
                  {/* Project Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Code2 className="h-6 w-6 text-primary" />
                    </div>
                    <Button
                      isIconOnly
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => {
                        handleDeleteProject(project.id);
                      }}
                    >
                      {isDeleting === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Project Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-default-500">
                      <Clock className="h-4 w-4" />
                      <span>Created {formatDate(project.createdAt)}</span>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-default-100">
                    <div className="flex items-center gap-1 text-sm text-default-600">
                      <Folder className="h-4 w-4" />
                      <span>
                        {project.resourceCount || 0} resource
                        {(project.resources?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ExternalLink className="h-4 w-4 text-default-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Project Modal */}
          <CreateProjectModal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleCreateSuccess}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
