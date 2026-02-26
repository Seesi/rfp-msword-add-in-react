import { useState } from "react";
import { SelectedFile } from "../components/FilePicker";

// GetComplianceFromFiles — accepts multipart form-data with field "files"
// const UPLOAD_ENDPOINT =
//   "https://func-app-mswordaddin-ai-eabecyf8c5bgfddn.westeurope-01.azurewebsites.net/api/compliance/files";
const UPLOAD_ENDPOINT = "/api/compliance/files";
// How long to wait before giving up on the request
const REQUEST_TIMEOUT_MS = 300000; // 30 seconds

export type ErrorType = "network" | "timeout" | "server" | "empty_response" | "unknown";

interface UseStreamingUploadReturn {
  submit: (files: SelectedFile[]) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  errorType: ErrorType | null;
  streamedContent: string;
  reset: () => void;
}

// Maps error types to user-friendly messages
function getErrorMessage(type: ErrorType, status?: number): string {
  switch (type) {
    case "network":
      return "Unable to reach the server. Please check your internet connection and try again.";
    case "timeout":
      return "The request timed out. The server is taking too long to respond. Please try again.";
    case "server":
      if (status === 500)
        return "The server encountered an internal error. Please try again later.";
      if (status === 503)
        return "The service is temporarily unavailable. Please try again in a few moments.";
      if (status === 404)
        return "The compliance endpoint could not be found. Please contact support.";
      if (status === 413) return "The file is too large to process. Please upload a smaller file.";
      return `The server returned an unexpected error (${status}). Please try again.`;
    case "empty_response":
      return "The server responded but returned no content. Please try again.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

export const useStreamingUpload = (): UseStreamingUploadReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [streamedContent, setStreamedContent] = useState<string>("");

  const setErrorState = (type: ErrorType, status?: number) => {
    setErrorType(type);
    setError(getErrorMessage(type, status));
  };

  const submit = async (files: SelectedFile[]): Promise<void> => {
    if (files.length === 0) {
      setError("Please select at least one file before submitting.");
      return;
    }

    setError(null);
    setErrorType(null);
    setStreamedContent("");
    setIsLoading(true);

    // AbortController lets us cancel the request on timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Build multipart form — field name must be "files"
      const formData = new FormData();
      files.forEach((sf) => {
        formData.append("files", sf.file, sf.file.name);
      });

      // Do NOT set Content-Type — browser sets it automatically for FormData
      const response = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        setErrorState("server", response.status);
        return;
      }

      if (!response.body) {
        setErrorState("empty_response");
        return;
      }

      // Read the SSE stream chunk by chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let receivedContent = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        receivedContent = true;
        buffer += decoder.decode(value, { stream: true });

        // SSE messages are separated by double newlines
        const parts = buffer.split("\n\n");

        // Keep the last incomplete part in the buffer
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6); // strip "data: " prefix
              if (data === "[DONE]") break;
              setStreamedContent((prev) => prev + data);
            }
          }
        }
      }

      // Stream completed but nothing came through
      if (!receivedContent) {
        setErrorState("empty_response");
      }
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === "AbortError") {
        // Request cancelled by our timeout
        setErrorState("timeout");
      } else if (err instanceof TypeError) {
        // TypeError from fetch = network failure (offline, DNS failure, CORS)
        setErrorState("network");
      } else {
        setErrorState("unknown");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setErrorType(null);
    setStreamedContent("");
    setIsLoading(false);
  };

  return { submit, isLoading, error, errorType, streamedContent, reset };
};
