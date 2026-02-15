import { useState, useCallback } from "react";

import { apiClient } from "@/lib/api-client";

interface UploadResponse {
  url: string;
  key: string;
}

interface UseFileUploadOptions {
  onSuccess?: (data: UploadResponse) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();

        formData.append("file", file);

        const { data } = await apiClient.post<UploadResponse>(
          "/storage/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
              if (e.total) {
                setProgress(Math.round((e.loaded / e.total) * 100));
              }
            },
          },
        );

        setProgress(100);
        options?.onSuccess?.(data);

        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";

        setError(msg);
        options?.onError?.(msg);

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options],
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return { upload, isUploading, progress, error, reset };
}
