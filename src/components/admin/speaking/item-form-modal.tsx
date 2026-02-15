import type {
  CreateItemRequest,
  SpeakingItem,
} from "@/services/speaking.service";

import { useEffect, useState } from "react";
import { MessageSquare, Globe } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";

import { speakingService } from "@/services/speaking.service";
import { TranslationDialog } from "@/components/admin/translation-dialog";

interface ItemFormModalProps {
  isOpen: boolean;
  item: SpeakingItem | null;
  lessonId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ItemFormModal({
  isOpen,
  item,
  lessonId,
  onClose,
  onSuccess,
}: ItemFormModalProps) {
  const isEdit = !!item;
  const [textOriginal, setTextOriginal] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [ipa, setIpa] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Translation dialog state
  const [translationField, setTranslationField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTextOriginal(item?.textOriginal ?? "");
      setAudioUrl(item?.audioUrl ?? "");
      setIpa(item?.ipa ?? "");
      setOrderIndex(item?.orderIndex ?? 0);
      setError("");
    }
  }, [isOpen, item]);

  const handleSubmit = async () => {
    if (!textOriginal.trim()) {
      setError("Original text is required");

      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const body: CreateItemRequest = {
        lessonId: isEdit && item ? item.lessonId : lessonId,
        textOriginal: textOriginal.trim(),
        audioUrl: audioUrl.trim() || null,
        ipa: ipa.trim() || null,
        orderIndex,
      };

      if (isEdit && item) {
        await speakingService.updateItem(item.id, body);
        addToast({
          title: "Item updated",
          description: "Speaking item has been updated.",
          color: "success",
          variant: "flat",
        });
      } else {
        await speakingService.createItem(body);
        addToast({
          title: "Item created",
          description: "Speaking item has been created.",
          color: "success",
          variant: "flat",
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setTranslationField(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {isEdit ? "Edit Item" : "Create Item"}
            </h2>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {error && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400">
              {error}
            </div>
          )}
          <div>
            <Textarea
              label="Original text"
              placeholder="e.g. Xin chào, tôi là Nam."
              value={textOriginal}
              variant="bordered"
              onValueChange={(v) => {
                setTextOriginal(v);
                setError("");
              }}
            />
            {isEdit && item && (
              <button
                className="mt-1.5 flex items-center gap-1 text-xs text-primary hover:underline"
                type="button"
                onClick={() => setTranslationField("textOriginal")}
              >
                <Globe className="h-3 w-3" />
                Translations
              </button>
            )}
          </div>
          <Input
            label="IPA"
            placeholder="e.g. sin tʃaʊ, toj la nam"
            value={ipa}
            variant="bordered"
            onValueChange={(v) => setIpa(v)}
          />
          <Input
            label="Audio URL"
            placeholder="https://..."
            value={audioUrl}
            variant="bordered"
            onValueChange={(v) => setAudioUrl(v)}
          />
          <Input
            label="Order index"
            type="number"
            value={String(orderIndex)}
            variant="bordered"
            onValueChange={(v) => setOrderIndex(parseInt(v, 10) || 0)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            {isEdit ? "Save" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
      {isEdit && item && (
        <TranslationDialog
          entityId={item.id}
          entityType="item"
          field={translationField ?? ""}
          isOpen={!!translationField}
          multiline={translationField === "textOriginal"}
          text={translationField === "textOriginal" ? textOriginal : ""}
          onClose={() => setTranslationField(null)}
        />
      )}
    </Modal>
  );
}
