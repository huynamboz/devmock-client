import type { Resource } from "@/types/project";

import { useState } from "react";
import {
  Check,
  Copy,
  Database,
  Edit,
  Eye,
  Settings,
  Trash2,
} from "lucide-react";
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
  onSettings?: (resourceId: string) => void;
  onGenerateSuccess?: () => void;
  onSliderValueChange?: (resourceName: string, value: number) => void;
  onViewData?: (resourceName: string) => void;
}

export function ResourceItem({
  isCopied,
  projectId,
  resource,
  onCopy,
  onDelete,
  onEdit,
  onSettings,
  onGenerateSuccess,
  onViewData,
}: ResourceItemProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [localSliderValue, setLocalSliderValue] = useState<number | undefined>(
    resource.recordCount,
  );
  const resourceName = resource.name;
  const apiUrl = `${import.meta.env.VITE_API_BASE_MOCK_URL}/${projectId}/`;
  const recordCount = resource.recordCount || 0;

  const handleGenerateRecords = async (count: number) => {
    setIsGenerating(true);

    const maxGenerate = Math.min(100 - recordCount, count);

    if (maxGenerate <= 0 && count > 0) {
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderChange = (value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : (value as number);

    setLocalSliderValue(newValue);
  };

  const handleSliderChangeEnd = (value: number | number[]) => {
    handleGenerateRecords(value as number);
  };

  return (
    <div className="bg-content1  border border-primary/20 rounded-2xl p-4 hover:border-primary hover:shadow-sm transition-all duration-200">
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
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                    {resourceName}
                  </span>
                </p>
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
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
            {onSettings && (
              <Button
                color="default"
                size="sm"
                startContent={<Settings className="h-3.5 w-3.5" />}
                variant="light"
                onPress={() => onSettings(resource.id)}
              >
                Settings
              </Button>
            )}
            {onDelete && (
              <Button
                isIconOnly
                color="danger"
                size="sm"
                startContent={<Trash2 className="h-3.5 w-3.5" />}
                variant="light"
                onPress={() => onDelete(resource.id, resourceName)}
              />
            )}
          </div>
        </div>

        {/* Records Slider */}
        <div className="flex items-center gap-3 pt-2 border-t border-default-200">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-default-600">Data generation</span>
            </div>
            <div className="flex items-end gap-2">
              <Slider
                className="max-w-[200px]"
                color="success"
                isDisabled={isGenerating}
                maxValue={100}
                minValue={0}
                size="sm"
                step={1}
                value={
                  localSliderValue !== undefined
                    ? localSliderValue
                    : recordCount
                }
                onChange={handleSliderChange}
                onChangeEnd={handleSliderChangeEnd}
              />
              <span className="text-xs text-default-600 min-w-[50px] text-right">
                {localSliderValue !== undefined
                  ? localSliderValue
                  : recordCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
