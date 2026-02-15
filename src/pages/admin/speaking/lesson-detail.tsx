import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  Clock,
  Mic,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Volume2,
  Globe,
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
  type SpeakingLesson,
  type SpeakingItem,
} from "@/services/speaking.service";
import { ItemFormModal } from "@/components/admin/speaking/item-form-modal";
import { DeleteItemModal } from "@/components/admin/speaking/delete-item-modal";
import { TranslationDialog } from "@/components/admin/translation-dialog";

export default function AdminSpeakingLessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<SpeakingLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<SpeakingItem | null>(null);

  // Translation dialog state
  const [translationField, setTranslationField] = useState<string | null>(null);

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
    if (id) loadLesson();
  }, [id]);

  const loadLesson = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError("");
      const data = await speakingService.getLessonById(id);

      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lesson.");
    } finally {
      setIsLoading(false);
    }
  };

  const items = (lesson?.items ?? []) as SpeakingItem[];
  const sortedItems = [...items].sort((a, b) => a.orderIndex - b.orderIndex);

  const handleCreateItem = () => {
    setSelectedItem(null);
    onFormOpen();
  };

  const handleEditItem = (item: SpeakingItem) => {
    setSelectedItem(item);
    onFormOpen();
  };

  const handleDeleteItem = (item: SpeakingItem) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  if (!id) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
        <p className="text-default-600">Thiếu ID lesson.</p>
        <Button variant="flat" onPress={() => navigate("/admin/speaking")}>
          Về danh sách topics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <button
          className="text-default-400 transition-colors hover:text-foreground"
          type="button"
          onClick={() => navigate("/admin/speaking")}
        >
          Topics
        </button>
        {lesson?.topic && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-default-300" />
            <button
              className="text-default-400 transition-colors hover:text-foreground"
              type="button"
              onClick={() =>
                navigate(`/admin/speaking/topics/${lesson.topic!.id}`)
              }
            >
              {lesson.topic.title}
            </button>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-default-300" />
        <span className="font-medium text-foreground">
          {lesson?.title || "Lesson"}
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
      ) : !lesson ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-default-200 bg-white p-10 dark:bg-content1">
          <p className="text-default-600">Không tìm thấy lesson.</p>
          <Button variant="flat" onPress={() => navigate("/admin/speaking")}>
            Về danh sách topics
          </Button>
        </div>
      ) : (
        <>
          {/* Lesson info banner */}
          <div className="flex flex-col gap-4 rounded-2xl border border-default-200 bg-white p-5 dark:bg-content1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">
                {lesson.title}
              </h1>
              <button
                className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline"
                type="button"
                onClick={() => setTranslationField("title")}
              >
                <Globe className="h-3 w-3" />
                Translations
              </button>
              {lesson.description && (
                <>
                  <p className="mt-1 text-sm text-default-500">
                    {lesson.description}
                  </p>
                  <button
                    className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline"
                    type="button"
                    onClick={() => setTranslationField("description")}
                  >
                    <Globe className="h-3 w-3" />
                    Translations
                  </button>
                </>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-default-100 px-2 py-0.5 text-[11px] font-semibold text-default-600">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedDurationMinutes} min
                </span>
                <span className="inline-flex rounded-md bg-default-100 px-2 py-0.5 text-[11px] font-semibold text-default-600">
                  Order: {lesson.orderIndex}
                </span>
                {lesson.topic && (
                  <button
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                    type="button"
                    onClick={() =>
                      navigate(`/admin/speaking/topics/${lesson.topic!.id}`)
                    }
                  >
                    <Mic className="h-3 w-3" />
                    {lesson.topic.title}
                  </button>
                )}
              </div>
            </div>
            <Button
              isIconOnly
              aria-label="Refresh"
              isLoading={isLoading}
              radius="full"
              size="sm"
              variant="bordered"
              onPress={loadLesson}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Items header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Speaking Items
              </h2>
              <p className="text-xs text-default-400">
                {sortedItems.length} item{sortedItems.length !== 1 && "s"}
              </p>
            </div>
            <Button
              className="font-medium"
              color="primary"
              radius="full"
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleCreateItem}
            >
              Add Item
            </Button>
          </div>

          {/* Items list */}
          {!sortedItems.length ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default-300 bg-white p-10 dark:bg-content1">
              <div className="rounded-2xl bg-default-100 p-4">
                <Mic className="h-8 w-8 text-default-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">No items yet</p>
                <p className="mt-1 text-sm text-default-400">
                  Add speaking items to this lesson
                </p>
              </div>
              <Button
                color="primary"
                radius="full"
                size="sm"
                startContent={<Plus className="h-4 w-4" />}
                onPress={handleCreateItem}
              >
                Add Item
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sortedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 rounded-xl border border-default-200 bg-white p-4 transition-colors hover:border-default-300 dark:bg-content1"
                >
                  {/* Order number */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-default-100 text-xs font-bold text-default-500 mt-0.5">
                    {index + 1}
                  </div>

                  {/* Item content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground leading-snug">
                      {item.textOriginal}
                    </p>
                    {item.ipa && (
                      <p className="mt-0.5 font-mono text-xs text-default-400">
                        /{item.ipa}/
                      </p>
                    )}
                    {item.audioUrl && (
                      <a
                        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        href={item.audioUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Volume2 className="h-3 w-3" />
                        Play audio
                      </a>
                    )}
                  </div>

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
                      aria-label="Item actions"
                      onAction={(key) => {
                        if (key === "edit") {
                          handleEditItem(item);
                        } else if (key === "delete") {
                          handleDeleteItem(item);
                        }
                      }}
                    >
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
        </>
      )}

      {id && (
        <>
          <ItemFormModal
            isOpen={isFormOpen}
            item={selectedItem}
            lessonId={id}
            onClose={onFormClose}
            onSuccess={loadLesson}
          />
          <DeleteItemModal
            isOpen={isDeleteOpen}
            item={selectedItem}
            onClose={onDeleteClose}
            onSuccess={loadLesson}
          />
          {lesson && (
            <TranslationDialog
              entityId={id}
              entityType="lesson"
              field={translationField ?? ""}
              isOpen={!!translationField}
              multiline={translationField === "description"}
              text={
                translationField === "title"
                  ? lesson.title
                  : translationField === "description"
                    ? lesson.description ?? ""
                    : ""
              }
              onClose={() => setTranslationField(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
