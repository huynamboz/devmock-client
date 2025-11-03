import type { Project } from "@/types/project";

import { Clock, Code2, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";

import { title } from "@/components/primitives";

interface ProjectOverviewProps {
  project: Project;
  onDelete: () => void;
}

function formatCompactDate(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProjectOverview({ project, onDelete }: ProjectOverviewProps) {
  return (
    <div className="bg-content1 border border-default-200 rounded-3xl p-6 md:p-8">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="rounded-lg bg-primary/10 p-3 flex-shrink-0">
            <Code2 className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={title({ size: "sm" })}>{project.name}</h1>
            <p className="text-default-600 mt-1 text-sm">
              ID: <code className="text-xs font-mono">{project.id}</code>
            </p>
          </div>
        </div>
        <Button
          color="danger"
          size="md"
          startContent={<Trash2 size={16} />}
          variant="flat"
          onPress={onDelete}
        >
          Delete
        </Button>
      </div>

      {/* Divider */}
      <div className="h-px bg-default-200 mb-6" />

      {/* Info Section */}
      <div className="flex flex-col gap-4">
        {/* Timeline */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-default-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-default-500 flex-shrink-0" />
            <span className="font-medium">Created:</span>
            <span className="text-default-500">
              {formatCompactDate(project.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-default-500 flex-shrink-0" />
            <span className="font-medium">Updated:</span>
            <span className="text-default-500">
              {formatCompactDate(project.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
