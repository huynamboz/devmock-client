import type {
  CreateTopicRequest,
  SpeakingTopic,
} from "@/services/speaking.service";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
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
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";

import { speakingService } from "@/services/speaking.service";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface TopicFormModalProps {
  isOpen: boolean;
  topic: SpeakingTopic | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function TopicFormModal({
  isOpen,
  topic,
  onClose,
  onSuccess,
}: TopicFormModalProps) {
  const isEdit = !!topic;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [level, setLevel] = useState("A1");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(topic?.title ?? "");
      setDescription(topic?.description ?? "");
      setThumbnailUrl(topic?.thumbnailUrl ?? "");
      setLevel(topic?.level ?? "A1");
      setOrderIndex(topic?.orderIndex ?? 0);
      setIsPremium(topic?.isPremium ?? false);
      setError("");
    }
  }, [isOpen, topic]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");

      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const body: CreateTopicRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || null,
        level,
        orderIndex,
        isPremium,
      };

      if (isEdit && topic) {
        await speakingService.updateTopic(topic.id, body);
        addToast({
          title: "Topic updated",
          description: `"${title.trim()}" has been updated.`,
          color: "success",
          variant: "flat",
        });
      } else {
        await speakingService.createTopic(body);
        addToast({
          title: "Topic created",
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
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {isEdit ? "Edit Topic" : "Create Topic"}
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
            placeholder="e.g. Greetings & Introductions"
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
            label="Thumbnail URL"
            placeholder="https://..."
            value={thumbnailUrl}
            variant="bordered"
            onValueChange={(v) => setThumbnailUrl(v)}
          />
          <Select
            label="Level"
            selectedKeys={[level]}
            variant="bordered"
            onSelectionChange={(keys) => {
              const k = Array.from(keys)[0] as string;

              if (k) setLevel(k);
            }}
          >
            {LEVELS.map((l) => (
              <SelectItem key={l}>{l}</SelectItem>
            ))}
          </Select>
          <Input
            label="Order index"
            type="number"
            value={String(orderIndex)}
            variant="bordered"
            onValueChange={(v) => setOrderIndex(parseInt(v, 10) || 0)}
          />
          <Switch isSelected={isPremium} onValueChange={setIsPremium}>
            Premium
          </Switch>
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
