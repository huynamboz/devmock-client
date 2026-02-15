import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

interface DeleteProjectModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProjectModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Delete Project</h2>
          <p className="text-sm text-default-600 font-normal">
            Are you sure you want to delete this project? This action cannot be
            undone.
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg">
            <p className="text-sm font-medium text-danger">
              Warning: This will delete the project and all its resources
              permanently.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="danger" isLoading={isDeleting} onPress={onConfirm}>
            Delete Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
