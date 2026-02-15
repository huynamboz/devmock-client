import { useState, useCallback } from "react";
import {
  Send,
  Copy,
  Check,
  Trash2,
  Clock,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

import { apiClient } from "@/lib/api-client";
import { API_CONFIG } from "@/config/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface HistoryEntry {
  id: string;
  method: HttpMethod;
  endpoint: string;
  status: number | null;
  time: number;
  timestamp: number;
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  POST: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  PUT: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  PATCH:
    "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/40",
  DELETE: "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
};

const STATUS_COLORS: Record<string, string> = {
  "2": "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40",
  "3": "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
  "4": "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
  "5": "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40",
};

function getStatusColor(status: number): string {
  return STATUS_COLORS[String(status)[0]] || "text-default-500 bg-default-100";
}

function formatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function AdminDevelopmentPage() {
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [endpoint, setEndpoint] = useState("");
  const [body, setBody] = useState("");
  const [headers, setHeaders] = useState("");
  const [queryParams, setQueryParams] = useState("");

  const [response, setResponse] = useState("");
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"body" | "headers" | "params">(
    "body",
  );
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");

  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const accessToken = apiClient.getAccessToken() || "";
  const refreshToken = apiClient.getRefreshToken() || "";

  const copyToClipboard = useCallback(async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  const handleSend = async () => {
    if (!endpoint.trim()) {
      setError("Endpoint is required");

      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");
    setResponseStatus(null);
    setResponseTime(null);
    setResponseHeaders("");

    const start = performance.now();

    try {
      // Parse custom headers
      let customHeaders: Record<string, string> = {};

      if (headers.trim()) {
        try {
          customHeaders = JSON.parse(headers);
        } catch {
          setError("Invalid headers JSON");
          setIsLoading(false);

          return;
        }
      }

      // Parse query params
      let params: Record<string, string> | undefined;

      if (queryParams.trim()) {
        try {
          params = JSON.parse(queryParams);
        } catch {
          setError("Invalid query params JSON");
          setIsLoading(false);

          return;
        }
      }

      // Parse body
      let parsedBody: unknown = undefined;

      if (body.trim() && method !== "GET" && method !== "DELETE") {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          setError("Invalid body JSON");
          setIsLoading(false);

          return;
        }
      }

      const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

      const config = {
        headers: customHeaders,
        params,
      };

      let res;

      switch (method) {
        case "GET":
          res = await apiClient.get(path, config);
          break;
        case "POST":
          res = await apiClient.post(path, parsedBody, config);
          break;
        case "PUT":
          res = await apiClient.put(path, parsedBody, config);
          break;
        case "PATCH":
          res = await apiClient.patch(path, parsedBody, config);
          break;
        case "DELETE":
          res = await apiClient.delete(path, config);
          break;
      }

      const elapsed = Math.round(performance.now() - start);

      setResponse(JSON.stringify(res.data, null, 2));
      setResponseStatus(res.status);
      setResponseTime(elapsed);
      setResponseHeaders(JSON.stringify(res.headers, null, 2));

      // Add to history
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          method,
          endpoint: path,
          status: res.status,
          time: elapsed,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - start);

      setResponseTime(elapsed);

      if (err instanceof Error) {
        setError(err.message);
        setResponse("");
        setResponseStatus(null);
      }

      // Add failed entry
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          method,
          endpoint: endpoint.startsWith("/") ? endpoint : `/${endpoint}`,
          status: null,
          time: elapsed,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setMethod(entry.method);
    setEndpoint(entry.endpoint);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Development
        </h1>
        <p className="mt-1 text-sm text-default-500">
          API tester &bull; Base URL: {API_CONFIG.baseURL}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        {/* ===== MAIN ===== */}
        <div className="space-y-4">
          {/* Tokens */}
          <div className="rounded-2xl border border-default-200 bg-white p-4 dark:bg-content1">
            <div className="mb-3 flex items-center gap-2">
              <Key className="h-4 w-4 text-default-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-default-500">
                Tokens
              </h2>
            </div>
            <div className="space-y-2">
              {/* Access token */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs font-medium text-default-500">
                  Access
                </span>
                <div className="relative flex-1">
                  <input
                    readOnly
                    className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-1.5 font-mono text-xs text-foreground outline-none dark:bg-default-100/50"
                    type={showAccessToken ? "text" : "password"}
                    value={accessToken}
                  />
                </div>
                <Button
                  isIconOnly
                  aria-label="Toggle visibility"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => setShowAccessToken(!showAccessToken)}
                >
                  {showAccessToken ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  isIconOnly
                  aria-label="Copy"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => copyToClipboard(accessToken, "access")}
                >
                  {copiedField === "access" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              {/* Refresh token */}
              <div className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs font-medium text-default-500">
                  Refresh
                </span>
                <div className="relative flex-1">
                  <input
                    readOnly
                    className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-1.5 font-mono text-xs text-foreground outline-none dark:bg-default-100/50"
                    type={showRefreshToken ? "text" : "password"}
                    value={refreshToken}
                  />
                </div>
                <Button
                  isIconOnly
                  aria-label="Toggle visibility"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => setShowRefreshToken(!showRefreshToken)}
                >
                  {showRefreshToken ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  isIconOnly
                  aria-label="Copy"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => copyToClipboard(refreshToken, "refresh")}
                >
                  {copiedField === "refresh" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Request builder */}
          <div className="rounded-2xl border border-default-200 bg-white p-4 dark:bg-content1">
            {/* Method + Endpoint + Send */}
            <div className="flex gap-2">
              <Select
                aria-label="HTTP Method"
                classNames={{
                  base: "w-[130px] shrink-0",
                  trigger: "h-10",
                  value: "font-semibold text-sm",
                }}
                selectedKeys={[method]}
                size="sm"
                variant="bordered"
                onSelectionChange={(keys) => {
                  const k = Array.from(keys)[0] as HttpMethod;

                  if (k) setMethod(k);
                }}
              >
                {(["GET", "POST", "PUT", "PATCH", "DELETE"] as const).map(
                  (m) => (
                    <SelectItem key={m} textValue={m}>
                      <span
                        className={`font-semibold ${METHOD_COLORS[m].split(" ").slice(0, 1).join(" ")}`}
                      >
                        {m}
                      </span>
                    </SelectItem>
                  ),
                )}
              </Select>
              <Input
                classNames={{
                  inputWrapper: "h-10",
                  input: "font-mono text-sm",
                }}
                placeholder="/admin/speaking/topics"
                size="sm"
                value={endpoint}
                variant="bordered"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) handleSend();
                }}
                onValueChange={setEndpoint}
              />
              <Button
                className="shrink-0 font-medium"
                color="primary"
                isLoading={isLoading}
                radius="lg"
                size="md"
                startContent={!isLoading && <Send className="h-4 w-4" />}
                onPress={handleSend}
              >
                Send
              </Button>
            </div>

            {/* Request tabs */}
            <div className="mt-3 flex gap-1 border-b border-default-100">
              {(
                [
                  { key: "body", label: "Body" },
                  { key: "headers", label: "Headers" },
                  { key: "params", label: "Params" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  className={`border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-default-400 hover:text-default-600"
                  }`}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="mt-3">
              {activeTab === "body" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-default-400">
                      JSON body
                    </span>
                    {body.trim() && (
                      <button
                        className="text-[11px] text-primary hover:underline"
                        type="button"
                        onClick={() => setBody(formatJson(body))}
                      >
                        Format
                      </button>
                    )}
                  </div>
                  <Textarea
                    classNames={{
                      input: "font-mono text-xs",
                      inputWrapper:
                        "bg-default-50 dark:bg-default-100/50 border-default-200",
                    }}
                    maxRows={10}
                    minRows={4}
                    placeholder='{ "key": "value" }'
                    value={body}
                    variant="bordered"
                    onValueChange={setBody}
                  />
                </div>
              )}
              {activeTab === "headers" && (
                <div>
                  <span className="mb-1 block text-[11px] text-default-400">
                    Custom headers (JSON object)
                  </span>
                  <Textarea
                    classNames={{
                      input: "font-mono text-xs",
                      inputWrapper:
                        "bg-default-50 dark:bg-default-100/50 border-default-200",
                    }}
                    maxRows={6}
                    minRows={3}
                    placeholder='{ "X-Custom-Header": "value" }'
                    value={headers}
                    variant="bordered"
                    onValueChange={setHeaders}
                  />
                </div>
              )}
              {activeTab === "params" && (
                <div>
                  <span className="mb-1 block text-[11px] text-default-400">
                    Query parameters (JSON object)
                  </span>
                  <Textarea
                    classNames={{
                      input: "font-mono text-xs",
                      inputWrapper:
                        "bg-default-50 dark:bg-default-100/50 border-default-200",
                    }}
                    maxRows={6}
                    minRows={3}
                    placeholder='{ "page": "1", "limit": "10" }'
                    value={queryParams}
                    variant="bordered"
                    onValueChange={setQueryParams}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          <div className="rounded-2xl border border-default-200 bg-white dark:bg-content1">
            {/* Response header */}
            <div className="flex items-center justify-between border-b border-default-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500">
                  Response
                </h3>
                {responseStatus !== null && (
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${getStatusColor(responseStatus)}`}
                  >
                    {responseStatus}
                  </span>
                )}
                {responseTime !== null && (
                  <span className="flex items-center gap-1 text-[11px] text-default-400">
                    <Clock className="h-3 w-3" />
                    {responseTime}ms
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {(
                  [
                    { key: "body", label: "Body" },
                    { key: "headers", label: "Headers" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                      responseTab === tab.key
                        ? "bg-default-100 text-foreground"
                        : "text-default-400 hover:text-default-600"
                    }`}
                    type="button"
                    onClick={() => setResponseTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
                {response && (
                  <Button
                    isIconOnly
                    aria-label="Copy response"
                    radius="full"
                    size="sm"
                    variant="light"
                    onPress={() =>
                      copyToClipboard(
                        responseTab === "body" ? response : responseHeaders,
                        "response",
                      )
                    }
                  >
                    {copiedField === "response" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Response body */}
            <div className="max-h-[500px] overflow-auto p-4">
              {error ? (
                <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:bg-danger-950/30">
                  <p className="text-sm font-medium text-danger-700 dark:text-danger-400">
                    {error}
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : response || responseHeaders ? (
                <pre className="whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-foreground">
                  {responseTab === "body" ? response : responseHeaders}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Send className="h-8 w-8 text-default-200" />
                  <p className="mt-3 text-sm text-default-400">
                    Send a request to see the response
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== SIDEBAR: History ===== */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-default-200 bg-white dark:bg-content1">
            <div className="flex items-center justify-between border-b border-default-100 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-default-500">
                History
              </h3>
              {history.length > 0 && (
                <Button
                  isIconOnly
                  aria-label="Clear history"
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={() => setHistory([])}
                >
                  <Trash2 className="h-3.5 w-3.5 text-default-400" />
                </Button>
              )}
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {!history.length ? (
                <div className="px-4 py-8 text-center">
                  <Clock className="mx-auto h-6 w-6 text-default-200" />
                  <p className="mt-2 text-xs text-default-400">
                    No history yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-default-100">
                  {history.map((entry) => (
                    <button
                      key={entry.id}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-default-50"
                      type="button"
                      onClick={() => loadFromHistory(entry)}
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${METHOD_COLORS[entry.method]}`}
                      >
                        {entry.method}
                      </span>
                      <span className="flex-1 truncate font-mono text-[11px] text-foreground">
                        {entry.endpoint}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {entry.status ? (
                          <span
                            className={`rounded px-1 py-0.5 text-[10px] font-bold ${getStatusColor(entry.status)}`}
                          >
                            {entry.status}
                          </span>
                        ) : (
                          <span className="rounded bg-danger-50 px-1 py-0.5 text-[10px] font-bold text-danger-500 dark:bg-danger-950/40">
                            ERR
                          </span>
                        )}
                        <span className="text-[10px] text-default-300">
                          {entry.time}ms
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick endpoints */}
          <div className="rounded-2xl border border-default-200 bg-white p-4 dark:bg-content1">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-default-500">
              Quick Endpoints
            </h3>
            <div className="flex flex-col gap-1">
              {[
                { method: "GET" as HttpMethod, path: "/auth/me" },
                { method: "GET" as HttpMethod, path: "/admin/speaking/topics" },
                {
                  method: "GET" as HttpMethod,
                  path: "/admin/speaking/lessons",
                },
                { method: "GET" as HttpMethod, path: "/admin/speaking/items" },
              ].map((item) => (
                <button
                  key={`${item.method}-${item.path}`}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-default-50"
                  type="button"
                  onClick={() => {
                    setMethod(item.method);
                    setEndpoint(item.path);
                  }}
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${METHOD_COLORS[item.method]}`}
                  >
                    {item.method}
                  </span>
                  <span className="truncate font-mono text-[11px] text-default-600">
                    {item.path}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
