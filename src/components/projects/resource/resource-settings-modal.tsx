import type {
  HttpMethod,
  MethodSetting,
  ResourceWithSettings,
  UpdateResourceSettingsRequest,
} from "@/types/project";

import { ScrollShadow } from "@heroui/scroll-shadow";
import { useState, useEffect } from "react";
import {
  Settings,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { addToast } from "@heroui/toast";

import { resourcesService } from "@/services/resources.service";

interface ResourceSettingsModalProps {
  isOpen: boolean;
  resourceId: string | null;
  resourceName?: string;
  projectId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-blue-600",
  POST: "text-green-600",
  PUT: "text-yellow-600",
  PATCH: "text-orange-600",
  DELETE: "text-red-600",
};

const METHOD_BG_COLORS: Record<HttpMethod, string> = {
  GET: "bg-blue-50 dark:bg-blue-950",
  POST: "bg-green-50 dark:bg-green-950",
  PUT: "bg-yellow-50 dark:bg-yellow-950",
  PATCH: "bg-orange-50 dark:bg-orange-950",
  DELETE: "bg-red-50 dark:bg-red-950",
};

export function ResourceSettingsModal({
  isOpen,
  resourceId,
  resourceName,
  projectId,
  onClose,
  onSuccess,
}: ResourceSettingsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [copiedMethod, setCopiedMethod] = useState<HttpMethod | null>(null);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<HttpMethod, MethodSetting>>({
    GET: { enabled: true, delay: 0 },
    POST: { enabled: true, delay: 0 },
    PUT: { enabled: true, delay: 0 },
    PATCH: { enabled: true, delay: 0 },
    DELETE: { enabled: true, delay: 0 },
  });

  useEffect(() => {
    if (isOpen && resourceId) {
      loadResourceSettings();
    }
  }, [isOpen, resourceId]);

  const loadResourceSettings = async () => {
    if (!resourceId) return;

    try {
      setIsFetching(true);
      setError("");

      const resource: ResourceWithSettings =
        await resourcesService.getById(resourceId);

      // Store projectId from resource
      if (resource.projectId) {
        setLoadedProjectId(resource.projectId);
      }

      // Initialize settings from resource.apiSettings or use defaults
      const currentSettings: Record<HttpMethod, MethodSetting> = {
        GET: { enabled: true, delay: 0 },
        POST: { enabled: true, delay: 0 },
        PUT: { enabled: true, delay: 0 },
        PATCH: { enabled: true, delay: 0 },
        DELETE: { enabled: true, delay: 0 },
      };

      if (resource.apiSettings) {
        HTTP_METHODS.forEach((method) => {
          if (resource.apiSettings?.[method]) {
            currentSettings[method] = {
              enabled: resource.apiSettings[method].enabled ?? true,
              delay: resource.apiSettings[method].delay ?? 0,
            };
          }
        });
      }

      setSettings(currentSettings);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resource settings.",
      );
    } finally {
      setIsFetching(false);
    }
  };

  const getMethodUrl = (method: HttpMethod): string => {
    const baseUrl = `${import.meta.env.VITE_API_BASE_MOCK_URL}/pilot`;
    const pid = projectId || loadedProjectId;
    const rn = resourceName;

    if (!pid || !rn) return "";

    // GET and POST use base resource URL
    if (method === "GET" || method === "POST") {
      return `${baseUrl}/${pid}/${rn}`;
    }

    // PUT, PATCH, DELETE require record ID
    return `${baseUrl}/${pid}/${rn}/:id`;
  };

  const handleCopyUrl = async (method: HttpMethod, url: string) => {
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedMethod(method);

      addToast({
        title: "URL copied",
        description: `${method} endpoint URL has been copied to clipboard.`,
        color: "success",
        variant: "flat",
      });

      setTimeout(() => {
        setCopiedMethod(null);
      }, 2000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy URL:", err);
    }
  };

  const handleMethodToggle = (method: HttpMethod, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        enabled,
      },
    }));
  };

  const handleDelayChange = (method: HttpMethod, delay: number) => {
    const clampedDelay = Math.max(0, Math.min(10000, delay));

    setSettings((prev) => ({
      ...prev,
      [method]: {
        ...prev[method],
        delay: clampedDelay,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!resourceId) return;

    // Validate delay values
    for (const method of HTTP_METHODS) {
      const delay = settings[method].delay;

      if (delay < 0 || delay > 10000) {
        setError(
          `Delay for ${method} must be between 0 and 10000 milliseconds.`,
        );

        return;
      }
    }

    try {
      setIsLoading(true);
      setError("");

      // Build request payload - only include methods that have been changed or need to be set
      const payload: UpdateResourceSettingsRequest = {};

      HTTP_METHODS.forEach((method) => {
        payload[method] = {
          enabled: settings[method].enabled,
          delay: settings[method].delay,
        };
      });

      await resourcesService.updateSettings(resourceId, payload);

      addToast({
        title: "Settings updated successfully",
        description: `API settings for "${resourceName || "resource"}" have been updated.`,
        color: "success",
        variant: "flat",
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update settings. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isFetching) {
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="3xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Resource API Settings</h2>
          </div>
          {resourceName && (
            <p className="text-sm text-default-600 font-normal">
              Configure HTTP methods for{" "}
              <span className="font-mono font-semibold">{resourceName}</span>
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-default-600">
                  Loading settings...
                </p>
              </div>
            </div>
          ) : (
            <ScrollShadow>
              {error && (
                <div className="p-3 text-sm text-danger bg-danger-50 border border-danger-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="p-3 bg-default-50 rounded-lg border border-default-200">
                  <p className="text-xs text-default-600">
                    <strong>Note:</strong> Disabled methods will return 404.
                    Delay simulates real API response time (0-10000ms).
                  </p>
                </div>

                {HTTP_METHODS.map((method) => {
                  const methodSetting = settings[method];
                  const isEnabled = methodSetting.enabled;

                  return (
                    <div
                      key={method}
                      className={`p-5 rounded-xl border transition-all border-default-200 bg-content1 hover:border-primary/50
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1.5 rounded-md text-sm font-bold ${
                              METHOD_BG_COLORS[method]
                            } ${METHOD_COLORS[method]}`}
                          >
                            {method}
                          </span>
                          {isEnabled ? (
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-success/10 text-success text-xs font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Enabled
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-default-100 text-default-500 text-xs font-medium">
                              <XCircle className="h-3.5 w-3.5" />
                              Disabled
                            </span>
                          )}
                        </div>
                        <Switch
                          isSelected={isEnabled}
                          size="sm"
                          onValueChange={(enabled) =>
                            handleMethodToggle(method, enabled)
                          }
                        />
                      </div>

                      {/* URL Section - Compact */}
                      {(projectId || loadedProjectId) && resourceName && (
                        <div className=" pb-3 border-default-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-default-500 whitespace-nowrap">
                              URL:
                            </span>
                            <code className="flex-1 text-xs font-mono text-default-600 truncate min-w-0">
                              {getMethodUrl(method) || "Loading..."}
                            </code>
                            <Button
                              isIconOnly
                              className="flex-shrink-0 min-w-fit"
                              size="sm"
                              variant="light"
                              onPress={() =>
                                handleCopyUrl(method, getMethodUrl(method))
                              }
                            >
                              {copiedMethod === method ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-default-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Delay Input - Only show when enabled */}
                      {isEnabled && (
                        <div className="pt-4 border-t border-default-200">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <Clock className="h-4 w-4 text-default-500 flex-shrink-0" />
                              <label
                                className="text-sm font-medium text-default-700"
                                htmlFor={`delay-${method}`}
                              >
                                Response Delay
                              </label>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                className="max-w-[140px]"
                                max={10000}
                                min={0}
                                size="sm"
                                type="number"
                                value={methodSetting.delay.toString()}
                                variant="bordered"
                                onChange={(e) => {
                                  const value =
                                    parseInt(e.target.value, 10) || 0;

                                  handleDelayChange(method, value);
                                }}
                              />
                              <span className="text-xs text-default-500 whitespace-nowrap">
                                ms (0-10000)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollShadow>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            isDisabled={isLoading || isFetching}
            variant="light"
            onPress={handleClose}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={isFetching}
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
