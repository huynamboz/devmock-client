import { apiClient } from "@/lib/api-client";

const BASE = "/translations";

export type TranslationEntityType = "topic" | "lesson" | "item";

export interface Translation {
  id: string;
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  language: string;
  value: string;
  isGenerated: boolean;
  isReviewed: boolean;
  modelUsed: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTranslationRequest {
  entityType: TranslationEntityType;
  entityId: string;
  field: string;
  language: string;
  value: string;
  isGenerated?: boolean;
  isReviewed?: boolean;
  modelUsed?: string | null;
}

export interface UpdateTranslationRequest {
  value?: string;
  isReviewed?: boolean;
  modelUsed?: string | null;
}

export interface GetTranslationsParams {
  entityType?: TranslationEntityType;
  entityId?: string;
  language?: string;
}

export const translationService = {
  async getTranslations(
    params?: GetTranslationsParams,
  ): Promise<Translation[]> {
    const { data } = await apiClient.get<Translation[]>(BASE, { params });

    return data;
  },

  async createTranslation(
    body: CreateTranslationRequest,
  ): Promise<Translation> {
    const { data } = await apiClient.post<Translation>(BASE, body);

    return data;
  },

  async updateTranslation(
    id: string,
    body: UpdateTranslationRequest,
  ): Promise<Translation> {
    const { data } = await apiClient.patch<Translation>(`${BASE}/${id}`, body);

    return data;
  },

  async deleteTranslation(id: string): Promise<Translation> {
    const { data } = await apiClient.delete<Translation>(`${BASE}/${id}`);

    return data;
  },

  async bulkCreateTranslations(
    body: CreateTranslationRequest[],
  ): Promise<Translation[]> {
    const { data } = await apiClient.post<Translation[]>(`${BASE}/bulk`, body);

    return data;
  },

  async generateTranslations(
    prompt: string,
  ): Promise<{ lang: string; value: string }[]> {
    const { data } = await apiClient.post<{ lang: string; value: string }[]>(
      `${BASE}/generate`,
      { prompt },
    );

    return data;
  },
};
