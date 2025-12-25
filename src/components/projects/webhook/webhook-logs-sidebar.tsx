import type { WebhookLog } from "@/types/webhook";

import { useEffect, useState } from "react";
import { RefreshCw, Trash2, Pause, Play } from "lucide-react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { addToast } from "@heroui/toast";
import { Tooltip } from "@heroui/tooltip";

import { DeleteLogsModal } from "./delete-logs-modal";

import { webhooksService } from "@/services/webhooks.service";
import { formatDateTimeCompact } from "@/lib/utils";

interface WebhookLogsSidebarProps {
  webhookId: string;
  selectedLogId: string | null;
  onSelectLog: (log: WebhookLog | null) => void;
  refreshTrigger?: number; // Trigger refresh when this changes
}

export function WebhookLogsSidebar({
  webhookId,
  selectedLogId,
  onSelectLog,
  refreshTrigger,
}: WebhookLogsSidebarProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [hasMore, setHasMore] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [webhookId, page, methodFilter, refreshTrigger]);

  // Auto-refresh logs every 5 seconds
  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const interval = setInterval(() => {
      // Only refresh if we're on page 1 and not currently loading
      if (page === 1 && !isLoading) {
        loadLogs();
      }
    }, 2000); // Refresh every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [isAutoRefreshEnabled, page, isLoading, webhookId, methodFilter]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params: Record<string, unknown> = {
        page,
        limit,
      };

      if (methodFilter !== "all") {
        params.method = methodFilter;
      }

      const response = await webhooksService.getLogs(webhookId, params);

      if (page === 1) {
        setLogs(response.data);
        // Auto-select first log if available and no log is selected
        if (response.data.length > 0 && !selectedLogId) {
          onSelectLog(response.data[0]);
        }
      } else {
        setLogs((prevLogs) => [...prevLogs, ...response.data]);
      }

      setHasMore(response.meta.page < response.meta.totalPages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load webhook logs. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadLogs();
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleDeleteLog = async () => {
    if (!deletingLogId) return;

    try {
      await webhooksService.deleteLog(webhookId, deletingLogId);

      setLogs(logs.filter((log) => log.id !== deletingLogId));
      if (selectedLogId === deletingLogId) {
        onSelectLog(null);
      }
      setIsDeleteModalOpen(false);
      setDeletingLogId(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteAllLogs = async () => {
    try {
      const result = await webhooksService.deleteAllLogs(webhookId);

      setLogs([]);
      onSelectLog(null);
      setIsDeleteAllModalOpen(false);
      addToast({
        title: "All logs deleted",
        description: `${result.deletedCount} log(s) have been deleted.`,
        color: "success",
        variant: "flat",
      });
    } catch (err) {
      throw err;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-700";
      case "POST":
        return "bg-green-100 text-green-700";
      case "PUT":
        return "bg-yellow-100 text-yellow-700";
      case "PATCH":
        return "bg-purple-100 text-purple-700";
      case "DELETE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-default-100 text-default-700";
    }
  };

  return (
    <div className="h-full max-h-[calc(100vh-60px)] flex flex-col bg-content1 border border-default-200 rounded-2xl overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-default-200 sticky top-0 bg-content1 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold">Logs</h3>
            {isAutoRefreshEnabled && (
              <div className="w-[6px] h-[6px] bg-green-500 rounded-full animate-ping ml-2" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip
              content={
                isAutoRefreshEnabled
                  ? "Pause auto-refresh"
                  : "Resume auto-refresh"
              }
            >
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="light"
                onPress={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
              >
                {isAutoRefreshEnabled ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </Tooltip>
            {logs.length > 0 && (
              <Tooltip content="Delete all logs">
                <Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => setIsDeleteAllModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            <Tooltip content="Refresh">
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="light"
                onPress={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
        <Select
          className="w-full !cursor-pointer"
          label="Filter by method"
          selectedKeys={[methodFilter]}
          size="sm"
          variant="bordered"
          onSelectionChange={(keys) => {
            const method = Array.from(keys)[0] as string;

            setMethodFilter(method);
            setPage(1);
            setLogs([]); // Clear logs when filter changes
          }}
        >
          <SelectItem key="all">All Methods</SelectItem>
          <SelectItem key="GET">GET</SelectItem>
          <SelectItem key="POST">POST</SelectItem>
          <SelectItem key="PUT">PUT</SelectItem>
          <SelectItem key="PATCH">PATCH</SelectItem>
          <SelectItem key="DELETE">DELETE</SelectItem>
        </Select>
      </div>

      {/* Logs List */}
      <ScrollShadow className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg m-4">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <p className="text-sm text-default-600">
              No logs yet. Send a request to your webhook URL to see logs here.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {logs.map((log) => (
              <button
                key={log.id}
                className={`cursor-pointer group relative w-full p-3 border rounded-lg mb-2 transition-all ${
                  selectedLogId === log.id
                    ? "bg-primary/10 border-1 border-primary"
                    : "bg-default-50 border border-default-200 hover:border-primary/50"
                }`}
                onClick={() => onSelectLog(log)}
              >
                <div className="w-full text-left cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getMethodColor(
                        log.method,
                      )}`}
                    >
                      {log.method}
                    </span>
                    <span className="text-xs text-default-500">
                      {formatDateTimeCompact(log.createdAt)}
                    </span>
                  </div>
                  <div className="text-xs text-default-600 font-mono truncate">
                    {log.id}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-default-500">
                    <span>{log.statusCode}</span>
                    <span>•</span>
                    <span>{log.processingTimeMs}ms</span>
                  </div>
                </div>
                <Tooltip content="Delete log">
                  <Button
                    isIconOnly
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => {
                      setDeletingLogId(log.id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </button>
            ))}
            {hasMore && (
              <div className="p-2">
                <Button
                  className="w-full"
                  color="default"
                  isLoading={isLoading}
                  size="sm"
                  variant="bordered"
                  onPress={handleLoadMore}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollShadow>

      {/* Delete Modals */}
      <DeleteLogsModal
        isDeleteAll={false}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingLogId(null);
        }}
        onConfirm={handleDeleteLog}
      />

      <DeleteLogsModal
        isDeleteAll={true}
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAllLogs}
      />
    </div>
  );
}
