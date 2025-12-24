export type WebhookStatus = "ACTIVE" | "INACTIVE";

export interface Webhook {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  urlPath: string;
  status: WebhookStatus;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface CreateWebhookRequest {
  name: string;
  description?: string;
}

export interface UpdateWebhookRequest {
  name?: string;
  description?: string;
  status?: WebhookStatus;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  method: string;
  url: string;
  queryParams: Record<string, string> | null;
  headers: Record<string, string>;
  body: string | null;
  ipAddress: string;
  userAgent: string;
  statusCode: number;
  processingTimeMs: number;
  createdAt: string;
}

export interface GetWebhookLogsParams {
  page?: number;
  limit?: number;
  method?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetWebhookLogsResponse {
  data: WebhookLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TestWebhookRequest {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

