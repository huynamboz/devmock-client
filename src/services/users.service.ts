import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/auth";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "USER" | "ADMIN";
  isActive?: boolean;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  byRole: {
    ADMIN: number;
    USER: number;
  };
  byProvider: {
    GOOGLE: number;
    LOCAL: number;
  };
  byStatus: {
    active: number;
    inactive: number;
  };
  newUsers: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

class UsersService {
  private readonly baseURL = "/admin/users";

  /**
   * Get all users with pagination and filters
   */
  async getAll(params?: GetUsersParams): Promise<GetUsersResponse> {
    const response = await apiClient.get<GetUsersResponse | User[]>(
      this.baseURL,
      {
        params,
      },
    );

    // Handle case where API returns array directly
    if (Array.isArray(response.data)) {
      return {
        users: response.data,
        total: response.data.length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: Math.ceil(
          response.data.length / (params?.limit || 10),
        ),
      };
    }

    // Handle case where API returns object with users property
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.baseURL}/${id}`);

    return response.data;
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<Pick<User, "name" | "role" | "isActive" | "address">>,
  ): Promise<User> {
    const response = await apiClient.patch<User>(`${this.baseURL}/${id}`, data);

    return response.data;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }

  /**
   * Get user statistics (Admin only)
   */
  async getStats(): Promise<UserStats> {
    const response = await apiClient.get<UserStats>("/admin/stats/users");

    return response.data;
  }
}

export const usersService = new UsersService();

