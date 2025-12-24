import type { Webhook, WebhookLog } from "@/types/webhook";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Webhook as WebhookIcon } from "lucide-react";
import { Button } from "@heroui/button";

import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { webhooksService } from "@/services/webhooks.service";
import { WebhookLogsSidebar } from "@/components/projects/webhook/webhook-logs-sidebar";
import { WebhookLogDetail } from "@/components/projects/webhook/webhook-log-detail";
import { TestWebhookModal } from "@/components/projects/webhook/test-webhook-modal";

export default function WebhookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [webhook, setWebhook] = useState<Webhook | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      loadWebhook();
    }
  }, [id]);

  const loadWebhook = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");

      const data = await webhooksService.getById(id);

      setWebhook(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load webhook. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSuccess = () => {
    // Trigger refresh of logs in sidebar
    setRefreshTrigger((prev) => prev + 1);
    setIsTestModalOpen(false);
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="background-grid flex-grow">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-default-600">Loading webhook...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !webhook) {
    return (
      <DefaultLayout>
        <div className="background-grid flex-grow">
          <div className="container relative z-10 mx-auto px-6 py-8">
            <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!webhook) {
    return null;
  }

  return (
    <DefaultLayout>
      <div className="background-grid flex-grow">
        <BackgroundRippleEffect cellSize={50} />
        <div className=" relative z-10 mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              className="mb-4"
              color="primary"
              size="sm"
              startContent={<ArrowLeft size={16} />}
              variant="flat"
              onPress={() => navigate("/webhooks")}
            >
              Back to Webhooks
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-3">
                  <WebhookIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{webhook.name}</h1>
                  {webhook.description && (
                    <p className="text-sm text-default-600 mt-1">
                      {webhook.description}
                    </p>
                  )}
                  <p className="text-xs text-default-500 mt-1 font-mono">
                    {webhook.url}
                  </p>
                </div>
              </div>
              <Button color="primary" onPress={() => setIsTestModalOpen(true)}>
                Test Webhook
              </Button>
            </div>
          </div>

          {/* Main Content: Sidebar + Detail */}
          <div className="flex gap-6 ">
            {/* Sidebar - Logs List */}
            <div className="w-80 h-fit max-h-screen sticky top-6 right-0">
              <WebhookLogsSidebar
                refreshTrigger={refreshTrigger}
                selectedLogId={selectedLog?.id || null}
                webhookId={webhook.id}
                onSelectLog={setSelectedLog}
              />
            </div>

            {/* Main Area - Log Detail */}
            <div className="flex-1 min-w-0">
              {selectedLog ? (
                <WebhookLogDetail
                  log={selectedLog}
                  webhookId={webhook.id}
                  onDelete={() => {
                    setSelectedLog(null);
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="rounded-full bg-default-100 p-6 mb-4">
                    <WebhookIcon className="h-12 w-12 text-default-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No log selected
                  </h3>
                  <p className="text-default-600 max-w-md text-sm">
                    Select a log from the sidebar to view its details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Test Webhook Modal */}
          <TestWebhookModal
            isOpen={isTestModalOpen}
            webhook={webhook}
            onClose={() => setIsTestModalOpen(false)}
            onSuccess={handleTestSuccess}
          />
        </div>
      </div>
    </DefaultLayout>
  );
}
