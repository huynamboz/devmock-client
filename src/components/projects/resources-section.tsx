import type { Project } from "@/types/project";

import { useState } from "react";
import { Check, Copy, Database, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";

import { title } from "@/components/primitives";

interface ResourcesSectionProps {
  project: Project;
  onCreateResource: () => void;
  onDelete?: (resourceId: string, resourceName: string) => void;
  onEdit?: (resourceId: string) => void;
  onViewData?: (resourceName: string) => void;
}

export function ResourcesSection({
  project,
  onCreateResource,
  onDelete,
  onEdit,
  onViewData,
}: ResourcesSectionProps) {
  const [copiedResourceId, setCopiedResourceId] = useState<string | null>(null);

  const handleCopyApiUrl = async (resourceName: string) => {
    if (!resourceName) {
      return;
    }

    const apiUrl = `https://${project.id}.mockpilot.io/:${resourceName}`;

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
        <div className="space-y-3">
          {project.resources.map((resource) => {
            const resourceName = resource.name || "Unnamed Resource";
            const isCopied = copiedResourceId === resourceName;
            const apiUrl = `https://${project.id}.mockpilot.io/${resourceName}`;

            return (
              <div
                key={resource.id}
                className="bg-default-50 border border-default-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  {/* Icon & Name */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-0.5">
                        {resourceName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-default-500">
                        <p className="font-mono truncate max-md:max-w-[200px]">
                          {apiUrl}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      color="primary"
                      size="sm"
                      startContent={
                        isCopied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )
                      }
                      variant="light"
                      onPress={() => handleCopyApiUrl(resourceName)}
                    >
                      {isCopied ? "Copied" : "Copy"}
                    </Button>
                    {onViewData && (
                      <Button
                        color="default"
                        size="sm"
                        startContent={<Eye className="h-3.5 w-3.5" />}
                        variant="light"
                        onPress={() => onViewData(resourceName)}
                      >
                        View Data
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        color="default"
                        size="sm"
                        startContent={<Edit className="h-3.5 w-3.5" />}
                        variant="light"
                        onPress={() => onEdit(resource.id)}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        color="danger"
                        size="sm"
                        startContent={<Trash2 className="h-3.5 w-3.5" />}
                        variant="light"
                        onPress={() => onDelete(resource.id, resourceName)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
