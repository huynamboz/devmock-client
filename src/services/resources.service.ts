import type {
  CreateResourceRequest,
  Resource,
  ResourceWithSettings,
  UpdateResourceRequest,
  UpdateResourceSettingsRequest,
} from "@/types/project";

import { apiClient } from "@/lib/api-client";

class ResourcesService {
  private readonly baseURL = "/projects";

  /**
   * Create a new resource in a project
   */
  async create(
    projectId: string,
    data: CreateResourceRequest,
  ): Promise<Resource> {
    const response = await apiClient.post<Resource>(
      `${this.baseURL}/${projectId}/resources`,
      data,
    );

    return response.data;
  }

  /**
   * Get all resources for a project
   */
  async getAll(projectId: string): Promise<Resource[]> {
    const response = await apiClient.get<Resource[]>(
      `${this.baseURL}/${projectId}/resources`,
    );

    return response.data;
  }

  /**
   * Get resource by ID
   */
  async getById(resourceId: string): Promise<Resource> {
    const response = await apiClient.get<Resource>(`/resources/${resourceId}`);

    return response.data;
  }

  /**
   * Update a resource
   */
  async update(
    resourceId: string,
    data: UpdateResourceRequest,
  ): Promise<Resource> {
    const response = await apiClient.put<Resource>(
      `/resources/${resourceId}`,
      data,
    );

    return response.data;
  }

  /**
   * Delete a resource
   */
  async delete(resourceId: string): Promise<void> {
    await apiClient.delete(`/resources/${resourceId}`);
  }

  /**
   * Check if resource name is available in a project
   */
  async checkNameAvailability(
    projectId: string,
    name: string,
  ): Promise<{ available: boolean; message?: string }> {
    const response = await apiClient.get<{
      available: boolean;
      message?: string;
    }>(`${this.baseURL}/${projectId}/resources/check-name`, {
      params: { name },
    });

    return response.data;
  }

  /**
   * Update resource API settings
   * Endpoint: PUT /api/v1/resources/:resourceId/settings
   */
  async updateSettings(
    resourceId: string,
    data: UpdateResourceSettingsRequest,
  ): Promise<ResourceWithSettings> {
    const response = await apiClient.put<ResourceWithSettings>(
      `/resources/${resourceId}/settings`,
      data,
    );

    return response.data;
  }
}

export const resourcesService = new ResourcesService();
