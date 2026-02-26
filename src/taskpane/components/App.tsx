import * as React from "react";
import { useState } from "react";
import Header from "./Header";
import FilePicker, { SelectedFile } from "./FilePicker";
import LoadingSpinner from "./LoadingSpinner";
import { StreamingOutput } from "./StreamingOutput";
import { useStreamingUpload, ErrorType } from "../hooks/useStreamingUpload";
import { useGenerateDraft } from "../hooks/useGenerateDraft";
import { makeStyles } from "@fluentui/react-components";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    padding: "0 16px 20px",
    boxSizing: "border-box",
  },
});

function ErrorIcon({ type }: { type: ErrorType | null }) {
  if (type === "network") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0112 10c-2.06 0-3.96.57-5.59 1.54M5 12.55a11 11 0 0114.08 0M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"
          stroke="#DC2626"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === "timeout") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="1.75" />
        <path d="M12 6v6l4 2" stroke="#DC2626" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const App: React.FC<AppProps> = (props: AppProps) => {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const { submit, isLoading, error, errorType, streamedContent, reset } = useStreamingUpload();
  const { generateDraft, status: draftStatus, error: draftError } = useGenerateDraft();

  const styles = useStyles();
  const isDisabled = files.length === 0 || isLoading;
  const isDraftGenerating = draftStatus === "generating";

  const handleSubmit = () => {
    submit(files);
  };

  const handleReset = () => {
    reset();
    setFiles([]);
  };

  const handleGenerateDraft = () => {
    generateDraft(streamedContent);
  };

  return (
    <div className={styles.root}>
      <Header logo="assets/logo-filled.png" title={props.title} message="Welcome" />

      {/* Show file picker only when not loading and no result yet */}
      {!isLoading && !streamedContent && (
        <>
          <FilePicker onFilesChange={setFiles} maxFiles={1} />
          <button
            style={{
              ...btnStyles.base,
              ...(isDisabled ? btnStyles.disabled : btnStyles.active),
            }}
            onClick={handleSubmit}
            disabled={isDisabled}
          >
            Analyse Document
          </button>
        </>
      )}

      {/* Loading spinner while request is in flight */}
      {isLoading && <LoadingSpinner message="Analysing your document, please wait..." />}

      {/* Streaming error banner */}
      {error && (
        <div style={btnStyles.errorBanner} role="alert">
          <ErrorIcon type={errorType} />
          <span style={{ flex: 1 }}>{error}</span>
          <button style={btnStyles.retryBtn} onClick={handleSubmit}>
            Retry
          </button>
        </div>
      )}

      {/* Streamed output */}
      <StreamingOutput content={streamedContent} isLoading={isLoading} />

      {/* Action buttons — shown after stream completes */}
      {streamedContent && !isLoading && (
        <div style={btnStyles.actionRow}>
          {/* Generate Draft button */}
          <button
            style={{
              ...btnStyles.base,
              ...btnStyles.draftBtn,
              ...(isDraftGenerating ? btnStyles.draftBtnDisabled : {}),
            }}
            onClick={handleGenerateDraft}
            disabled={isDraftGenerating}
          >
            {isDraftGenerating ? (
              <span style={btnStyles.btnInner}>
                <svg
                  style={{ animation: "rfp-spin 0.85s linear infinite" }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeOpacity="0.3"
                  />
                  <path
                    d="M12 2a10 10 0 0110 10"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Generating Draft...
              </span>
            ) : draftStatus === "success" ? (
              <span style={btnStyles.btnInner}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Draft Generated!
              </span>
            ) : (
              <span style={btnStyles.btnInner}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                    stroke="#FFFFFF"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="#FFFFFF"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                Generate Draft in Word
              </span>
            )}
          </button>

          {/* Draft generation error */}
          {draftError && (
            <div style={{ ...btnStyles.errorBanner, marginTop: 0 }} role="alert">
              <ErrorIcon type={null} />
              <span style={{ flex: 1 }}>{draftError}</span>
            </div>
          )}

          {/* Analyse another document */}
          <button style={btnStyles.resetBtn} onClick={handleReset}>
            Analyse Another Document
          </button>
        </div>
      )}

      {/* Keyframe for button spinner */}
      <style>{`
        @keyframes rfp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const btnStyles: Record<string, React.CSSProperties> = {
  base: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  active: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
  },
  disabled: {
    backgroundColor: "#93C5FD",
    color: "#FFFFFF",
    cursor: "not-allowed",
  },
  draftBtn: {
    backgroundColor: "#0F172A",
    color: "#FFFFFF",
  },
  draftBtnDisabled: {
    backgroundColor: "#475569",
    cursor: "not-allowed",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  actionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#DC2626",
  },
  retryBtn: {
    background: "none",
    border: "1px solid #DC2626",
    borderRadius: "6px",
    color: "#DC2626",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 8px",
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  resetBtn: {
    width: "100%",
    padding: "9px",
    backgroundColor: "transparent",
    color: "#2563EB",
    border: "1px solid #2563EB",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
};

export default App;
