import React, { useRef, useState } from "react";
import { LoadingState } from "../types";

interface UploadTabProps {
  uploadState: LoadingState;
  uploadError: string | null;
  uploadedFileName: string | null;
  onUpload: (files: File[]) => void;
  onGenerateChecklist: () => void;
  sessionId: string | null;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const ACCEPTED_EXT = [".pdf", ".docx", ".doc"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 5;

export const UploadTab: React.FC<UploadTabProps> = ({
  uploadState,
  uploadError,
  onUpload,
  onGenerateChecklist,
  sessionId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateAndAddFiles = (newFiles: File[]) => {
    setValidationError(null);
    const valid: File[] = [];
    for (const file of newFiles) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const validType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT.includes(ext);
      if (!validType) {
        setValidationError("Invalid file type. Use PDF, DOCX, or DOC.");
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setValidationError(`${file.name} exceeds 10MB limit.`);
        continue;
      }
      valid.push(file);
    }
    const merged = [...selectedFiles, ...valid].slice(0, MAX_FILES);
    if (selectedFiles.length + valid.length > MAX_FILES) {
      setValidationError(`Max ${MAX_FILES} files allowed. Some files were not added.`);
    }
    setSelectedFiles(merged);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) validateAndAddFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) validateAndAddFiles(files);
  };

  const isUploading = uploadState === "loading";
  const isSuccess = uploadState === "success";
  const isError = uploadState === "error";
  const canGenerate = isSuccess && !!sessionId;
  const hasFiles = selectedFiles.length > 0;
  const displayError = validationError || uploadError;

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div style={s.container}>
      {/* Drop zone */}
      <div
        style={{
          ...s.dropZone,
          ...(dragOver ? s.dropZoneActive : {}),
          ...(isUploading ? s.dropZoneDisabled : {}),
        }}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {/* Cloud upload icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            stroke={dragOver ? "#6366F1" : "#94A3B8"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p style={s.dropText}>Drop RFP files here</p>
        <p style={s.dropSubText}>or click to browse</p>
      </div>

      {/* File list */}
      {hasFiles && (
        <div style={s.fileList}>
          {selectedFiles.map((file, i) => (
            <div
              key={i}
              style={{
                ...s.fileRow,
                ...(isError ? s.fileRowError : {}),
                ...(isSuccess ? s.fileRowSuccess : {}),
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke={isError ? "#EF4444" : "#6366F1"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M14 2v6h6"
                  stroke={isError ? "#EF4444" : "#6366F1"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <div style={s.fileInfo}>
                <span style={s.fileName}>{file.name}</span>
                <span style={s.fileSize}>{formatSize(file.size)}</span>
              </div>
              {isUploading && <span style={{ ...s.badge, ...s.badgeUploading }}>Uploading</span>}
              {isSuccess && <span style={{ ...s.badge, ...s.badgeSuccess }}>Success</span>}
              {!isUploading && !isSuccess && (
                <button style={s.iconBtn} onClick={() => removeFile(i)} title="Remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="#6B7280"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File count hint */}
      {hasFiles && !isSuccess && (
        <p style={s.fileCountHint}>
          {selectedFiles.length} of {MAX_FILES} files selected
        </p>
      )}

      {/* Validation / upload error */}
      {displayError && <p style={s.errorText}>{displayError}</p>}

      {/* Generate Compliance Checklist button */}
      {/* Upload button — shown when files selected but not yet uploaded */}
      {hasFiles && uploadState === "idle" && (
        <button style={{ ...s.btn, ...s.btnActive }} onClick={() => onUpload(selectedFiles)}>
          Upload RFP
        </button>
      )}

      {/* Generate button — shown after successful upload */}
      {uploadState !== "idle" && (
        <button
          style={{ ...s.btn, ...(canGenerate ? s.btnActive : s.btnDisabled) }}
          disabled={!canGenerate}
          onClick={onGenerateChecklist}
        >
          Generate Compliance Checklist
        </button>
      )}

      {/* Supported formats note */}
      <p style={s.hint}>Supported formats: PDF, DOCX, DOC</p>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
  },
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    border: "1.5px dashed #CBD5E1",
    borderRadius: "8px",
    padding: "24px 16px",
    cursor: "pointer",
    backgroundColor: "#F8FAFC",
    transition: "border-color 0.15s, background 0.15s",
  },
  dropZoneActive: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  dropZoneDisabled: {
    cursor: "not-allowed",
    opacity: 0.6,
  },
  dropText: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 500,
    color: "#475569",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  dropSubText: {
    margin: 0,
    fontSize: "12px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  chooseLink: {
    color: "#6366F1",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
  },
  fileList: { display: "flex", flexDirection: "column", gap: "6px" },
  fileSize: { fontSize: "10px", color: "#94A3B8", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  fileCountHint: {
    margin: 0,
    fontSize: "11px",
    color: "#94A3B8",
    textAlign: "center" as const,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
  },
  fileRowError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  fileRowSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  fileInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  fileName: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileErrorText: {
    fontSize: "11px",
    color: "#EF4444",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  badge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "999px",
    flexShrink: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  badgeUploading: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  badgeSuccess: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
  },
  fileActions: {
    display: "flex",
    gap: "4px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    width: "100%",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: "background 0.15s",
  },
  btnActive: {
    backgroundColor: "#6366F1",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  btnDisabled: {
    backgroundColor: "#E2E8F0",
    color: "#94A3B8",
    cursor: "not-allowed",
  },
  hint: {
    margin: 0,
    fontSize: "11px",
    color: "#94A3B8",
    textAlign: "center",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  errorText: {
    margin: 0,
    fontSize: "12px",
    color: "#EF4444",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
};

export default UploadTab;
