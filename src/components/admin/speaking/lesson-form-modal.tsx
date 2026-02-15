import type {
  CreateLessonRequest,
  SpeakingLesson,
} from "@/services/speaking.service";

import { useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
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

interface LessonFormModalProps {
  isOpen: boolean;
  lesson: SpeakingLesson | null;
  topicId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function LessonFormModal({
  isOpen,
  lesson,
  topicId,
  onClose,
  onSuccess,
}: LessonFormModalProps) {
  const isEdit = !!lesson;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(lesson?.title ?? "");
      setDescription(lesson?.description ?? "");
      setOrderIndex(lesson?.orderIndex ?? 0);
      setEstimatedDurationMinutes(lesson?.estimatedDurationMinutes ?? 10);
      setError("");
    }
  }, [isOpen, lesson]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");

      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const body: CreateLessonRequest = {
        topicId: isEdit && lesson ? lesson.topicId : topicId,
        title: title.trim(),
        description: description.trim() || null,
        orderIndex,
        estimatedDurationMinutes,
      };

      if (isEdit && lesson) {
        await speakingService.updateLesson(lesson.id, body);
        addToast({
          title: "Lesson updated",
          description: `"${title.trim()}" has been updated.`,
          color: "success",
          variant: "flat",
        });
      } else {
        await speakingService.createLesson(body);
        addToast({
          title: "Lesson created",
          description: `"${title.trim()}" has been created.`,
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
            <ListOrdered className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {isEdit ? "Edit Lesson" : "Create Lesson"}
            </h2>
          </div>
        </ModalHeader>
        <ModalBody className="gap-4">
          {error && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400">
              {error}
            </div>
          )}
          <Input
            label="Title"
            placeholder="e.g. Basic Greetings"
            value={title}
            variant="bordered"
            onValueChange={(v) => {
              setTitle(v);
              setError("");
            }}
          />
          <Textarea
            label="Description"
            placeholder="Optional description"
            value={description}
            variant="bordered"
            onValueChange={(v) => setDescription(v)}
          />
          <Input
            label="Order index"
            type="number"
            value={String(orderIndex)}
            variant="bordered"
            onValueChange={(v) => setOrderIndex(parseInt(v, 10) || 0)}
          />
          <Input
            label="Estimated duration (minutes)"
            type="number"
            value={String(estimatedDurationMinutes)}
            variant="bordered"
            onValueChange={(v) =>
              setEstimatedDurationMinutes(parseInt(v, 10) || 0)
            }
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
