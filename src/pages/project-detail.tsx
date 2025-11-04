import type { Project } from "@/types/project";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import { addToast } from "@heroui/toast";

import {
  CreateResourceModal,
  DeleteProjectModal,
  DeleteResourceModal,
  EditResourceModal,
  ProjectError,
  ProjectOverview,
  ResourcesSection,
} from "@/components/projects";
import { projectsService } from "@/services/projects.service";
import { resourcesService } from "@/services/resources.service";
import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingResource, setIsDeletingResource] = useState(false);
  const [error, setError] = useState("");
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isCreateResourceOpen,
    onOpen: onCreateResourceOpen,
    onClose: onCreateResourceClose,
  } = useDisclosure();
  const {
    isOpen: isEditResourceOpen,
    onOpen: onEditResourceOpen,
    onClose: onEditResourceClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteResourceOpen,
    onOpen: onDeleteResourceOpen,
    onClose: onDeleteResourceClose,
  } = useDisclosure();
  const [editingResourceId, setEditingResourceId] = useState<string | null>(
    null,
  );
  const [deletingResource, setDeletingResource] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await projectsService.getById(id);

      setProject(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load project. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      setIsDeleting(true);
      const projectName = project?.name || "Project";

      await projectsService.delete(id);

      addToast({
        title: "Project deleted successfully",
        description: `Project "${projectName}" has been deleted.`,
        color: "success",
        variant: "flat",
      });

      navigate("/projects", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project.",
      );
      onDeleteClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deletingResource) {
      return;
    }

    try {
      setIsDeletingResource(true);
      setError("");
      const resourceName = deletingResource.name;

      await resourcesService.delete(deletingResource.id);

      addToast({
        title: "Resource deleted successfully",
        description: `Resource "${resourceName}" has been deleted.`,
        color: "success",
        variant: "flat",
      });

      onDeleteResourceClose();
      setDeletingResource(null);
      // Refresh project to get updated resources list
      loadProject();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete resource. Please try again.",
      );
    } finally {
      setIsDeletingResource(false);
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="background-grid flex-grow">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading project...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !project) {
    return (
      <DefaultLayout>
        <ProjectError error={error} />
      </DefaultLayout>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="background-grid flex-grow">
        <BackgroundRippleEffect cellSize={50} />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
          {/* Back Button */}
          <Button
            className="mb-6"
            color="primary"
            size="sm"
            startContent={<ArrowLeft size={16} />}
            variant="flat"
            onPress={() => navigate("/projects")}
          >
            Back to Projects
          </Button>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Project Overview */}
          <div className="">
            <ProjectOverview project={project} onDelete={onDeleteOpen} />
          </div>

          {/* Resources Section */}
          <ResourcesSection
            project={project}
            onCreateResource={onCreateResourceOpen}
            onDelete={(resourceId, resourceName) => {
              setDeletingResource({ id: resourceId, name: resourceName });
              onDeleteResourceOpen();
            }}
            onEdit={(resourceId) => {
              setEditingResourceId(resourceId);
              onEditResourceOpen();
            }}
            onGenerateSuccess={() => {
              // Optional: Refresh project if needed after generating records
              // loadProject();
            }}
            // onViewData={(resourceName) => {
            //   // TODO: Implement view data functionality
            // }}
          />

          {/* Create Resource Modal */}
          <CreateResourceModal
            isOpen={isCreateResourceOpen}
            projectId={project.id}
            onClose={onCreateResourceClose}
            onSuccess={() => {
              // Refresh project to get updated resources list
              loadProject();
            }}
          />

          {/* Edit Resource Modal */}
          <EditResourceModal
            isOpen={isEditResourceOpen}
            resourceId={editingResourceId}
            onClose={() => {
              setEditingResourceId(null);
              onEditResourceClose();
            }}
            onSuccess={() => {
              // Refresh project to get updated resources list
              loadProject();
            }}
          />

          {/* Delete Resource Modal */}
          <DeleteResourceModal
            isDeleting={isDeletingResource}
            isOpen={isDeleteResourceOpen}
            resourceName={deletingResource?.name || ""}
            onClose={() => {
              setDeletingResource(null);
              onDeleteResourceClose();
            }}
            onConfirm={handleDeleteResource}
          />

          {/* Delete Confirmation Modal */}
          <DeleteProjectModal
            isDeleting={isDeleting}
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDelete}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
