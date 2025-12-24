import type { Webhook, TestWebhookRequest } from "@/types/webhook";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { Send } from "lucide-react";

interface TestWebhookModalProps {
  isOpen: boolean;
  webhook: Webhook | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TestWebhookModal({
  isOpen,
  webhook,
  onClose,
  onSuccess,
}: TestWebhookModalProps) {
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("POST");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  const [queryParams, setQueryParams] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    data: unknown;
    headers: Record<string, string>;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!webhook) return;

    try {
      setIsSending(true);
      setError("");
      setResponse(null);

      // Parse headers
      const headersObj: Record<string, string> = {};
      if (headers.trim()) {
        headers.split("\n").forEach((line) => {
          const [key, ...valueParts] = line.split(":");
          if (key && valueParts.length > 0) {
            headersObj[key.trim()] = valueParts.join(":").trim();
          }
        });
      }

      // Parse query params
      const queryParamsObj: Record<string, string> = {};
      if (queryParams.trim()) {
        queryParams.split("&").forEach((param) => {
          const [key, value] = param.split("=");
          if (key) {
            queryParamsObj[decodeURIComponent(key.trim())] = decodeURIComponent(
              (value || "").trim(),
            );
          }
        });
      }

      // Build URL
      const baseUrl = webhook.url;
      const url = new URL(baseUrl);
      Object.keys(queryParamsObj).forEach((key) => {
        url.searchParams.append(key, queryParamsObj[key]);
      });

      // Send request
      const fetchOptions: RequestInit = {
        method,
        headers: headersObj,
      };

      if (method !== "GET" && body.trim()) {
        // Try to parse as JSON, if fails use as text
        try {
          JSON.parse(body);
          fetchOptions.body = body;
          if (!headersObj["Content-Type"]) {
            headersObj["Content-Type"] = "application/json";
          }
        } catch {
          fetchOptions.body = body;
        }
      }

      const res = await fetch(url.toString(), fetchOptions);
      const responseData = await res.json();

      setResponse({
        status: res.status,
        data: responseData,
        headers: Object.fromEntries(res.headers.entries()),
      });

      addToast({
        title: "Request sent successfully",
        description: `Webhook received the ${method} request.`,
        color: "success",
        variant: "flat",
      });

      onSuccess?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send request.";
      setError(errorMessage);
      addToast({
        title: "Failed to send request",
        description: errorMessage,
        color: "danger",
        variant: "flat",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setMethod("POST");
    setHeaders("");
    setBody("");
    setQueryParams("");
    setResponse(null);
    setError("");
    onClose();
  };

  if (!webhook) return null;

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
            <Send className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Test Webhook</h2>
          </div>
          <p className="text-sm text-default-600 font-normal">
            Send a test request to &quot;{webhook.name}&quot;
          </p>
        </ModalHeader>
        <ModalBody>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Select
                className="w-[150px]"
                label="Method"
                selectedKeys={[method]}
                size="sm"
                variant="bordered"
                onSelectionChange={(keys) => {
                  const m = Array.from(keys)[0] as string;
                  setMethod(m as typeof method);
                }}
              >
                <SelectItem key="GET">GET</SelectItem>
                <SelectItem key="POST">POST</SelectItem>
                <SelectItem key="PUT">PUT</SelectItem>
                <SelectItem key="PATCH">PATCH</SelectItem>
                <SelectItem key="DELETE">DELETE</SelectItem>
              </Select>
              <div className="flex-1">
                <Input
                  label="Webhook URL"
                  value={webhook.url}
                  variant="bordered"
                  isReadOnly
                  size="sm"
                  description="This is your webhook URL"
                />
              </div>
            </div>

            <Input
              label="Query Parameters"
              placeholder="key1=value1&key2=value2"
              size="sm"
              value={queryParams}
              variant="bordered"
              onChange={(e) => setQueryParams(e.target.value)}
              description="Optional query parameters (format: key=value&key2=value2)"
            />

            <Textarea
              label="Headers"
              placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
              size="sm"
              value={headers}
              variant="bordered"
              onChange={(e) => setHeaders(e.target.value)}
              description="One header per line (format: Key: Value)"
              minRows={3}
            />

            {method !== "GET" && (
              <Textarea
                label="Body"
                placeholder='{"key": "value"}'
                size="sm"
                value={body}
                variant="bordered"
                onChange={(e) => setBody(e.target.value)}
                description="Request body (JSON or text)"
                minRows={5}
              />
            )}

            {response && (
              <div className="mt-4 p-4 bg-default-50 rounded-lg border border-default-200">
                <h3 className="text-sm font-semibold mb-2">Response</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-default-500">Status: </span>
                    <span
                      className={`text-xs font-semibold ${
                        response.status >= 200 && response.status < 300
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {response.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-default-500">Response: </span>
                    <pre className="text-xs mt-1 p-2 bg-default-100 rounded overflow-auto max-h-[200px]">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose}>
            Close
          </Button>
          <Button
            color="primary"
            isLoading={isSending}
            startContent={!isSending ? <Send className="h-4 w-4" /> : undefined}
            onPress={handleSend}
          >
            {isSending ? "Sending..." : "Send Request"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

