import type { Webhook, UpdateWebhookRequest } from "@/types/webhook";

import { useState, useEffect } from "react";
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
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import { Webhook as WebhookIcon } from "lucide-react";

import { webhooksService } from "@/services/webhooks.service";

interface EditWebhookModalProps {
  isOpen: boolean;
  webhook: Webhook | null;
  onClose: () => void;
  onSuccess: (webhook: Webhook) => void;
}

export function EditWebhookModal({
  isOpen,
  webhook,
  onClose,
  onSuccess,
}: EditWebhookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (webhook) {
      setName(webhook.name);
      setDescription(webhook.description || "");
      setStatus(webhook.status);
    }
  }, [webhook]);

  const handleUpdate = async () => {
    if (!webhook) return;

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
      setIsUpdating(true);
      setError("");

      const updateData: UpdateWebhookRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      };

      const updatedWebhook = await webhooksService.update(
        webhook.id,
        updateData,
      );

      addToast({
        title: "Webhook updated successfully",
        description: `Webhook "${updatedWebhook.name}" has been updated.`,
        color: "success",
        variant: "flat",
      });

      onSuccess(updatedWebhook);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update webhook.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (webhook) {
      setName(webhook.name);
      setDescription(webhook.description || "");
      setStatus(webhook.status);
    }
    setError("");
    onClose();
  };

  if (!webhook) return null;

  return (
    <Modal isOpen={isOpen} placement="center" size="lg" onClose={handleClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <WebhookIcon className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Edit Webhook</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            Update webhook information and status
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
          <div className="flex items-center justify-between p-3 bg-default-50 rounded-lg">
            <div className="flex flex-col">
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-default-500">
                {status === "ACTIVE"
                  ? "Webhook is active and receiving requests"
                  : "Webhook is inactive and will not receive requests"}
              </p>
            </div>
            <Switch
              isSelected={status === "ACTIVE"}
              onValueChange={(isSelected) => {
                setStatus(isSelected ? "ACTIVE" : "INACTIVE");
              }}
            >
              {status === "ACTIVE" ? "Active" : "Inactive"}
            </Switch>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isUpdating} onPress={handleUpdate}>
            Update Webhook
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
