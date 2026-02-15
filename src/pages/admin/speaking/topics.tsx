import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  BookOpen,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Crown,
} from "lucide-react";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useDisclosure } from "@heroui/modal";

import {
  speakingService,
  type SpeakingTopic,
} from "@/services/speaking.service";
import { TopicFormModal } from "@/components/admin/speaking/topic-form-modal";
import { DeleteTopicModal } from "@/components/admin/speaking/delete-topic-modal";

const levelColors: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  A2: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400",
  B1: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  B2: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  C1: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  C2: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
};

export default function AdminSpeakingTopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SpeakingTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic | null>(
    null,
  );

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await speakingService.getTopics();

      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topics.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTopic(null);
    onFormOpen();
  };

  const handleEdit = (topic: SpeakingTopic) => {
    setSelectedTopic(topic);
    onFormOpen();
  };

  const handleDelete = (topic: SpeakingTopic) => {
    setSelectedTopic(topic);
    onDeleteOpen();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Speaking Topics
          </h1>
          <p className="mt-1 text-sm text-default-500">
            Quản lý các chủ đề luyện nói
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            aria-label="Refresh"
            isLoading={isLoading}
            radius="full"
            size="sm"
            variant="bordered"
            onPress={loadTopics}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            className="font-medium"
            color="primary"
            radius="full"
            size="sm"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleCreate}
          >
            Add Topic
          </Button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Content */}
      {isLoading && !topics.length ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !topics.length ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default-300 bg-white p-12 dark:bg-content1">
          <div className="rounded-2xl bg-default-100 p-5">
            <BookOpen className="h-10 w-10 text-default-400" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">No topics yet</p>
            <p className="mt-1 text-sm text-default-400">
              Create your first speaking topic to get started
            </p>
          </div>
          <Button
            className="mt-2"
            color="primary"
            radius="full"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleCreate}
          >
            Add Topic
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="group relative flex flex-col rounded-2xl border border-default-200 bg-white p-0 transition-colors hover:border-default-300 dark:bg-content1"
            >
              {/* Thumbnail */}
              <div className="relative h-40 w-full overflow-hidden rounded-t-2xl bg-default-100">
                {topic.thumbnailUrl ? (
                  <img
                    alt={topic.title}
                    className="h-full w-full object-cover"
                    src={topic.thumbnailUrl}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-default-300" />
                  </div>
                )}
                {topic.isPremium && (
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Crown className="h-3 w-3" />
                    Premium
                  </div>
                )}
                {/* Actions dropdown */}
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        aria-label="Actions"
                        className="bg-white/80 backdrop-blur-sm dark:bg-default-100/80"
                        radius="full"
                        size="sm"
                        variant="flat"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Topic actions"
                      onAction={(key) => {
                        if (key === "view") {
                          navigate(`/admin/speaking/topics/${topic.id}`);
                        } else if (key === "edit") {
                          handleEdit(topic);
                        } else if (key === "delete") {
                          handleDelete(topic);
                        }
                      }}
                    >
                      <DropdownItem
                        key="view"
                        startContent={<Eye className="h-4 w-4" />}
                      >
                        View
                      </DropdownItem>
                      <DropdownItem
                        key="edit"
                        startContent={<Pencil className="h-4 w-4" />}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        className="text-danger"
                        color="danger"
                        startContent={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              {/* Info */}
              <button
                className="flex flex-1 flex-col p-4 text-left"
                type="button"
                onClick={() => navigate(`/admin/speaking/topics/${topic.id}`)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${levelColors[topic.level] || "bg-default-100 text-default-600"}`}
                  >
                    {topic.level}
                  </span>
                  <span className="text-xs text-default-400">
                    {topic.lessons?.length ?? 0} lessons
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground leading-snug">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-default-400 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <TopicFormModal
        isOpen={isFormOpen}
        topic={selectedTopic}
        onClose={onFormClose}
        onSuccess={loadTopics}
      />
      <DeleteTopicModal
        isOpen={isDeleteOpen}
        topic={selectedTopic}
        onClose={onDeleteClose}
        onSuccess={loadTopics}
      />
    </div>
  );
}
