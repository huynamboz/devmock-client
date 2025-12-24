import type { Webhook, WebhookLog } from "@/types/webhook";

import { useEffect, useState } from "react";
import {
  Copy,
  Database,
  FileJson,
  Loader2,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { JsonEditor } from "json-edit-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

import { webhooksService } from "@/services/webhooks.service";

interface WebhookLogsModalProps {
  isOpen: boolean;
  webhook: Webhook | null;
  onClose: () => void;
}

export function WebhookLogsModal({
  isOpen,
  webhook,
  onClose,
}: WebhookLogsModalProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [methodFilter, setMethodFilter] = useState<string>("all");

  useEffect(() => {
    if (isOpen && webhook) {
      loadLogs();
    } else {
      setLogs([]);
      setSelectedLog(null);
      setError("");
      setPage(1);
    }
  }, [isOpen, webhook, page, limit, methodFilter]);

  const loadLogs = async () => {
    if (!webhook) return;

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

      const response = await webhooksService.getLogs(webhook.id, params);

      setLogs(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
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

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        title: "Copied to clipboard",
        description: "Content has been copied.",
        color: "success",
        variant: "flat",
      });
    } catch {
      addToast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        color: "danger",
        variant: "flat",
      });
    }
  };

  if (!webhook) return null;

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="5xl"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Webhook Logs</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            View all requests received by &quot;{webhook.name}&quot;
          </p>
        </ModalHeader>
        <ModalBody>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <Select
              className="w-[150px]"
              label="Method"
              selectedKeys={[methodFilter]}
              size="sm"
              variant="bordered"
              onSelectionChange={(keys) => {
                const method = Array.from(keys)[0] as string;
                setMethodFilter(method);
                setPage(1);
              }}
            >
              <SelectItem key="all">All Methods</SelectItem>
              <SelectItem key="GET">GET</SelectItem>
              <SelectItem key="POST">POST</SelectItem>
              <SelectItem key="PUT">PUT</SelectItem>
              <SelectItem key="PATCH">PATCH</SelectItem>
              <SelectItem key="DELETE">DELETE</SelectItem>
            </Select>
            <div className="flex-1" />
            <Button
              color="default"
              size="sm"
              startContent={<RefreshCw className="h-4 w-4" />}
              variant="flat"
              onPress={loadLogs}
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-default-100 p-6 mb-4">
                <Database className="h-12 w-12 text-default-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No logs yet</h3>
              <p className="text-default-600 max-w-md text-sm">
                Send a request to your webhook URL to see logs here.
              </p>
            </div>
          ) : (
            <Tabs
              aria-label="View options"
              className="flex-1"
              defaultSelectedKey="table"
            >
              <Tab
                key="table"
                title={
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-4 w-4" />
                    <span>Table</span>
                  </div>
                }
              >
                <div className="overflow-x-auto mt-4">
                  <Table
                    isStriped
                    removeWrapper
                    aria-label="Webhook logs table"
                    classNames={{
                      wrapper: "min-h-[222px]",
                    }}
                    selectionMode="single"
                    selectedKeys={
                      selectedLog ? new Set([selectedLog.id]) : new Set()
                    }
                    onSelectionChange={(keys) => {
                      const selectedId = Array.from(keys)[0] as string;
                      const log = logs.find((l) => l.id === selectedId);
                      setSelectedLog(log || null);
                    }}
                  >
                    <TableHeader>
                      <TableColumn>Method</TableColumn>
                      <TableColumn>Status</TableColumn>
                      <TableColumn>Time</TableColumn>
                      <TableColumn>IP Address</TableColumn>
                      <TableColumn>User Agent</TableColumn>
                      <TableColumn>Processing Time</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No logs found">
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                log.method === "GET"
                                  ? "bg-blue-100 text-blue-700"
                                  : log.method === "POST"
                                    ? "bg-green-100 text-green-700"
                                    : log.method === "PUT"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : log.method === "PATCH"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-red-100 text-red-700"
                              }`}
                            >
                              {log.method}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                log.statusCode >= 200 && log.statusCode < 300
                                  ? "bg-green-100 text-green-700"
                                  : log.statusCode >= 300 && log.statusCode < 400
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {log.statusCode}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>{log.ipAddress}</TableCell>
                          <TableCell>
                            <div
                              className="max-w-[200px] truncate"
                              title={log.userAgent}
                            >
                              {log.userAgent}
                            </div>
                          </TableCell>
                          <TableCell>{log.processingTimeMs}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-default-600">
                      Showing {(page - 1) * limit + 1} to{" "}
                      {Math.min(page * limit, total)} of {total} logs
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        color="default"
                        isDisabled={page === 1}
                        size="sm"
                        variant="bordered"
                        onPress={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-default-600">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        color="default"
                        isDisabled={page === totalPages}
                        size="sm"
                        variant="bordered"
                        onPress={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Tab>
              {selectedLog && (
                <Tab
                  key="details"
                  title={
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      <span>Log Details</span>
                    </div>
                  }
                >
                  <div className="relative flex-1 mt-4">
                    <div className="overflow-auto rounded-lg border border-default-200 bg-default-50 p-4 max-h-[500px]">
                      <JsonEditor
                        className="w-full !max-w-full"
                        data={selectedLog}
                        rootName=""
                        showCollectionCount="when-closed"
                      />
                    </div>
                    <Button
                      isIconOnly
                      className="absolute top-2 right-2 z-10"
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        copyToClipboard(JSON.stringify(selectedLog, null, 2));
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </Tab>
              )}
            </Tabs>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
          {!isLoading && logs.length > 0 && (
            <Button color="primary" onPress={loadLogs}>
              Refresh
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

