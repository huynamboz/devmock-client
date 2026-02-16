import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2,
  ChevronRight,
  Clock,
  Mic,
  RefreshCw,
  Plus,
  ListPlus,
  Pencil,
  Trash2,
  Volume2,
  Globe,
  Wand2,
} from "lucide-react";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Tooltip } from "@heroui/tooltip";
import { useDisclosure } from "@heroui/modal";

import {
  speakingService,
  type SpeakingLesson,
  type SpeakingItem,
} from "@/services/speaking.service";
import { ItemFormModal } from "@/components/admin/speaking/item-form-modal";
import { DeleteItemModal } from "@/components/admin/speaking/delete-item-modal";
import { BulkAddItemsModal } from "@/components/admin/speaking/bulk-add-items-modal";
import { TranslationDialog } from "@/components/admin/translation-dialog";

export default function AdminSpeakingLessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<SpeakingLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<SpeakingItem | null>(null);

  const [generatingAudioId, setGeneratingAudioId] = useState<string | null>(
    null,
  );

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
  const {
    isOpen: isBulkOpen,
    onOpen: onBulkOpen,
    onClose: onBulkClose,
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

  const handleGenerateAudio = async (item: SpeakingItem) => {
    try {
      setGeneratingAudioId(item.id);
      const { audioUrl } = await speakingService.generateAudio(
        item.textOriginal,
      );

      await speakingService.updateItem(item.id, { audioUrl });
      addToast({
        title: "Audio generated",
        description: "Audio has been generated and saved.",
        color: "success",
        variant: "flat",
      });
      loadLesson();
    } catch (err) {
      addToast({
        title: "Failed to generate audio",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setGeneratingAudioId(null);
    }
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
            <div className="flex items-center gap-2">
              <Button
                className="font-medium"
                color="primary"
                radius="full"
                size="sm"
                startContent={<ListPlus className="h-4 w-4" />}
                variant="bordered"
                onPress={onBulkOpen}
              >
                Add Multi
              </Button>
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
          </div>

          {/* Items table */}
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
            <Table
              aria-label="Speaking items"
              classNames={{
                wrapper: "rounded-2xl border border-default-200 shadow-none",
                tr: "hover:bg-default-100 transition-colors",
              }}
              removeWrapper={false}
            >
              <TableHeader>
                <TableColumn className="w-12">#</TableColumn>
                <TableColumn>Original Text</TableColumn>
                <TableColumn>Explanation</TableColumn>
                <TableColumn className="w-32">IPA</TableColumn>
                <TableColumn className="w-20 text-center">Audio</TableColumn>
                <TableColumn className="w-36">Created</TableColumn>
                <TableColumn className="w-28 text-center">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {sortedItems.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-xs font-bold text-default-400">
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">
                        {item.textOriginal}
                        {(item.translationCounts?.textOriginal ?? 0) > 0 && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            <Globe className="h-2.5 w-2.5" />
                            {item.translationCounts!.textOriginal}
                          </span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.explanation ? (
                        <p className="text-sm text-default-500 line-clamp-2">
                          {item.explanation}
                          {(item.translationCounts?.explanation ?? 0) > 0 && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              <Globe className="h-2.5 w-2.5" />
                              {item.translationCounts!.explanation}
                            </span>
                          )}
                        </p>
                      ) : (
                        <span className="text-xs text-default-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.ipa ? (
                        <span className="font-mono text-xs text-default-400">
                          /{item.ipa}/
                        </span>
                      ) : (
                        <span className="text-xs text-default-300">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {item.audioUrl ? (
                          <>
                            <Tooltip content="Play audio">
                              <Button
                                isIconOnly
                                aria-label="Play audio"
                                radius="full"
                                size="sm"
                                variant="light"
                                onPress={() => new Audio(item.audioUrl!).play()}
                              >
                                <Volume2 className="h-4 w-4 text-primary" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Regenerate audio">
                              <Button
                                isIconOnly
                                aria-label="Regenerate audio"
                                isLoading={generatingAudioId === item.id}
                                radius="full"
                                size="sm"
                                variant="light"
                                onPress={() => handleGenerateAudio(item)}
                              >
                                <Wand2 className="h-3.5 w-3.5 text-warning" />
                              </Button>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip content="Generate audio">
                            <Button
                              isIconOnly
                              aria-label="Generate audio"
                              isLoading={generatingAudioId === item.id}
                              radius="full"
                              size="sm"
                              variant="light"
                              onPress={() => handleGenerateAudio(item)}
                            >
                              <Wand2 className="h-4 w-4 text-warning" />
                            </Button>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-default-400">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-0.5">
                        <Tooltip content="Translations">
                          <Button
                            isIconOnly
                            aria-label="Translations"
                            radius="full"
                            size="sm"
                            variant="light"
                            onPress={() => {
                              setSelectedItem(item);
                              setTranslationField("textOriginal");
                            }}
                          >
                            <Globe className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit">
                          <Button
                            isIconOnly
                            aria-label="Edit"
                            radius="full"
                            size="sm"
                            variant="light"
                            onPress={() => handleEditItem(item)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-default-400" />
                          </Button>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete">
                          <Button
                            isIconOnly
                            aria-label="Delete"
                            radius="full"
                            size="sm"
                            variant="light"
                            onPress={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-danger" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          <BulkAddItemsModal
            isOpen={isBulkOpen}
            lessonId={id}
            startOrderIndex={sortedItems.length}
            onClose={onBulkClose}
            onSuccess={loadLesson}
          />
          {lesson && translationField && (
            <TranslationDialog
              isOpen
              entityId={
                (translationField === "textOriginal" ||
                  translationField === "explanation") &&
                selectedItem
                  ? selectedItem.id
                  : id
              }
              entityType={
                translationField === "textOriginal" ||
                translationField === "explanation"
                  ? "item"
                  : "lesson"
              }
              field={translationField}
              multiline={
                translationField === "description" ||
                translationField === "textOriginal" ||
                translationField === "explanation"
              }
              text={
                translationField === "title"
                  ? lesson.title
                  : translationField === "description"
                    ? (lesson.description ?? "")
                    : translationField === "textOriginal" && selectedItem
                      ? selectedItem.textOriginal
                      : translationField === "explanation" && selectedItem
                        ? (selectedItem.explanation ?? "")
                        : ""
              }
              onClose={() => {
                setTranslationField(null);
                setSelectedItem(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
