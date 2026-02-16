import { useState } from "react";
import { ListPlus, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";

import { speakingService } from "@/services/speaking.service";

interface ParsedItem {
  textOriginal: string;
  explanation: string;
}

interface BulkAddItemsModalProps {
  isOpen: boolean;
  lessonId: string;
  startOrderIndex: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PLACEHOLDER = `Xin chào, tôi là Nam.
Say your name in Vietnamese
---
Bạn khỏe không?
Ask how someone is doing
---
Tôi khỏe, cảm ơn.
Respond that you are fine`;

function parseItems(raw: string): ParsedItem[] {
  const blocks = raw
    .split("---")
    .map((b) => b.trim())
    .filter(Boolean);
  const items: ParsedItem[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length >= 1) {
      items.push({
        textOriginal: lines[0],
        explanation: lines.slice(1).join(" "),
      });
    }
  }

  return items;
}

export function BulkAddItemsModal({
  isOpen,
  lessonId,
  startOrderIndex,
  onClose,
  onSuccess,
}: BulkAddItemsModalProps) {
  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = () => {
    setError("");
    const items = parseItems(rawText);

    if (items.length === 0) {
      setError("No items found. Please check the format.");

      return;
    }

    setParsedItems(items);
  };

  const handleRemoveItem = (index: number) => {
    if (!parsedItems) return;
    const next = parsedItems.filter((_, i) => i !== index);

    if (next.length === 0) {
      setParsedItems(null);
    } else {
      setParsedItems(next);
    }
  };

  const handleCreate = async () => {
    if (!parsedItems || parsedItems.length === 0) return;

    try {
      setIsSubmitting(true);
      setError("");

      await speakingService.bulkCreateItems({
        lessonId,
        items: parsedItems.map((item, i) => ({
          textOriginal: item.textOriginal,
          explanation: item.explanation || undefined,
          orderIndex: startOrderIndex + i,
        })),
      });

      addToast({
        title: "Items created",
        description: `${parsedItems.length} speaking items have been created.`,
        color: "success",
        variant: "flat",
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRawText("");
    setParsedItems(null);
    setError("");
    onClose();
  };

  const handleBack = () => {
    setParsedItems(null);
    setError("");
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Add Multiple Items</h2>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {error && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400">
              {error}
            </div>
          )}

          {!parsedItems ? (
            <Textarea
              label="Paste items"
              maxRows={20}
              minRows={8}
              placeholder={PLACEHOLDER}
              value={rawText}
              variant="bordered"
              onValueChange={(v) => {
                setRawText(v);
                setError("");
              }}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-default-500">
                {parsedItems.length} item{parsedItems.length !== 1 && "s"}{" "}
                parsed. Review before creating.
              </p>
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {parsedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg border border-default-200 bg-default-50 p-3 dark:bg-default-100/50"
                  >
                    <span className="mt-0.5 text-xs font-bold text-default-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.textOriginal}
                      </p>
                      {item.explanation && (
                        <p className="mt-0.5 text-xs text-default-500">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                    <Button
                      isIconOnly
                      aria-label="Remove"
                      radius="full"
                      size="sm"
                      variant="light"
                      onPress={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-danger" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {!parsedItems ? (
            <>
              <Button variant="light" onPress={handleClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!rawText.trim()}
                onPress={handleProcess}
              >
                Process
              </Button>
            </>
          ) : (
            <>
              <Button variant="light" onPress={handleBack}>
                Back
              </Button>
              <Button
                color="primary"
                isLoading={isSubmitting}
                onPress={handleCreate}
              >
                Create {parsedItems.length} item
                {parsedItems.length !== 1 && "s"}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
