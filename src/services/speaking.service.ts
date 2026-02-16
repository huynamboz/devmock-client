import { apiClient } from "@/lib/api-client";

const ADMIN_BASE = "/admin/speaking";

// --- Types (from API docs) ---

export interface SpeakingTopicLessonSummary {
  id: string;
  title: string;
  orderIndex: number;
  estimatedDurationMinutes: number;
}

export interface SpeakingTopic {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  level: string;
  orderIndex: number;
  isPremium: boolean;
  lessons?: SpeakingTopicLessonSummary[];
}

export interface CreateTopicRequest {
  title: string;
  description?: string;
  thumbnailUrl?: string | null;
  level: string;
  orderIndex?: number;
  isPremium?: boolean;
}

export interface UpdateTopicRequest extends Partial<CreateTopicRequest> {}

export interface SpeakingLesson {
  id: string;
  topicId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  estimatedDurationMinutes: number;
  topic?: {
    id: string;
    title: string;
    level: string;
  };
  items?: SpeakingItem[];
}

export interface CreateLessonRequest {
  topicId: string;
  title: string;
  description?: string | null;
  orderIndex?: number;
  estimatedDurationMinutes?: number;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface SpeakingItem {
  id: string;
  lessonId: string;
  textOriginal: string;
  explanation: string | null;
  audioUrl: string | null;
  ipa: string | null;
  orderIndex: number;
  createdAt: string;
  translationCounts?: {
    textOriginal?: number;
    explanation?: number;
  };
  lesson?: {
    id: string;
    title: string;
    topicId: string;
  };
}

export interface CreateItemRequest {
  lessonId: string;
  textOriginal: string;
  explanation?: string | null;
  audioUrl?: string | null;
  ipa?: string | null;
  orderIndex?: number;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

export interface BulkCreateItemsRequest {
  lessonId: string;
  items: {
    textOriginal: string;
    explanation?: string;
    audioUrl?: string;
    ipa?: string;
    sourceLang?: string;
    orderIndex?: number;
  }[];
}

// --- Service ---

export const speakingService = {
  // Topics
  async getTopics(params?: {
    level?: string;
    isPremium?: boolean;
  }): Promise<SpeakingTopic[]> {
    const { data } = await apiClient.get<SpeakingTopic[]>(
      `${ADMIN_BASE}/topics`,
      { params },
    );

    return data;
  },

  async getTopicById(id: string): Promise<SpeakingTopic> {
    const { data } = await apiClient.get<SpeakingTopic>(
      `${ADMIN_BASE}/topics/${id}`,
    );

    return data;
  },

  async createTopic(body: CreateTopicRequest): Promise<SpeakingTopic> {
    const { data } = await apiClient.post<SpeakingTopic>(
      `${ADMIN_BASE}/topics`,
      body,
    );

    return data;
  },

  async updateTopic(
    id: string,
    body: UpdateTopicRequest,
  ): Promise<SpeakingTopic> {
    const { data } = await apiClient.patch<SpeakingTopic>(
      `${ADMIN_BASE}/topics/${id}`,
      body,
    );

    return data;
  },

  async deleteTopic(id: string): Promise<void> {
    await apiClient.delete(`${ADMIN_BASE}/topics/${id}`);
  },

  // Lessons
  async getLessons(params?: { topicId?: string }): Promise<SpeakingLesson[]> {
    const { data } = await apiClient.get<SpeakingLesson[]>(
      `${ADMIN_BASE}/lessons`,
      { params },
    );

    return data;
  },

  async getLessonById(id: string): Promise<SpeakingLesson> {
    const { data } = await apiClient.get<SpeakingLesson>(
      `${ADMIN_BASE}/lessons/${id}`,
    );

    return data;
  },

  async createLesson(body: CreateLessonRequest): Promise<SpeakingLesson> {
    const { data } = await apiClient.post<SpeakingLesson>(
      `${ADMIN_BASE}/lessons`,
      body,
    );

    return data;
  },

  async updateLesson(
    id: string,
    body: UpdateLessonRequest,
  ): Promise<SpeakingLesson> {
    const { data } = await apiClient.patch<SpeakingLesson>(
      `${ADMIN_BASE}/lessons/${id}`,
      body,
    );

    return data;
  },

  async deleteLesson(id: string): Promise<void> {
    await apiClient.delete(`${ADMIN_BASE}/lessons/${id}`);
  },

  // Items
  async getItems(params?: { lessonId?: string }): Promise<SpeakingItem[]> {
    const { data } = await apiClient.get<SpeakingItem[]>(
      `${ADMIN_BASE}/items`,
      { params },
    );

    return data;
  },

  async getItemById(id: string): Promise<SpeakingItem> {
    const { data } = await apiClient.get<SpeakingItem>(
      `${ADMIN_BASE}/items/${id}`,
    );

    return data;
  },

  async createItem(body: CreateItemRequest): Promise<SpeakingItem> {
    const { data } = await apiClient.post<SpeakingItem>(
      `${ADMIN_BASE}/items`,
      body,
    );

    return data;
  },

  async updateItem(id: string, body: UpdateItemRequest): Promise<SpeakingItem> {
    const { data } = await apiClient.patch<SpeakingItem>(
      `${ADMIN_BASE}/items/${id}`,
      body,
    );

    return data;
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`${ADMIN_BASE}/items/${id}`);
  },

  async generateAudio(textOriginal: string): Promise<{ audioUrl: string }> {
    const { data } = await apiClient.post<{ audioUrl: string }>(
      `${ADMIN_BASE}/items/generate-audio`,
      { textOriginal },
    );

    return data;
  },

  async bulkCreateItems(body: BulkCreateItemsRequest): Promise<SpeakingItem[]> {
    const { data } = await apiClient.post<SpeakingItem[]>(
      `${ADMIN_BASE}/items/bulk`,
      body,
    );

    return data;
  },
};
