import { useEffect, useState } from "react";
import {
  Loader2,
  Check,
  X,
  Sparkles,
  CircleCheck,
  Circle,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ScrollShadow } from "@heroui/scroll-shadow";

import {
  translationService,
  type Translation,
  type TranslationEntityType,
} from "@/services/translation.service";
import { settingsService } from "@/services/settings.service";
import { LANGUAGES } from "@/config/languages";

interface TranslationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  text: string;
  multiline?: boolean;
}

interface LangRow {
  code: string;
  name: string;
  flag: string;
  translation: Translation | null;
}

export function TranslationDialog({
  isOpen,
  onClose,
  entityType,
  entityId,
  field,
  text,
  multiline = false,
}: TranslationDialogProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Editing state: langCode -> draft value
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Adding state
  const [addingLang, setAddingLang] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");

  // Generate state
  const [isGenerating, setIsGenerating] = useState(false);
  // Pending generated values not yet saved: langCode -> value
  const [pendingGenerations, setPendingGenerations] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (isOpen && entityId) {
      loadTranslations();
    }

    return () => {
      setEditingLang(null);
      setAddingLang(null);
      setPendingGenerations({});
    };
  }, [isOpen, entityId, field]);

  const loadTranslations = async () => {
    try {
      setIsLoading(true);
      const data = await translationService.getTranslations({
        entityType,
        entityId,
      });

      setTranslations(data.filter((t) => t.field === field));
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const translationMap = new Map(translations.map((t) => [t.language, t]));

  const rows: LangRow[] = LANGUAGES.map((l) => ({
    code: l.code,
    name: l.name,
    flag: l.flag,
    translation: translationMap.get(l.code) ?? null,
  }));

  const translatedCount = rows.filter((r) => r.translation).length;

  const handleStartEdit = (row: LangRow) => {
    setAddingLang(null);
    setEditingLang(row.code);
    setEditValue(row.translation?.value ?? "");
  };

  const handleStartAdd = (row: LangRow) => {
    setEditingLang(null);
    setAddingLang(row.code);
    setAddValue("");
  };

  const handleCancelEdit = () => {
    setEditingLang(null);
    setEditValue("");
  };

  const handleCancelAdd = () => {
    setAddingLang(null);
    setAddValue("");
  };

  const handleSaveEdit = async (row: LangRow) => {
    if (!row.translation || !editValue.trim()) return;
    if (editValue.trim() === row.translation.value) {
      handleCancelEdit();

      return;
    }
    try {
      setIsSaving(true);
      const updated = await translationService.updateTranslation(
        row.translation.id,
        { value: editValue.trim() },
      );

      setTranslations((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      setEditingLang(null);
      addToast({
        title: "Translation updated",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to update",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdd = async (langCode: string) => {
    if (!addValue.trim()) return;
    try {
      setIsSaving(true);
      const created = await translationService.createTranslation({
        entityType,
        entityId,
        field,
        language: langCode,
        value: addValue.trim(),
      });

      setTranslations((prev) => [...prev, created]);
      setAddingLang(null);
      addToast({
        title: "Translation added",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to add",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (t: Translation) => {
    try {
      await translationService.deleteTranslation(t.id);
      setTranslations((prev) => prev.filter((tr) => tr.id !== t.id));
      addToast({
        title: "Translation deleted",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to delete",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleGenerate = async () => {
    // Find languages without translations and without pending generations
    const missingLangs = LANGUAGES.filter(
      (l) => !translationMap.has(l.code) && !(l.code in pendingGenerations),
    );

    if (missingLangs.length === 0) {
      addToast({
        title: "All languages already have translations",
        color: "warning",
        variant: "flat",
      });

      return;
    }

    try {
      setIsGenerating(true);

      // Fetch prompt template
      const promptSetting = await settingsService.getTranslationPrompt();
      const template = promptSetting.value.prompt;

      // Build prompt: replace {languages} and {originalText}
      const languageNames = missingLangs.map((l) => `"${l.code}"`).join(",");
      const prompt = template
        .replace("{languages}", languageNames)
        .replace("{originalText}", text);

      // Call generate API
      const results = await translationService.generateTranslations(prompt);

      // Fill pending generations for languages that got results
      const newPending = { ...pendingGenerations };

      for (const result of results) {
        if (
          missingLangs.some((l) => l.code === result.lang) &&
          result.value.trim()
        ) {
          newPending[result.lang] = result.value;
        }
      }
      setPendingGenerations(newPending);

      addToast({
        title: `Generated ${results.length} translations`,
        description: "Review and save each translation",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to generate translations",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePending = async (langCode: string) => {
    const value = pendingGenerations[langCode];

    if (!value) return;
    try {
      setIsSaving(true);
      const created = await translationService.createTranslation({
        entityType,
        entityId,
        field,
        language: langCode,
        value,
        isGenerated: true,
      });

      setTranslations((prev) => [...prev, created]);
      setPendingGenerations((prev) => {
        const { [langCode]: _, ...rest } = prev;

        return rest;
      });
      addToast({
        title: "Translation saved",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to save",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardPending = (langCode: string) => {
    setPendingGenerations((prev) => {
      const { [langCode]: _, ...rest } = prev;

      return rest;
    });
  };

  const handleSaveAllPending = async () => {
    const entries = Object.entries(pendingGenerations);

    if (entries.length === 0) return;

    try {
      setIsSaving(true);
      const created = await translationService.bulkCreateTranslations(
        entries.map(([langCode, value]) => ({
          entityType,
          entityId,
          field,
          language: langCode,
          value,
          isGenerated: true,
        })),
      );

      setTranslations((prev) => [...prev, ...created]);
      setPendingGenerations({});
      addToast({
        title: `Saved ${created.length} translations`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to save all",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex-col items-start gap-1">
          <span>Translations — {field}</span>
          <span className="text-xs font-normal text-default-400">
            {translatedCount}/{LANGUAGES.length} languages translated
          </span>
        </ModalHeader>

        <ModalBody className="gap-0 px-0">
          {/* Original text */}
          <div className="mx-6 mb-4 rounded-lg border border-default-200 bg-default-50 p-3 dark:bg-default-100/30">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-default-400">
              Original
            </p>
            <p className="text-sm text-foreground">
              {text || <span className="italic text-default-300">Empty</span>}
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollShadow className="max-h-[420px] px-6">
              <div className="divide-y divide-default-100">
                {rows.map((row) => {
                  const hasTranslation = !!row.translation;
                  const isEditing = editingLang === row.code;
                  const isAdding = addingLang === row.code;

                  return (
                    <div key={row.code} className="py-2.5 first:pt-0 last:pb-0">
                      {/* Language header row */}
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">
                          {row.flag}
                        </span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                          {row.name}
                          <span className="ml-1.5 text-xs font-normal uppercase text-default-400">
                            {row.code}
                          </span>
                        </span>
                        {hasTranslation ? (
                          <CircleCheck className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 text-default-300" />
                        )}
                      </div>

                      {/* Translated value / actions */}
                      {hasTranslation && !isEditing && (
                        <div className="mt-1.5 flex items-start gap-2 pl-7">
                          <p className="min-w-0 flex-1 text-sm text-default-500">
                            {row.translation!.value}
                          </p>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              isIconOnly
                              aria-label="Edit"
                              radius="full"
                              size="sm"
                              variant="light"
                              onPress={() => handleStartEdit(row)}
                            >
                              <Pencil className="h-3.5 w-3.5 text-default-400" />
                            </Button>
                            <Button
                              isIconOnly
                              aria-label="Delete"
                              radius="full"
                              size="sm"
                              variant="light"
                              onPress={() => handleDelete(row.translation!)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-danger" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Edit mode */}
                      {isEditing && (
                        <div className="mt-1.5 flex items-end gap-1.5 pl-7">
                          <InputComponent
                            className="flex-1"
                            {...(multiline ? { maxRows: 3, minRows: 1 } : {})}
                            placeholder="Translation..."
                            size="sm"
                            value={editValue}
                            variant="bordered"
                            onValueChange={setEditValue}
                          />
                          <Button
                            isIconOnly
                            aria-label="Save"
                            color="primary"
                            isLoading={isSaving}
                            radius="full"
                            size="sm"
                            variant="flat"
                            onPress={() => handleSaveEdit(row)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            isIconOnly
                            aria-label="Cancel"
                            radius="full"
                            size="sm"
                            variant="flat"
                            onPress={handleCancelEdit}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}

                      {/* Pending generated value */}
                      {!hasTranslation &&
                        !isAdding &&
                        row.code in pendingGenerations && (
                          <div className="mt-1.5 pl-7">
                            <p className="text-sm text-default-500 italic">
                              {pendingGenerations[row.code]}
                            </p>
                            <div className="mt-1 flex items-center gap-1">
                              <Button
                                color="primary"
                                isLoading={isSaving}
                                size="sm"
                                startContent={<Check className="h-3 w-3" />}
                                variant="flat"
                                onPress={() => handleSavePending(row.code)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                startContent={<X className="h-3 w-3" />}
                                variant="flat"
                                onPress={() => handleDiscardPending(row.code)}
                              >
                                Discard
                              </Button>
                            </div>
                          </div>
                        )}

                      {/* Not translated — add button or add form */}
                      {!hasTranslation &&
                        !isAdding &&
                        !(row.code in pendingGenerations) && (
                          <div className="mt-1 pl-7">
                            <button
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                              type="button"
                              onClick={() => handleStartAdd(row)}
                            >
                              <Plus className="h-3 w-3" />
                              Add translation
                            </button>
                          </div>
                        )}

                      {/* Add mode */}
                      {isAdding && (
                        <div className="mt-1.5 flex items-end gap-1.5 pl-7">
                          <InputComponent
                            className="flex-1"
                            {...(multiline ? { maxRows: 3, minRows: 1 } : {})}
                            placeholder="Translation..."
                            size="sm"
                            value={addValue}
                            variant="bordered"
                            onValueChange={setAddValue}
                          />
                          <Button
                            isIconOnly
                            aria-label="Save"
                            color="primary"
                            isDisabled={!addValue.trim()}
                            isLoading={isSaving}
                            radius="full"
                            size="sm"
                            variant="flat"
                            onPress={() => handleSaveAdd(row.code)}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            isIconOnly
                            aria-label="Cancel"
                            radius="full"
                            size="sm"
                            variant="flat"
                            onPress={handleCancelAdd}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollShadow>
          )}
        </ModalBody>

        <ModalFooter className="justify-between">
          <div className="flex gap-2">
            <Button
              isLoading={isGenerating}
              size="sm"
              startContent={
                !isGenerating ? <Sparkles className="h-3.5 w-3.5" /> : undefined
              }
              variant="flat"
              onPress={handleGenerate}
            >
              Generate All
            </Button>
            {Object.keys(pendingGenerations).length > 0 && (
              <Button
                color="primary"
                isLoading={isSaving}
                size="sm"
                startContent={<Check className="h-3.5 w-3.5" />}
                variant="flat"
                onPress={handleSaveAllPending}
              >
                Save All ({Object.keys(pendingGenerations).length})
              </Button>
            )}
          </div>
          <Button size="sm" variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
