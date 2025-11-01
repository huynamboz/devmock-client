import { apiClient } from "@/lib/api-client";
import type { CreateProjectRequest, Project } from "@/types/project";

class ProjectsService {
  /**
   * Get all projects for current user
   */
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  }

  /**
   * Create a new project
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post<Project>("/projects", data);
    return response.data;
  }

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }
}

export const projectsService = new ProjectsService();

