import type { Project } from "@/types/project";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";

import { projectsService } from "@/services/projects.service";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError("Project name is required");

      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const newProject = await projectsService.create({
        name: projectName.trim(),
      });

      setProjectName("");
      onSuccess(newProject);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create project.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Create New Project</h2>
          <p className="text-sm text-default-600 font-normal">
            Give your project a name to get started
          </p>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <Input
            label="Project Name"
            placeholder="e.g., E-commerce API, User Management API"
            size="lg"
            value={projectName}
            variant="bordered"
            onChange={(e) => {
              setProjectName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isCreating) {
                handleCreate();
              }
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isCreating} onPress={handleCreate}>
            Create Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
