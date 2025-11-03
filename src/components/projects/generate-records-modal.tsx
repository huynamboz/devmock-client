import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { recordsService } from "@/services/records.service";

interface GenerateRecordsModalProps {
  isOpen: boolean;
  projectId: string;
  resourceName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GenerateRecordsModal({
  isOpen,
  projectId,
  resourceName,
  onClose,
  onSuccess,
}: GenerateRecordsModalProps) {
  const [count, setCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const MAX_RECORDS = 100;
  const MIN_COUNT = 1;
  const MAX_COUNT = MAX_RECORDS;

  const handleGenerate = async () => {
    // Validate count
    if (!count || count < MIN_COUNT) {
      setError(`Count must be at least ${MIN_COUNT}`);

      return;
    }

    if (count > MAX_COUNT) {
      setError(`Count cannot exceed ${MAX_COUNT} (max records limit)`);

      return;
    }

    if (!Number.isInteger(count)) {
      setError("Count must be a whole number");

      return;
    }

    try {
      setIsGenerating(true);
      setError("");

      const response = await recordsService.generateRecords(
        projectId,
        resourceName,
        {
          count,
        },
      );

      addToast({
        title: "Records generated successfully",
        description: `Generated ${response.generated} record(s). Total: ${response.total}/${MAX_RECORDS} records.`,
        color: "success",
        variant: "flat",
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate records.";

      setError(errorMessage);

      // Show toast for errors
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

  const handleClose = () => {
    setCount(5);
    setError("");
    onClose();
  };

  const handleCountChange = (value: string) => {
    const numValue = Number.parseInt(value, 10);

    if (Number.isNaN(numValue) || value === "") {
      setCount(0);
      setError("");
    } else {
      setCount(numValue);
      setError("");

      // Validate immediately
      if (numValue < MIN_COUNT) {
        setError(`Count must be at least ${MIN_COUNT}`);
      } else if (numValue > MAX_COUNT) {
        setError(`Count cannot exceed ${MAX_COUNT} (max records limit)`);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Generate Mock Records</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            Generate fake data records for &quot;{resourceName}&quot; resource
            using Faker.js
          </p>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Input
                description={`Enter number of records to generate (${MIN_COUNT}-${MAX_COUNT}). Maximum ${MAX_RECORDS} records per resource.`}
                label="Number of Records"
                placeholder="e.g., 5, 10, 20"
                size="lg"
                type="number"
                value={count.toString()}
                variant="bordered"
                onChange={(e) => handleCountChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating) {
                    handleGenerate();
                  }
                }}
              />
            </div>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-default-700">
                <strong>Note:</strong> This will use your resource&apos;s fields
                (Schema Mode) or JSON template (Template Mode) to generate
                realistic mock data. Each resource can have a maximum of{" "}
                {MAX_RECORDS} records.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isLoading={isGenerating}
            startContent={!isGenerating ? <Sparkles size={16} /> : undefined}
            onPress={handleGenerate}
          >
            Generate Records
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

