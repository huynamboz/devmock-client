import type { Webhook } from "@/types/webhook";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Webhook as WebhookIcon } from "lucide-react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import DefaultLayout from "@/layouts/default";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { webhooksService } from "@/services/webhooks.service";
import { CreateWebhookModal } from "@/components/projects/webhook/create-webhook-modal";
import { WebhookItem } from "@/components/projects/webhook/webhook-item";
import { EditWebhookModal } from "@/components/projects/webhook/edit-webhook-modal";
import { DeleteWebhookModal } from "@/components/projects/webhook/delete-webhook-modal";

export default function WebhooksPage() {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedWebhookId, setCopiedWebhookId] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await webhooksService.getAll();

      setWebhooks(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load webhooks. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (webhook: Webhook) => {
    setWebhooks([...webhooks, webhook]);
  };

  const handleEditSuccess = (updatedWebhook: Webhook) => {
    setWebhooks(
      webhooks.map((w) => (w.id === updatedWebhook.id ? updatedWebhook : w)),
    );
  };

  const handleDeleteSuccess = () => {
    if (selectedWebhook) {
      setWebhooks(webhooks.filter((w) => w.id !== selectedWebhook.id));
      setSelectedWebhook(null);
    }
  };

  const handleCopy = async (webhookId: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId);

    if (!webhook) return;

    try {
      await navigator.clipboard.writeText(webhook.url);
      setCopiedWebhookId(webhookId);
      setTimeout(() => {
        setCopiedWebhookId(null);
      }, 2000);

      addToast({
        title: "Copied to clipboard",
        description: "Webhook URL has been copied.",
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

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsEditModalOpen(true);
  };

  const handleDelete = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteModalOpen(true);
  };

  const handleViewLogs = (webhook: Webhook) => {
    navigate(`/webhooks/${webhook.id}`);
  };

  const handleTest = (webhook: Webhook) => {
    // Navigate to detail page for testing
    navigate(`/webhooks/${webhook.id}`);
  };

  return (
    <DefaultLayout>
      <div className="background-grid flex-grow">
        <BackgroundRippleEffect cellSize={50} />
        <div className="container relative z-10 mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <WebhookIcon className="h-6 w-6 text-primary" />
                  Webhooks
                </h2>
                <p className="text-sm text-default-600 mt-1">
                  Create webhooks to receive and log HTTP requests for testing
                </p>
              </div>
              <Button
                color="primary"
                startContent={<Plus className="h-4 w-4" />}
                onPress={() => setIsCreateModalOpen(true)}
              >
                Create Webhook
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-default-600">Loading webhooks...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            ) : webhooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-default-100 p-6 mb-4">
                  <WebhookIcon className="h-12 w-12 text-default-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No webhooks yet</h3>
                <p className="text-default-600 max-w-md text-sm mb-4">
                  Create your first webhook to start receiving and logging HTTP
                  requests.
                </p>
                <Button
                  color="primary"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={() => setIsCreateModalOpen(true)}
                >
                  Create Webhook
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {webhooks.map((webhook) => (
                  <WebhookItem
                    key={webhook.id}
                    isCopied={copiedWebhookId === webhook.id}
                    webhook={webhook}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onTest={handleTest}
                    onViewLogs={handleViewLogs}
                  />
                ))}
              </div>
            )}

            {/* Modals */}
            <CreateWebhookModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={handleCreateSuccess}
            />

            <EditWebhookModal
              isOpen={isEditModalOpen}
              webhook={selectedWebhook}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedWebhook(null);
              }}
              onSuccess={handleEditSuccess}
            />

            <DeleteWebhookModal
              isOpen={isDeleteModalOpen}
              webhook={selectedWebhook}
              onClose={() => {
                setIsDeleteModalOpen(false);
                setSelectedWebhook(null);
              }}
              onSuccess={handleDeleteSuccess}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
