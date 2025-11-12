import { apiClient } from "@/lib/api-client";

export interface GenerateRecordsRequest {
  count: number;
  locale?: string;
}

export interface GenerateRecordsResponse {
  generated: number;
  total: number;
  remaining: number;
}

class RecordsService {
  private readonly baseURL = "/pilot";

  /**
   * Generate mock records for a resource
   * Endpoint: POST /api/v1/pilot/:projectId/:resourceName/generate
   */
  async generateRecords(
    projectId: string,
    resourceName: string,
    data: GenerateRecordsRequest,
  ): Promise<GenerateRecordsResponse> {
    const response = await apiClient.post<GenerateRecordsResponse>(
      `${this.baseURL}/${projectId}/${resourceName}/generate`,
      data,
    );

    return response.data;
  }

  /**
   * Get all records for a resource
   * Endpoint: GET /api/v1/pilot/:projectId/:resourceName
   */
  async getAll(
    projectId: string,
    resourceName: string,
  ): Promise<Record<string, unknown>[]> {
    const response = await apiClient.get<Record<string, unknown>[]>(
      `${this.baseURL}/${projectId}/${resourceName}`,
    );

    return response.data;
  }

  /**
   * Get a single record by ID
   * Endpoint: GET /api/v1/pilot/:projectId/:resourceName/:id
   */
  async getById(
    projectId: string,
    resourceName: string,
    id: string,
  ): Promise<Record<string, unknown>> {
    const response = await apiClient.get<Record<string, unknown>>(
      `${this.baseURL}/${projectId}/${resourceName}/${id}`,
    );

    return response.data;
  }

  /**
   * Create a new record
   * Endpoint: POST /api/v1/pilot/:projectId/:resourceName
   */
  async create(
    projectId: string,
    resourceName: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await apiClient.post<Record<string, unknown>>(
      `${this.baseURL}/${projectId}/${resourceName}`,
      data,
    );

    return response.data;
  }

  /**
   * Update a record
   * Endpoint: PUT /api/v1/pilot/:projectId/:resourceName/:id
   */
  async update(
    projectId: string,
    resourceName: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await apiClient.put<Record<string, unknown>>(
      `${this.baseURL}/${projectId}/${resourceName}/${id}`,
      data,
    );

    return response.data;
  }

  /**
   * Delete a record
   * Endpoint: DELETE /api/v1/pilot/:projectId/:resourceName/:id
   */
  async delete(
    projectId: string,
    resourceName: string,
    id: string,
  ): Promise<void> {
    await apiClient.delete(
      `${this.baseURL}/${projectId}/${resourceName}/${id}`,
    );
  }
}

export const recordsService = new RecordsService();

