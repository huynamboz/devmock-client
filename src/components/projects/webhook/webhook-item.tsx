import type { Webhook } from "@/types/webhook";

import { useState } from "react";
import {
  Copy,
  Edit,
  Eye,
  Send,
  Trash2,
  Webhook as WebhookIcon,
  Check,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";

interface WebhookItemProps {
  webhook: Webhook;
  isCopied: boolean;
  onCopy: (webhookId: string) => void;
  onEdit: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
  onViewLogs: (webhook: Webhook) => void;
  onTest: (webhook: Webhook) => void;
}

export function WebhookItem({
  webhook,
  isCopied,
  onCopy,
  onEdit,
  onDelete,
  onViewLogs,
  onTest,
}: WebhookItemProps) {
  const handleItemClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.closest("a")
    ) {
      return;
    }
    onViewLogs(webhook);
  };

  return (
    <div
      className="bg-content1 border border-primary/20 rounded-2xl p-4 hover:border-primary hover:shadow-sm transition-all duration-200 cursor-pointer"
      onClick={handleItemClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onViewLogs(webhook);
        }
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Icon & Name */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              <WebhookIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {webhook.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    webhook.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-default-100 text-default-600"
                  }`}
                >
                  {webhook.status}
                </span>
              </div>
              {webhook.description && (
                <p className="text-xs text-default-500 line-clamp-1 mb-2">
                  {webhook.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-default-500">
                <p className="font-mono truncate max-md:max-w-[200px]">
                  {webhook.url}
                </p>
                <Button
                  color="primary"
                  size="sm"
                  startContent={
                    isCopied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                  variant="light"
                  onPress={() => onCopy(webhook.id)}
                >
                  {isCopied ? "Copied" : "Copy URL"}
                </Button>
              </div>
              {webhook.lastActivityAt && (
                <p className="text-xs text-default-400 mt-1">
                  Last activity: {new Date(webhook.lastActivityAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tooltip content="Test webhook">
              <Button
                isIconOnly
                color="primary"
                size="sm"
                variant="light"
                onPress={() => onTest(webhook)}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip content="View logs">
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="light"
                onPress={() => onViewLogs(webhook)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip content="Edit webhook">
              <Button
                isIconOnly
                color="default"
                size="sm"
                variant="light"
                onPress={() => onEdit(webhook)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip content="Delete webhook">
              <Button
                isIconOnly
                color="danger"
                size="sm"
                variant="light"
                onPress={() => onDelete(webhook)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}

