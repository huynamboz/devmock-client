import type {
  CreateWebhookRequest,
  GetWebhookLogsParams,
  GetWebhookLogsResponse,
  UpdateWebhookRequest,
  Webhook,
  WebhookLog,
} from "@/types/webhook";

import { apiClient } from "@/lib/api-client";

class WebhooksService {
  private readonly baseURL = "/webhooks";

  /**
   * Get all webhooks for current user
   */
  async getAll(): Promise<Webhook[]> {
    const response = await apiClient.get<Webhook[]>(this.baseURL);
    return response.data;
  }

  /**
   * Get webhook by ID
   */
  async getById(id: string): Promise<Webhook> {
    const response = await apiClient.get<Webhook>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Create a new webhook
   */
  async create(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await apiClient.post<Webhook>(this.baseURL, data);
    return response.data;
  }

  /**
   * Update webhook
   */
  async update(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const response = await apiClient.put<Webhook>(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  /**
   * Delete webhook
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Get webhook logs with pagination and filters
   */
  async getLogs(
    webhookId: string,
    params?: GetWebhookLogsParams,
  ): Promise<GetWebhookLogsResponse> {
    const response = await apiClient.get<GetWebhookLogsResponse>(
      `${this.baseURL}/${webhookId}/logs`,
      {
        params,
      },
    );
    return response.data;
  }

  /**
   * Get webhook log by ID
   */
  async getLogById(webhookId: string, logId: string): Promise<WebhookLog> {
    const response = await apiClient.get<WebhookLog>(
      `${this.baseURL}/${webhookId}/logs/${logId}`,
    );
    return response.data;
  }

  /**
   * Delete a webhook log
   */
  async deleteLog(webhookId: string, logId: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${webhookId}/logs/${logId}`);
  }

  /**
   * Delete all webhook logs
   */
  async deleteAllLogs(webhookId: string): Promise<{ deletedCount: number }> {
    const response = await apiClient.delete<{ deletedCount: number }>(
      `${this.baseURL}/${webhookId}/logs`,
    );
    return response.data;
  }
}

export const webhooksService = new WebhooksService();

