import { apiClient } from "@/lib/api-client";

const BASE = "/settings";

// --- Types ---

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  group: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingRequest {
  key: string;
  value: unknown;
  group?: string;
  description?: string;
}

export interface UpdateSettingRequest {
  value: unknown;
  description?: string;
}

export interface AIProviderValue {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  isDefault: boolean;
}

export interface AIProviderSetting extends SystemSetting {
  value: AIProviderValue;
}

export interface UpsertAIProviderRequest {
  name: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  isDefault?: boolean;
}

export interface TranslationPromptValue {
  prompt: string;
}

export interface TranslationPromptSetting extends SystemSetting {
  value: TranslationPromptValue;
}

// --- Service ---

export const settingsService = {
  // Generic settings
  async getSettings(group?: string): Promise<SystemSetting[]> {
    const { data } = await apiClient.get<SystemSetting[]>(BASE, {
      params: group ? { group } : undefined,
    });

    return data;
  },

  async getSettingByKey(key: string): Promise<SystemSetting> {
    const { data } = await apiClient.get<SystemSetting>(`${BASE}/${key}`);

    return data;
  },

  async createSetting(body: CreateSettingRequest): Promise<SystemSetting> {
    const { data } = await apiClient.post<SystemSetting>(BASE, body);

    return data;
  },

  async updateSetting(
    key: string,
    body: UpdateSettingRequest,
  ): Promise<SystemSetting> {
    const { data } = await apiClient.patch<SystemSetting>(
      `${BASE}/${key}`,
      body,
    );

    return data;
  },

  async deleteSetting(key: string): Promise<SystemSetting> {
    const { data } = await apiClient.delete<SystemSetting>(`${BASE}/${key}`);

    return data;
  },

  // AI Provider settings
  async getAIProviders(): Promise<AIProviderSetting[]> {
    const { data } = await apiClient.get<AIProviderSetting[]>(
      `${BASE}/ai-providers/list`,
    );

    return data;
  },

  async getDefaultAIProvider(): Promise<AIProviderSetting> {
    const { data } = await apiClient.get<AIProviderSetting>(
      `${BASE}/ai-providers/default`,
    );

    return data;
  },

  async upsertAIProvider(
    providerKey: string,
    body: UpsertAIProviderRequest,
  ): Promise<AIProviderSetting> {
    const { data } = await apiClient.put<AIProviderSetting>(
      `${BASE}/ai-providers/${providerKey}`,
      body,
    );

    return data;
  },

  async deleteAIProvider(providerKey: string): Promise<AIProviderSetting> {
    const { data } = await apiClient.delete<AIProviderSetting>(
      `${BASE}/ai-providers/${providerKey}`,
    );

    return data;
  },

  // Translation prompt
  async getTranslationPrompt(): Promise<TranslationPromptSetting> {
    const { data } = await apiClient.get<TranslationPromptSetting>(
      `${BASE}/translation-prompt`,
    );

    return data;
  },

  async upsertTranslationPrompt(
    prompt: string,
  ): Promise<TranslationPromptSetting> {
    const { data } = await apiClient.put<TranslationPromptSetting>(
      `${BASE}/translation-prompt`,
      { prompt },
    );

    return data;
  },
};
