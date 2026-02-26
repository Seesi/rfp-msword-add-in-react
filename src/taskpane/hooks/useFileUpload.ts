import { useState } from "react";
import { SelectedFile } from "../components/FilePicker";

// 🔁 Replace this with your actual backend endpoint URL
const UPLOAD_ENDPOINT = "https://your-api-endpoint.com/upload";

interface UseFileUploadReturn {
  upload: (files: SelectedFile[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: SelectedFile[]): Promise<void> => {
    if (files.length === 0) {
      setError("Please select at least one file before uploading.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Build the multipart form data
      const formData = new FormData();
      files.forEach((sf) => {
        // "files" is the field name the backend expects.
        // If your backend expects a different name e.g. "documents", change it here.
        formData.append("files", sf.file, sf.file.name);
      });

      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        // DO NOT set Content-Type manually — the browser sets it automatically
        // with the correct multipart boundary when using FormData
        body: formData,
      });

      if (!response.ok) {
        // Try to extract an error message from the response body if available
        let message = `Upload failed with status ${response.status}.`;
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          // Response wasn't JSON, stick with the default message
        }
        throw new Error(message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during upload.");
      }
    } finally {
      // Always stop loading whether it succeeded or failed
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return { upload, isLoading, error, reset };
};
