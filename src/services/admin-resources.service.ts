import { apiClient } from "@/lib/api-client";
import type {
  Resource,
  ResourceField,
} from "@/types/project";

export interface GetAdminResourcesParams {
  page?: number;
  limit?: number;
  projectId?: string;
  search?: string;
}

export interface GetAdminResourcesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResourceOwner {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
}

export interface AdminResource extends Resource {
  apiSettings?: {
    GET?: { enabled: boolean; delay: number };
    POST?: { enabled: boolean; delay: number };
    PUT?: { enabled: boolean; delay: number };
    PATCH?: { enabled: boolean; delay: number };
    DELETE?: { enabled: boolean; delay: number };
  };
  project?: {
    id: string;
    name: string;
    ownerId: string;
    owner?: ResourceOwner;
  };
}

export interface GetAdminResourcesResponse {
  data: AdminResource[];
  meta: GetAdminResourcesMeta;
}

export interface AdminResourceDetail extends Resource {
  fields?: ResourceField[];
  apiSettings?: {
    GET?: { enabled: boolean; delay: number };
    POST?: { enabled: boolean; delay: number };
    PUT?: { enabled: boolean; delay: number };
    PATCH?: { enabled: boolean; delay: number };
    DELETE?: { enabled: boolean; delay: number };
  };
  project?: {
    id: string;
    name: string;
    ownerId: string;
    owner?: ResourceOwner;
  };
}

export interface UpdateAdminResourceRequest {
  fields: Array<{
    name: string;
    type: string;
    fakerType?: string | null;
  }>;
}

export interface ResourceStats {
  total: number;
  totalWithRecords: number;
  totalProjects: number;
  averageResourcesPerProject: number;
}

class AdminResourcesService {
  private readonly baseURL = "/admin/resources";

  /**
   * Get all resources with pagination and filters (Admin only)
   */
  async getAll(
    params?: GetAdminResourcesParams,
  ): Promise<GetAdminResourcesResponse> {
    const response = await apiClient.get<GetAdminResourcesResponse>(
      this.baseURL,
      {
        params,
      },
    );

    return response.data;
  }

  /**
   * Get resource detail by ID (Admin only)
   */
  async getById(id: string): Promise<AdminResourceDetail> {
    const response = await apiClient.get<AdminResourceDetail>(
      `${this.baseURL}/${id}`,
    );

    return response.data;
  }

  /**
   * Update resource fields (Admin only)
   * This will normalize all existing records to match the new schema
   */
  async update(
    id: string,
    data: UpdateAdminResourceRequest,
  ): Promise<AdminResourceDetail> {
    const response = await apiClient.put<AdminResourceDetail>(
      `${this.baseURL}/${id}`,
      data,
    );

    return response.data;
  }

  /**
   * Delete resource (Admin only)
   * ⚠️ This will permanently delete the resource and all its records
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Get resource statistics (Admin only)
   */
  async getStats(): Promise<ResourceStats> {
    const response = await apiClient.get<ResourceStats>(
      "/admin/stats/resources",
    );

    return response.data;
  }
}

export const adminResourcesService = new AdminResourcesService();

