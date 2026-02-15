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
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { Webhook as WebhookIcon } from "lucide-react";

import { webhooksService } from "@/services/webhooks.service";

interface CreateWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (webhook: Webhook) => void;
}

export function CreateWebhookModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWebhookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Webhook name is required");

      return;
    }

    if (name.length > 100) {
      setError("Webhook name must be 100 characters or less");

      return;
    }

    if (description.length > 500) {
      setError("Description must be 500 characters or less");

      return;
    }

    try {
      setIsCreating(true);
      setError("");

      const newWebhook = await webhooksService.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      addToast({
        title: "Webhook created successfully",
        description: `Webhook "${newWebhook.name}" has been created.`,
        color: "success",
        variant: "flat",
      });

      setName("");
      setDescription("");
      onSuccess(newWebhook);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create webhook.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <WebhookIcon className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Create New Webhook</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            Create a webhook to receive and log HTTP requests
          </p>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <Input
            description={`${name.length}/100 characters`}
            label="Webhook Name"
            maxLength={100}
            placeholder="e.g., Payment Webhook, User Events"
            size="lg"
            value={name}
            variant="bordered"
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isCreating) {
                handleCreate();
              }
            }}
          />
          <Textarea
            description={`${description.length}/500 characters`}
            label="Description"
            maxLength={500}
            minRows={3}
            placeholder="Optional description for this webhook"
            size="lg"
            value={description}
            variant="bordered"
            onChange={(e) => {
              setDescription(e.target.value);
              setError("");
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isCreating} onPress={handleCreate}>
            Create Webhook
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
