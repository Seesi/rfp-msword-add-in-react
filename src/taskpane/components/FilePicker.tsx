import React, { useCallback, useRef, useState } from "react";

export interface SelectedFile {
  file: File;
  id: string;
}

interface FilePickerProps {
  onFilesChange: (files: SelectedFile[]) => void;
  maxFiles?: number;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const ACCEPTED_LABEL = "PDF or DOCX";

function getFileIcon(file: File) {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="2" width="13" height="17" rx="2" fill="#E53935" fillOpacity="0.15" />
        <rect x="3" y="2" width="13" height="17" rx="2" stroke="#E53935" strokeWidth="1.5" />
        <path
          d="M11 2v5h5"
          stroke="#E53935"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 12h6M7 15h4" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="2" width="13" height="17" rx="2" fill="#1565C0" fillOpacity="0.15" />
      <rect x="3" y="2" width="13" height="17" rx="2" stroke="#1565C0" strokeWidth="1.5" />
      <path
        d="M11 2v5h5"
        stroke="#1565C0"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 10h6M7 13h6M7 16h4" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isValidFile(file: File): boolean {
  return (
    ACCEPTED_TYPES.includes(file.type) ||
    ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}

export const FilePicker: React.FC<FilePickerProps> = ({ onFilesChange, maxFiles = 1 }) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setTypeError(null);
      const arr = Array.from(incoming);
      const invalid = arr.filter((f) => !isValidFile(f));
      if (invalid.length > 0) {
        setTypeError(
          `Unsupported file type${invalid.length > 1 ? "s" : ""}: ${invalid
            .map((f) => f.name)
            .join(", ")}. Only ${ACCEPTED_LABEL} files are accepted.`
        );
        return;
      }
      if (arr.length > maxFiles || selectedFiles.length >= maxFiles) {
        setTypeError(`Only ${maxFiles} file${maxFiles > 1 ? "s" : ""} can be uploaded at a time.`);
        return;
      }

      setSelectedFiles((prev) => {
        const existing = new Set(prev.map((sf) => sf.file.name + sf.file.size));
        const newFiles = arr
          .filter((f) => !existing.has(f.name + f.size))
          .slice(0, maxFiles - prev.length)
          .map((file) => ({
            file,
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          }));
        const updated = [...prev, ...newFiles];
        onFilesChange(updated);
        return updated;
      });
    },
    [maxFiles, onFilesChange]
  );

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((sf) => sf.id !== id);
      onFilesChange(updated);
      return updated;
    });
    setTypeError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div style={styles.wrapper}>
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        multiple
        style={{ display: "none" }}
        onChange={handleInputChange}
        aria-label="File input"
      />

      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop zone: click or drag to upload PDF or DOCX files"
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneDragging : {}),
        }}
        onClick={openFilePicker}
        onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={styles.dropIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V8M12 8L9 11M12 8L15 11"
              stroke={isDragging ? "#2563EB" : "#64748B"}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 16v1a3 3 0 003 3h12a3 3 0 003-3v-1"
              stroke={isDragging ? "#2563EB" : "#94A3B8"}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p style={styles.dropPrimary}>
          {isDragging ? "Drop your files here" : "Click to browse or drag & drop"}
        </p>
        <p style={styles.dropSecondary}>{ACCEPTED_LABEL} files only</p>
      </div>

      {/* Error message */}
      {typeError && (
        <div style={styles.errorBanner} role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {typeError}
        </div>
      )}

      {/* File list */}
      {selectedFiles.length > 0 && (
        <ul style={styles.fileList} aria-label="Selected files">
          {selectedFiles.map((sf) => (
            <li key={sf.id} style={styles.fileItem}>
              <span style={styles.fileIcon}>{getFileIcon(sf.file)}</span>
              <span style={styles.fileName} title={sf.file.name}>
                {sf.file.name}
              </span>
              <span style={styles.fileSize}>{formatBytes(sf.file.size)}</span>
              <button
                aria-label={`Remove ${sf.file.name}`}
                style={styles.removeBtn}
                onClick={() => removeFile(sf.id)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    width: "100%",
  },
  dropZone: {
    border: "1.5px dashed #CBD5E1",
    borderRadius: "10px",
    backgroundColor: "#F8FAFC",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    transition: "border-color 0.18s, background 0.18s",
    outline: "none",
  },
  dropZoneDragging: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  dropIcon: {
    marginBottom: "4px",
  },
  dropPrimary: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
    color: "#1E293B",
  },
  dropSecondary: {
    margin: 0,
    fontSize: "12px",
    color: "#94A3B8",
  },
  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "7px",
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "7px",
    padding: "9px 12px",
    fontSize: "12px",
    color: "#DC2626",
    lineHeight: 1.5,
  },
  fileList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "8px 12px",
  },
  fileIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  fileName: {
    flex: 1,
    fontSize: "13px",
    color: "#1E293B",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: "11px",
    color: "#94A3B8",
    flexShrink: 0,
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    borderRadius: "4px",
    flexShrink: 0,
  },
};

export default FilePicker;
