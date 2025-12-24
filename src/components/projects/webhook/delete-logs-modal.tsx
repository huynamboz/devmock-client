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

interface DeleteLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleteAll?: boolean;
}

export function DeleteLogsModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleteAll = false,
}: DeleteLogsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      addToast({
        title: isDeleteAll
          ? "All logs deleted successfully"
          : "Log deleted successfully",
        description: isDeleteAll
          ? "All webhook logs have been deleted."
          : "The log has been deleted.",
        color: "success",
        variant: "flat",
      });
      onClose();
    } catch (err) {
      addToast({
        title: "Failed to delete",
        description:
          err instanceof Error
            ? err.message
            : "Failed to delete log(s). Please try again.",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h2 className="text-2xl font-semibold">
              {isDeleteAll ? "Delete All Logs" : "Delete Log"}
            </h2>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-default-600">
            {isDeleteAll
              ? "Are you sure you want to delete all webhook logs? This action cannot be undone."
              : "Are you sure you want to delete this log? This action cannot be undone."}
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
            {isDeleteAll ? "Delete All" : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

