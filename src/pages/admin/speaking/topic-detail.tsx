import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  BookOpen,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
  Save,
  Crown,
  Image,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
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
  type SpeakingTopicLessonSummary,
  type SpeakingLesson,
  type UpdateTopicRequest,
} from "@/services/speaking.service";
import { LessonFormModal } from "@/components/admin/speaking/lesson-form-modal";
import { DeleteLessonModal } from "@/components/admin/speaking/delete-lesson-modal";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function AdminSpeakingTopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<SpeakingTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<SpeakingLesson | null>(
    null,
  );

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState("");
  const [editLevel, setEditLevel] = useState("A1");
  const [editOrderIndex, setEditOrderIndex] = useState(0);
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    if (id) loadTopic();
  }, [id]);

  // Sync edit form when topic loads
  useEffect(() => {
    if (topic) {
      setEditTitle(topic.title);
      setEditDescription(topic.description ?? "");
      setEditThumbnailUrl(topic.thumbnailUrl ?? "");
      setEditLevel(topic.level);
      setEditOrderIndex(topic.orderIndex);
      setEditIsPremium(topic.isPremium);
      setHasChanges(false);
    }
  }, [topic]);

  const loadTopic = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError("");
      const data = await speakingService.getTopicById(id);

      setTopic(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load topic.");
    } finally {
      setIsLoading(false);
    }
  };

  const markChanged = () => setHasChanges(true);

  const handleSaveTopic = async () => {
    if (!id || !topic) return;
    if (!editTitle.trim()) {
      setError("Title is required");

      return;
    }
    try {
      setIsSaving(true);
      setError("");

      // Only send fields that actually changed (true PATCH)
      const body: UpdateTopicRequest = {};

      if (editTitle.trim() !== topic.title) {
        body.title = editTitle.trim();
      }
      const newDesc = editDescription.trim() || undefined;

      if (newDesc !== (topic.description || undefined)) {
        body.description = newDesc;
      }
      const newThumb = editThumbnailUrl.trim() || null;

      if (newThumb !== topic.thumbnailUrl) {
        body.thumbnailUrl = newThumb;
      }
      if (editLevel !== topic.level) {
        body.level = editLevel;
      }
      if (editOrderIndex !== topic.orderIndex) {
        body.orderIndex = editOrderIndex;
      }
      if (editIsPremium !== topic.isPremium) {
        body.isPremium = editIsPremium;
      }

      if (Object.keys(body).length === 0) {
        setHasChanges(false);
        setIsSaving(false);

        return;
      }

      const updated = await speakingService.updateTopic(id, body);

      setTopic({ ...updated, lessons: topic.lessons });
      setHasChanges(false);
      addToast({
        title: "Topic updated",
        description: `"${updated.title}" has been saved.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save topic.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLesson = () => {
    setSelectedLesson(null);
    onFormOpen();
  };

  const handleEditLesson = async (lesson: SpeakingTopicLessonSummary) => {
    try {
      const full = await speakingService.getLessonById(lesson.id);

      setSelectedLesson(full);
      onFormOpen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson.");
    }
  };

  const handleDeleteLesson = async (lesson: SpeakingTopicLessonSummary) => {
    try {
      const full = await speakingService.getLessonById(lesson.id);

      setSelectedLesson(full);
      onDeleteOpen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson.");
    }
  };

  const lessons = (topic?.lessons ?? []) as SpeakingTopicLessonSummary[];
  const sortedLessons = [...lessons].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  if (!id) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-default-600">Thiếu ID topic.</p>
        <Button variant="flat" onPress={() => navigate("/admin/speaking")}>
          Về danh sách topics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <button
          className="text-default-400 transition-colors hover:text-foreground"
          type="button"
          onClick={() => navigate("/admin/speaking")}
        >
          Topics
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-default-300" />
        <span className="font-medium text-foreground">
          {topic?.title || "Chi tiết"}
        </span>
      </nav>

      {error && (
        <div
          className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !topic ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-default-200 bg-white p-10 dark:bg-content1">
          <p className="text-default-600">Không tìm thấy topic.</p>
          <Button variant="flat" onPress={() => navigate("/admin/speaking")}>
            Về danh sách topics
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* ===== LEFT: Topic info (editable) ===== */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-default-200 bg-white p-5 dark:bg-content1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Topic Information
                </h2>
                <Button
                  isIconOnly
                  aria-label="Refresh"
                  isLoading={isLoading}
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={loadTopic}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Thumbnail preview */}
              <div className="mb-4">
                {editThumbnailUrl ? (
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      alt="Thumbnail"
                      className="h-40 w-full object-cover"
                      src={editThumbnailUrl}
                    />
                  </div>
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-default-200 bg-default-50">
                    <div className="text-center">
                      <Image className="mx-auto h-8 w-8 text-default-300" />
                      <p className="mt-1 text-xs text-default-400">
                        No thumbnail
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  label="Title"
                  labelPlacement="outside"
                  placeholder="Topic title"
                  size="sm"
                  value={editTitle}
                  variant="bordered"
                  onValueChange={(v) => {
                    setEditTitle(v);
                    markChanged();
                  }}
                />
                <Textarea
                  label="Description"
                  labelPlacement="outside"
                  maxRows={4}
                  minRows={2}
                  placeholder="Optional description"
                  size="sm"
                  value={editDescription}
                  variant="bordered"
                  onValueChange={(v) => {
                    setEditDescription(v);
                    markChanged();
                  }}
                />
                <Input
                  label="Thumbnail URL"
                  labelPlacement="outside"
                  placeholder="https://..."
                  size="sm"
                  value={editThumbnailUrl}
                  variant="bordered"
                  onValueChange={(v) => {
                    setEditThumbnailUrl(v);
                    markChanged();
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Level"
                    labelPlacement="outside"
                    selectedKeys={[editLevel]}
                    size="sm"
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys)[0] as string;

                      if (k) {
                        setEditLevel(k);
                        markChanged();
                      }
                    }}
                  >
                    {LEVELS.map((l) => (
                      <SelectItem key={l}>{l}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Order"
                    labelPlacement="outside"
                    size="sm"
                    type="number"
                    value={String(editOrderIndex)}
                    variant="bordered"
                    onValueChange={(v) => {
                      setEditOrderIndex(parseInt(v, 10) || 0);
                      markChanged();
                    }}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-default-50 px-3 py-2 dark:bg-default-100/50">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-foreground">Premium</span>
                  </div>
                  <Switch
                    isSelected={editIsPremium}
                    size="sm"
                    onValueChange={(v) => {
                      setEditIsPremium(v);
                      markChanged();
                    }}
                  />
                </div>
              </div>

              {/* Save button */}
              {hasChanges && (
                <div className="mt-4 border-t border-default-100 pt-4">
                  <Button
                    className="w-full font-medium"
                    color="primary"
                    isLoading={isSaving}
                    radius="lg"
                    size="sm"
                    startContent={!isSaving && <Save className="h-4 w-4" />}
                    onPress={handleSaveTopic}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ===== RIGHT: Lessons ===== */}
          <div className="space-y-4">
            {/* Lessons header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Lessons
                </h2>
                <p className="text-xs text-default-400">
                  {sortedLessons.length} lesson
                  {sortedLessons.length !== 1 && "s"} in this topic
                </p>
              </div>
              <Button
                className="font-medium"
                color="primary"
                radius="full"
                size="sm"
                startContent={<Plus className="h-4 w-4" />}
                onPress={handleCreateLesson}
              >
                Add Lesson
              </Button>
            </div>

            {/* Lessons list */}
            {!sortedLessons.length ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default-300 bg-white p-10 dark:bg-content1">
                <div className="rounded-2xl bg-default-100 p-4">
                  <BookOpen className="h-8 w-8 text-default-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">No lessons yet</p>
                  <p className="mt-1 text-sm text-default-400">
                    Add lessons to this topic
                  </p>
                </div>
                <Button
                  color="primary"
                  radius="full"
                  size="sm"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={handleCreateLesson}
                >
                  Add Lesson
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="group flex items-center gap-3 rounded-xl border border-default-200 bg-white p-3.5 transition-colors hover:border-default-300 dark:bg-content1"
                  >
                    {/* Order number */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-default-100 text-xs font-bold text-default-500">
                      {index + 1}
                    </div>

                    {/* Lesson info */}
                    <button
                      className="flex flex-1 min-w-0 items-center gap-3 text-left"
                      type="button"
                      onClick={() =>
                        navigate(`/admin/speaking/lessons/${lesson.id}`)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {lesson.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-default-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.estimatedDurationMinutes} min
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-default-300 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Actions */}
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          aria-label="Actions"
                          radius="full"
                          size="sm"
                          variant="light"
                        >
                          <MoreHorizontal className="h-4 w-4 text-default-400" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Lesson actions"
                        onAction={(key) => {
                          if (key === "view") {
                            navigate(`/admin/speaking/lessons/${lesson.id}`);
                          } else if (key === "edit") {
                            handleEditLesson(lesson);
                          } else if (key === "delete") {
                            handleDeleteLesson(lesson);
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {id && (
        <>
          <LessonFormModal
            isOpen={isFormOpen}
            lesson={selectedLesson}
            topicId={id}
            onClose={onFormClose}
            onSuccess={loadTopic}
          />
          <DeleteLessonModal
            isOpen={isDeleteOpen}
            lesson={selectedLesson}
            onClose={onDeleteClose}
            onSuccess={loadTopic}
          />
        </>
      )}
    </div>
  );
}
