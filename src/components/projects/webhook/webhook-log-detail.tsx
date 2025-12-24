import type { WebhookLog } from "@/types/webhook";

import { Copy, Trash2 } from "lucide-react";
import { JsonEditor } from "json-edit-react";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import { useDisclosure } from "@heroui/modal";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { DeleteLogsModal } from "./delete-logs-modal";

import { webhooksService } from "@/services/webhooks.service";

interface WebhookLogDetailProps {
  log: WebhookLog;
  webhookId: string;
  onDelete?: () => void;
}

export function WebhookLogDetail({
  log,
  webhookId,
  onDelete,
}: WebhookLogDetailProps) {
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

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

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return "bg-green-100 text-green-700";
    }
    if (status >= 300 && status < 400) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  const handleDeleteLog = async () => {
    try {
      await webhooksService.deleteLog(webhookId, log.id);
      addToast({
        title: "Log deleted successfully",
        description: "The log has been deleted.",
        color: "success",
        variant: "flat",
      });
      onDelete?.();
      onDeleteModalClose();
    } catch (err) {
      throw err;
    }
  };

  // Parse body if it's JSON
  let parsedBody: unknown = null;

  if (log.body) {
    try {
      parsedBody = JSON.parse(log.body);
    } catch {
      // Not JSON, keep as string
      parsedBody = log.body;
    }
  }

  return (
    <div className="h-full flex flex-col bg-content1 border border-default-200 rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b border-default-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${getMethodColor(
                log.method,
              )}`}
            >
              {log.method}
            </span>
            <span
              className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(
                log.statusCode,
              )}`}
            >
              {log.statusCode}
            </span>
            <span className="text-sm text-default-600">
              {log.processingTimeMs}ms
            </span>
          </div>
          <Button
            isIconOnly
            color="danger"
            size="sm"
            variant="flat"
            onPress={onDeleteModalOpen}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-default-500">Time: </span>
            <span className="font-medium">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-default-500">IP Address: </span>
            <span className="font-medium">{log.ipAddress}</span>
          </div>
          <div>
            <span className="text-default-500">User Agent: </span>
            <span className="font-medium text-xs break-all">
              {log.userAgent}
            </span>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col">
        <Tabs
          aria-label="Log details"
          className="flex flex-col w-[200px]"
          defaultSelectedKey="overview"
        >
          <Tab key="overview" className="flex-1 overflow-auto" title="Overview">
            <div className="p-6">
              <div className="space-y-6">
                {/* Query Parameters */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Query Parameters
                  </h3>
                  {log.queryParams &&
                  Object.keys(log.queryParams).length > 0 ? (
                    <div className="bg-default-50 rounded-lg p-4">
                      <Table removeWrapper aria-label="Query parameters">
                        <TableHeader>
                          <TableColumn>Key</TableColumn>
                          <TableColumn>Value</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(log.queryParams).map(
                            ([key, value]) => (
                              <TableRow key={key}>
                                <TableCell>
                                  <code className="text-xs">{key}</code>
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs break-all">
                                    {String(value)}
                                  </code>
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="bg-default-50 rounded-lg p-4 text-sm text-default-500">
                      No query parameters
                    </div>
                  )}
                </div>

                {/* Headers */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Headers</h3>
                  <div className="bg-default-50 rounded-lg p-4">
                    <Table removeWrapper aria-label="Headers">
                      <TableHeader>
                        <TableColumn>Key</TableColumn>
                        <TableColumn>Value</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(log.headers).map(([key, value]) => (
                          <TableRow
                            key={key}
                            className="border-b border-default-200"
                          >
                            <TableCell>
                              <code>{key}</code>
                            </TableCell>
                            <TableCell>
                              <code className="break-all">{value}</code>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Body */}
                <div>
                  <h3 className="font-semibold mb-2">Body</h3>
                  {log.body ? (
                    <div className="bg-default-50 rounded-lg p-4">
                      {typeof parsedBody === "object" && parsedBody !== null ? (
                        <pre className="overflow-auto max-h-96">
                          {JSON.stringify(parsedBody, null, 2)}
                        </pre>
                      ) : (
                        <pre className="whitespace-pre-wrap break-words">
                          {log.body}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="bg-default-50 rounded-lg p-4 text-sm text-default-500">
                      No body content
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tab>

          <Tab key="json" className="flex-1 overflow-auto" title="JSON">
            <div className="relative h-full">
              <div className="h-full overflow-auto p-6">
                <div className="rounded-lg border border-default-200 bg-default-50 p-4">
                  <JsonEditor
                    className="w-full !max-w-full"
                    data={log}
                    rootName=""
                    showCollectionCount="when-closed"
                  />
                </div>
              </div>
              <Button
                isIconOnly
                className="absolute top-8 right-8 z-10"
                color="primary"
                size="sm"
                variant="flat"
                onPress={() => {
                  copyToClipboard(JSON.stringify(log, null, 2));
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Delete Modal */}
      <DeleteLogsModal
        isDeleteAll={false}
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={handleDeleteLog}
      />
    </div>
  );
}
