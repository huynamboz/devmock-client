import type {
  CreateItemRequest,
  SpeakingItem,
} from "@/services/speaking.service";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
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
  const [textTranslation, setTextTranslation] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTextOriginal(item?.textOriginal ?? "");
      setTextTranslation(item?.textTranslation ?? "");
      setAudioUrl(item?.audioUrl ?? "");
      setPhonetic(item?.phonetic ?? "");
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
        textTranslation: textTranslation.trim() || null,
        audioUrl: audioUrl.trim() || null,
        phonetic: phonetic.trim() || null,
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
          <Input
            label="Translation"
            placeholder="e.g. Hello, I am Nam."
            value={textTranslation}
            variant="bordered"
            onValueChange={(v) => setTextTranslation(v)}
          />
          <Input
            label="Phonetic"
            placeholder="e.g. sin tʃaʊ, toj la nam"
            value={phonetic}
            variant="bordered"
            onValueChange={(v) => setPhonetic(v)}
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
    </Modal>
  );
}
