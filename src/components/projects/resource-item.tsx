import type { Resource } from "@/types/project";

import { useState } from "react";
import { Check, Copy, Database, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Slider } from "@heroui/slider";
import { addToast } from "@heroui/toast";

import { recordsService } from "@/services/records.service";

interface ResourceItemProps {
  isCopied: boolean;
  projectId: string;
  resource: Resource;
  sliderValue?: number;
  onCopy: (resourceName: string) => void;
  onDelete?: (resourceId: string, resourceName: string) => void;
  onEdit?: (resourceId: string) => void;
  onGenerateSuccess?: () => void;
  onSliderValueChange?: (resourceName: string, value: number) => void;
  onViewData?: (resourceName: string) => void;
}

export function ResourceItem({
  isCopied,
  projectId,
  resource,
  sliderValue,
  onCopy,
  onDelete,
  onEdit,
  onGenerateSuccess,
  onSliderValueChange,
  onViewData,
}: ResourceItemProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const resourceName = resource.name;
  const apiUrl = `https://${projectId}.mockpilot.io/${resourceName}`;
  const recordCount = resource.recordCount || 0;

  const handleGenerateRecords = async (count: number) => {
    if (count === 0) {
      return;
    }

    const maxGenerate = Math.min(100 - recordCount, count);

    if (maxGenerate <= 0) {
      addToast({
        title: "Cannot generate records",
        description: `Resource already has ${recordCount}/100 records. Maximum reached.`,
        color: "warning",
        variant: "flat",
      });

      return;
    }

    try {
      const response = await recordsService.generateRecords(
        projectId,
        resourceName,
        { count: maxGenerate },
      );

      addToast({
        title: "Records generated successfully",
        description: `Generated ${response.generated} record(s). Total: ${response.total}/100 records.`,
        color: "success",
        variant: "flat",
      });

      // Update slider value after successful generation
      onSliderValueChange?.(resourceName, response.total);

      onGenerateSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate records.";

      addToast({
        title: "Failed to generate records",
        description: errorMessage,
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleSliderChange = (value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : (value as number);

    onSliderValueChange?.(resourceName, newValue);
  };

  const handleSliderChangeEnd = (value: number | number[]) => {
    const targetCount = Array.isArray(value) ? value[0] : (value as number);

    if (targetCount !== recordCount) {
      if (targetCount > recordCount) {
        // Generate more records
        const generateCount = targetCount - recordCount;

        handleGenerateRecords(generateCount);
      } else {
        // Note: Currently no API to delete multiple records
        // So we can only generate, not reduce
        // Reset to current count
        onSliderValueChange?.(resourceName, recordCount);

        addToast({
          title: "Cannot reduce records",
          description: "Please use 'View Data' to delete individual records.",
          color: "warning",
          variant: "flat",
        });
      }
    }
  };

  return (
    <div className="bg-default-50 border border-default-200 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col gap-3">
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
              <div className="flex items-center gap-3 text-xs text-default-500">
                <p className="font-mono truncate max-md:max-w-[200px]">
                  {apiUrl}
                </p>
                <span className="text-default-600 font-medium">
                  {recordCount} records
                </span>
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
              onPress={() => onCopy(resourceName)}
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

        {/* Records Slider */}
        <div className="flex items-center gap-3 pt-2 border-t border-default-200">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-default-600">Records count</span>
              <span className="text-xs text-default-500">
                {recordCount} / 100
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Slider
                className="flex-1"
                color="success"
                isDisabled={isGenerating}
                maxValue={100}
                minValue={0}
                size="sm"
                step={1}
                value={sliderValue !== undefined ? sliderValue : recordCount}
                onChange={handleSliderChange}
                onChangeEnd={handleSliderChangeEnd}
              />
              <span className="text-xs text-default-600 min-w-[50px] text-right">
                {sliderValue !== undefined ? sliderValue : recordCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

