import type { Webhook } from "@/types/webhook";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { AlertTriangle } from "lucide-react";

import { webhooksService } from "@/services/webhooks.service";

interface DeleteWebhookModalProps {
  isOpen: boolean;
  webhook: Webhook | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteWebhookModal({
  isOpen,
  webhook,
  onClose,
  onSuccess,
}: DeleteWebhookModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!webhook) return;

    try {
      setIsDeleting(true);
      setError("");

      await webhooksService.delete(webhook.id);

      addToast({
        title: "Webhook deleted successfully",
        description: `Webhook "${webhook.name}" and all its logs have been deleted.`,
        color: "success",
        variant: "flat",
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete webhook.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!webhook) return null;

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h2 className="text-2xl font-semibold">Delete Webhook</h2>
          </div>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <p className="text-default-600">
            Are you sure you want to delete the webhook{" "}
            <span className="font-semibold text-foreground">
              &quot;{webhook.name}&quot;
            </span>
            ? This action cannot be undone and will delete all webhook logs
            associated with this webhook.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="danger"
            isLoading={isDeleting}
            onPress={handleDelete}
          >
            Delete Webhook
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

