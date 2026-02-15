import type { SpeakingTopic } from "@/services/speaking.service";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { speakingService } from "@/services/speaking.service";

interface DeleteTopicModalProps {
  isOpen: boolean;
  topic: SpeakingTopic | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteTopicModal({
  isOpen,
  topic,
  onClose,
  onSuccess,
}: DeleteTopicModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!topic) return;

    try {
      setIsDeleting(true);
      setError("");
      await speakingService.deleteTopic(topic.id);
      addToast({
        title: "Topic deleted",
        description: `"${topic.title}" has been deleted.`,
        color: "success",
        variant: "flat",
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete topic.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!topic) return null;

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h2 className="text-xl font-semibold">Delete Topic</h2>
          </div>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
              {error}
            </div>
          )}
          <p className="text-default-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{topic.title}&quot;
            </span>
            ? This may affect lessons under this topic.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" isLoading={isDeleting} onPress={handleDelete}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
