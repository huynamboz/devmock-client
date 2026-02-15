import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Copy,
  Check,
  ExternalLink,
  Save,
  Languages,
  Info,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";

import {
  settingsService,
  type AIProviderSetting,
  type UpsertAIProviderRequest,
} from "@/services/settings.service";

const PROVIDERS = [
  {
    key: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    color:
      "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  },
  {
    key: "google",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    color: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  },
  {
    key: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    color:
      "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  },
  {
    key: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    color:
      "text-violet-700 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
  },
  {
    key: "together",
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    color: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
  },
  {
    key: "custom",
    name: "Custom",
    baseUrl: "",
    color:
      "text-default-700 bg-default-100 dark:text-default-400 dark:bg-default-100/40",
  },
];

function getProviderMeta(providerKey: string) {
  return (
    PROVIDERS.find((p) => p.key === providerKey) ??
    PROVIDERS[PROVIDERS.length - 1]
  );
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return "••••••••";

  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

function extractProviderKey(settingKey: string): string {
  return settingKey.replace("ai_provider_", "");
}

export default function AdminSettingsPage() {
  const [providers, setProviders] = useState<AIProviderSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingProvider, setEditingProvider] =
    useState<AIProviderSetting | null>(null);
  const [formName, setFormName] = useState("");
  const [formProvider, setFormProvider] = useState("openai");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [deletingProvider, setDeletingProvider] =
    useState<AIProviderSetting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Visibility state for API keys
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Translation prompt state
  const [promptValue, setPromptValue] = useState("");
  const [promptOriginal, setPromptOriginal] = useState("");
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(true);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);

  useEffect(() => {
    loadProviders();
    loadTranslationPrompt();
  }, []);

  const loadProviders = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await settingsService.getAIProviders();

      setProviders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load providers.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadTranslationPrompt = async () => {
    try {
      setIsLoadingPrompt(true);
      const data = await settingsService.getTranslationPrompt();

      setPromptValue(data.value.prompt);
      setPromptOriginal(data.value.prompt);
    } catch {
      // 404 = not configured yet, that's fine
      setPromptValue("");
      setPromptOriginal("");
    } finally {
      setIsLoadingPrompt(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!promptValue.trim()) return;
    try {
      setIsSavingPrompt(true);
      const data = await settingsService.upsertTranslationPrompt(
        promptValue.trim(),
      );

      setPromptValue(data.value.prompt);
      setPromptOriginal(data.value.prompt);
      addToast({
        title: "Translation prompt saved",
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to save prompt",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleAdd = () => {
    setEditingProvider(null);
    setFormName("");
    setFormProvider("openai");
    setFormBaseUrl(PROVIDERS[0].baseUrl);
    setFormApiKey("");
    setFormIsDefault(providers.length === 0);
    onOpen();
  };

  const handleEdit = (p: AIProviderSetting) => {
    setEditingProvider(p);
    setFormName(p.value.name);
    setFormProvider(p.value.provider);
    setFormBaseUrl(p.value.baseUrl);
    setFormApiKey(p.value.apiKey);
    setFormIsDefault(p.value.isDefault);
    onOpen();
  };

  const handleProviderChange = (key: string) => {
    setFormProvider(key);
    const meta = PROVIDERS.find((p) => p.key === key);

    if (meta && meta.baseUrl) {
      setFormBaseUrl(meta.baseUrl);
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !formBaseUrl.trim() || !formApiKey.trim()) return;
    try {
      setIsSaving(true);
      const providerKey = editingProvider
        ? extractProviderKey(editingProvider.key)
        : formProvider;

      const body: UpsertAIProviderRequest = {
        name: formName.trim(),
        provider: formProvider,
        baseUrl: formBaseUrl.trim(),
        apiKey: formApiKey.trim(),
        isDefault: formIsDefault,
      };

      await settingsService.upsertAIProvider(providerKey, body);
      await loadProviders();
      onClose();
      addToast({
        title: editingProvider ? "Provider updated" : "Provider added",
        description: `"${formName.trim()}" has been saved.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to save provider",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProvider) return;
    try {
      setIsDeleting(true);
      const providerKey = extractProviderKey(deletingProvider.key);

      await settingsService.deleteAIProvider(providerKey);
      await loadProviders();
      onDeleteClose();
      addToast({
        title: "Provider deleted",
        description: `"${deletingProvider.value.name}" has been removed.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      addToast({
        title: "Failed to delete provider",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsDeleting(false);
      setDeletingProvider(null);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const copyApiKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const defaultProvider = providers.find((p) => p.value.isDefault);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-default-400">
          Manage AI providers and system configuration
        </p>
      </div>

      {error && (
        <div
          className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:bg-danger-950/30 dark:text-danger-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* AI Providers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              AI Providers
            </h2>
            <p className="text-xs text-default-400">
              Configure AI models for content generation
            </p>
          </div>
          <Button
            className="font-medium"
            color="primary"
            radius="full"
            size="sm"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleAdd}
          >
            Add Provider
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : !providers.length ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default-300 bg-white p-10 dark:bg-content1">
            <div className="rounded-2xl bg-default-100 p-4">
              <Star className="h-8 w-8 text-default-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                No AI providers configured
              </p>
              <p className="mt-1 text-sm text-default-400">
                Add a provider to enable AI features
              </p>
            </div>
            <Button
              color="primary"
              radius="full"
              size="sm"
              startContent={<Plus className="h-4 w-4" />}
              onPress={handleAdd}
            >
              Add Provider
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {providers.map((p) => {
              const meta = getProviderMeta(p.value.provider);
              const isVisible = visibleKeys.has(p.id);
              const isCopied = copiedId === p.id;

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-default-200 bg-white p-4 dark:bg-content1"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${meta.color}`}
                      >
                        {meta.name}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            {p.value.name}
                          </h3>
                          {p.value.isDefault && (
                            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary dark:bg-primary-950/40">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-default-400">
                          <ExternalLink className="h-3 w-3" />
                          {p.value.baseUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        isIconOnly
                        aria-label="Edit"
                        radius="full"
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(p)}
                      >
                        <Pencil className="h-4 w-4 text-default-400" />
                      </Button>
                      <Button
                        isIconOnly
                        aria-label="Delete"
                        radius="full"
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setDeletingProvider(p);
                          onDeleteOpen();
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>

                  {/* API Key row */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-default-50 px-3 py-2 dark:bg-default-100/30">
                    <span className="text-xs font-medium text-default-400">
                      API Key
                    </span>
                    <code className="flex-1 text-xs text-foreground">
                      {isVisible ? p.value.apiKey : maskApiKey(p.value.apiKey)}
                    </code>
                    <Button
                      isIconOnly
                      aria-label="Toggle visibility"
                      radius="full"
                      size="sm"
                      variant="light"
                      onPress={() => toggleKeyVisibility(p.id)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-3.5 w-3.5 text-default-400" />
                      ) : (
                        <Eye className="h-3.5 w-3.5 text-default-400" />
                      )}
                    </Button>
                    <Button
                      isIconOnly
                      aria-label="Copy API key"
                      radius="full"
                      size="sm"
                      variant="light"
                      onPress={() => copyApiKey(p.id, p.value.apiKey)}
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-default-400" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Default provider info */}
        {defaultProvider && (
          <p className="text-xs text-default-400">
            Default provider:{" "}
            <span className="font-medium text-foreground">
              {defaultProvider.value.name}
            </span>
          </p>
        )}
      </div>

      {/* Translation Prompt Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Translation Prompt
          </h2>
          <p className="text-xs text-default-400">
            System prompt used by AI to generate translations
          </p>
        </div>

        {isLoadingPrompt ? (
          <div className="flex min-h-[120px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-xl border border-default-200 bg-white p-4 dark:bg-content1">
            <div className="mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Prompt Template
              </span>
            </div>
            <Textarea
              maxRows={8}
              minRows={4}
              placeholder="You are a professional translator specializing in language education. Translate the following text to {language}. Keep the tone friendly and natural. Only return the translated text, no explanation."
              size="sm"
              value={promptValue}
              variant="bordered"
              onValueChange={setPromptValue}
            />
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-default-50 px-3 py-2 dark:bg-default-100/30">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-default-400" />
              <p className="text-xs text-default-400">
                Use{" "}
                <code className="rounded bg-default-200 px-1 py-0.5 text-[11px] font-medium text-foreground dark:bg-default-100">
                  {"{language}"}
                </code>{" "}
                as a placeholder for the target language name.
              </p>
            </div>
            {promptValue.trim() !== promptOriginal && (
              <div className="mt-3 flex justify-end">
                <Button
                  color="primary"
                  isDisabled={!promptValue.trim()}
                  isLoading={isSavingPrompt}
                  size="sm"
                  startContent={
                    !isSavingPrompt && <Save className="h-3.5 w-3.5" />
                  }
                  onPress={handleSavePrompt}
                >
                  Save Prompt
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {editingProvider ? "Edit Provider" : "Add AI Provider"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Select
              label="Provider"
              labelPlacement="outside"
              selectedKeys={[formProvider]}
              size="sm"
              variant="bordered"
              onSelectionChange={(keys) => {
                const k = Array.from(keys)[0] as string;

                if (k) handleProviderChange(k);
              }}
            >
              {PROVIDERS.map((p) => (
                <SelectItem key={p.key}>{p.name}</SelectItem>
              ))}
            </Select>
            <Input
              label="Display Name"
              labelPlacement="outside"
              placeholder="e.g. GPT-4o, Gemini Pro"
              size="sm"
              value={formName}
              variant="bordered"
              onValueChange={setFormName}
            />
            <Input
              label="Base URL"
              labelPlacement="outside"
              placeholder="https://api.openai.com/v1"
              size="sm"
              value={formBaseUrl}
              variant="bordered"
              onValueChange={setFormBaseUrl}
            />
            <Input
              label="API Key"
              labelPlacement="outside"
              placeholder="sk-..."
              size="sm"
              type="password"
              value={formApiKey}
              variant="bordered"
              onValueChange={setFormApiKey}
            />
            <div className="flex items-center justify-between rounded-lg bg-default-50 px-3 py-2 dark:bg-default-100/50">
              <div>
                <span className="text-sm text-foreground">Set as default</span>
                <p className="text-xs text-default-400">
                  Used for all AI features by default
                </p>
              </div>
              <Switch
                isSelected={formIsDefault}
                size="sm"
                onValueChange={setFormIsDefault}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              isDisabled={
                !formName.trim() || !formBaseUrl.trim() || !formApiKey.trim()
              }
              isLoading={isSaving}
              size="sm"
              onPress={handleSave}
            >
              {editingProvider ? "Update" : "Add Provider"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} size="sm" onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete Provider</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {deletingProvider?.value.name}
              </span>
              ? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="flat" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              size="sm"
              onPress={handleDelete}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
