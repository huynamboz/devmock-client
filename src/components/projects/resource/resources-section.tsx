import type { Project } from "@/types/project";

import { useState } from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";

import { ResourceItem } from "./resource-item";
import { ResourceSettingsModal } from "./resource-settings-modal";
import { ViewDataModal } from "./view-data-modal";

import { title } from "@/components/primitives";

interface ResourcesSectionProps {
  project: Project;
  onCreateResource: () => void;
  onDelete?: (resourceId: string, resourceName: string) => void;
  onEdit?: (resourceId: string) => void;
  onSettings?: (resourceId: string) => void;
  onViewData?: (resourceName: string) => void;
  onGenerateSuccess?: () => void;
}

export function ResourcesSection({
  project,
  onCreateResource,
  onDelete,
  onEdit,
  onSettings,
  onViewData,
  onGenerateSuccess,
}: ResourcesSectionProps) {
  const [copiedResourceId, setCopiedResourceId] = useState<string | null>(null);
  const [viewingResourceName, setViewingResourceName] = useState<string | null>(
    null,
  );
  const [settingsResourceId, setSettingsResourceId] = useState<string | null>(
    null,
  );
  const [settingsResourceName, setSettingsResourceName] = useState<
    string | undefined
  >(undefined);
  const {
    isOpen: isViewDataOpen,
    onOpen: onViewDataOpen,
    onClose: onViewDataClose,
  } = useDisclosure();
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();

  const handleCopyApiUrl = async (resourceName: string) => {
    if (!resourceName) {
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_MOCK_URL}/pilot/${project.id}/${resourceName}`;

    try {
      await navigator.clipboard.writeText(apiUrl);
      setCopiedResourceId(resourceName);

      setTimeout(() => {
        setCopiedResourceId(null);
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={title({ size: "md" })}>Resources</h2>
          <p className="text-default-600 mt-2 text-sm">
            Manage your API resources for this project
          </p>
        </div>
        <Button
          color="primary"
          size="lg"
          startContent={<Plus size={20} />}
          variant="flat"
          onPress={onCreateResource}
        >
          New Resource
        </Button>
      </div>

      {!project.resources || project.resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center py-12">
          <div className="rounded-full bg-default-100 p-6 mb-4">
            <Database className="h-12 w-12 text-default-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
          <p className="text-default-600 mb-6 max-w-md text-sm">
            Create your first resource to start building mock APIs for this
            project.
          </p>
          <Button
            color="primary"
            size="lg"
            startContent={<Plus size={20} />}
            onPress={onCreateResource}
          >
            Create Your First Resource
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {project.resources.map((resource) => (
            <ResourceItem
              key={resource.id}
              isCopied={copiedResourceId === resource.name}
              projectId={project.id}
              resource={resource}
              onCopy={handleCopyApiUrl}
              onDelete={onDelete}
              onEdit={onEdit}
              onGenerateSuccess={onGenerateSuccess}
              onSettings={(resourceId) => {
                const resource = project.resources?.find(
                  (r) => r.id === resourceId,
                );

                setSettingsResourceId(resourceId);
                setSettingsResourceName(resource?.name);
                onSettingsOpen();
                onSettings?.(resourceId);
              }}
              onViewData={(resourceName) => {
                setViewingResourceName(resourceName);
                onViewDataOpen();
                onViewData?.(resourceName);
              }}
            />
          ))}
        </div>
      )}

      {/* View Data Modal */}
      {viewingResourceName && (
        <ViewDataModal
          isOpen={isViewDataOpen}
          projectId={project.id}
          resourceName={viewingResourceName}
          onClose={() => {
            setViewingResourceName(null);
            onViewDataClose();
          }}
        />
      )}

      {/* Resource Settings Modal */}
      <ResourceSettingsModal
        isOpen={isSettingsOpen}
        projectId={project.id}
        resourceId={settingsResourceId}
        resourceName={settingsResourceName}
        onClose={() => {
          setSettingsResourceId(null);
          setSettingsResourceName(undefined);
          onSettingsClose();
        }}
        onSuccess={() => {
          // Optional: Refresh project if needed after updating settings
          // This could trigger a reload of the project data
        }}
      />
    </div>
  );
}
