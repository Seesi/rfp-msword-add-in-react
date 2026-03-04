import React, { useState } from "react";
import { ScoringResponse, CategoryScore, LoadingState } from "../types";

/* global Word */

interface ScoreTabProps {
  state: LoadingState;
  error: string | null;
  data: ScoringResponse | null;
  hasSession: boolean;
  sessionId: string | null;
  uploadedFileName: string | null;
  onScore: (proposalText: string) => void;
}

// Circular score ring component
const ScoreRing: React.FC<{ score: number; size?: number; isAnimating?: boolean }> = ({
  score,
  size = 96,
  isAnimating = false,
}) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22C55E" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <style>{`
        @keyframes rfp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes rfp-dash {
          from { stroke-dashoffset: ${circumference}; }
          to   { stroke-dashoffset: ${offset}; }
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 96 96">
        {/* Track */}
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="7" />
        {/* Fill */}
        {isAnimating ? (
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
            style={{ animation: "rfp-spin 0.85s linear infinite", transformOrigin: "48px 48px" }}
          />
        ) : (
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 48 48)"
            style={{ animation: "rfp-dash 1s ease-out forwards" }}
          />
        )}
      </svg>
      {/* Label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {isAnimating ? (
          <span
            style={{
              fontSize: "11px",
              color: "#94A3B8",
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            ...
          </span>
        ) : (
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color,
              fontFamily: "'Segoe UI', system-ui, sans-serif",
            }}
          >
            {score}%
          </span>
        )}
      </div>
    </div>
  );
};

// Category bar row
const CategoryRow: React.FC<{ cat: CategoryScore }> = ({ cat }) => {
  const [expanded, setExpanded] = useState(false);
  const color = cat.score >= 80 ? "#22C55E" : cat.score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div style={s.catBlock}>
      <button style={s.catRow} onClick={() => setExpanded(!expanded)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="#22C55E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={s.catName}>{cat.category}</span>
        <span style={{ ...s.catScore, color }}>{cat.score}%</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s",
          }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Progress bar */}
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: `${cat.score}%`, backgroundColor: color }} />
      </div>
      {/* Expanded items */}
      {expanded && (
        <div style={s.itemList}>
          {cat.items.map((item) => (
            <div key={item.id} style={s.itemRow}>
              <div
                style={{
                  ...s.statusDot,
                  backgroundColor:
                    item.status === "Addressed"
                      ? "#22C55E"
                      : item.status === "Partial"
                        ? "#F59E0B"
                        : item.status === "Missing"
                          ? "#EF4444"
                          : "#CBD5E1",
                }}
              />
              <div style={s.itemContent}>
                <p style={s.itemReq}>{item.requirement}</p>
                {item.evidence && <p style={s.itemEvidence}>Evidence: "{item.evidence}"</p>}
                {item.suggestion && <p style={s.itemSuggestion}>Suggestion: {item.suggestion}</p>}
              </div>
              <span
                style={{
                  ...s.statusBadge,
                  backgroundColor:
                    item.status === "Addressed"
                      ? "#DCFCE7"
                      : item.status === "Partial"
                        ? "#FEF3C7"
                        : item.status === "Missing"
                          ? "#FEE2E2"
                          : "#F1F5F9",
                  color:
                    item.status === "Addressed"
                      ? "#15803D"
                      : item.status === "Partial"
                        ? "#92400E"
                        : item.status === "Missing"
                          ? "#991B1B"
                          : "#475569",
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Read the current Word document body text
async function readWordDocument(): Promise<string> {
  return new Promise((resolve, reject) => {
    Word.run(async (context) => {
      const body = context.document.body;
      body.load("text");
      await context.sync();
      resolve(body.text);
    }).catch(reject);
  });
}

export const ScoreTab: React.FC<ScoreTabProps> = ({
  state,
  error,
  data,
  hasSession,
  uploadedFileName,
  onScore,
}) => {
  const [readError, setReadError] = useState<string | null>(null);

  const handleScore = async () => {
    setReadError(null);
    try {
      const text = await readWordDocument();
      if (!text || text.trim().length < 200) {
        setReadError("Your document needs at least 200 characters of content to be scored.");
        return;
      }
      onScore(text);
    } catch {
      setReadError("Could not read the Word document. Make sure the add-in has document access.");
    }
  };

  // ── No session ───────────────────────────────────────────────
  if (!hasSession) {
    return (
      <div style={s.emptyWrapper}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M14 2v6h6" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M9 12l1.5 1.5L14 9"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 style={s.emptyTitle}>No Active Compliance Session Found</h3>
        <p style={s.emptyText}>
          Please upload your RFP documents to view Compliance score for your proposal.
        </p>
        {/* Mini drop zone hint */}
        <div style={s.miniDropHint}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p style={s.miniDropText}>Drag and drop your RFP here</p>
          <p style={s.miniDropSub}>
            or <span style={s.chooseLink}>Choose file</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Has session — ready to score or showing results ──────────
  return (
    <div style={s.container}>
      {/* Session info panel */}
      {state !== "success" && (
        <div style={s.sessionPanel}>
          <p style={s.sessionLabel}>Proposal Score</p>

          {/* Uploaded file */}
          <div style={s.fileRow}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path d="M14 2v6h6" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={s.fileName}>{uploadedFileName || "RFP Document"}</span>
          </div>

          <div style={s.divider} />
          <p style={s.sessionActive}>Session Active</p>
          <p style={s.sessionHint}>
            Your current draft proposal will be automatically submitted from the open document.
          </p>
        </div>
      )}

      {/* Errors */}
      {(readError || (state === "error" && error)) && (
        <div style={s.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{readError || error}</span>
        </div>
      )}

      {/* Loading state — circular ring animating */}
      {state === "loading" && (
        <div style={s.scoringCenter}>
          <ScoreRing score={0} size={96} isAnimating />
          <p style={s.scoringTitle}>Analyzing Proposal Compliance...</p>
        </div>
      )}

      {/* Success — show score */}
      {state === "success" && data && (
        <div style={s.resultsWrapper}>
          {/* Header */}
          <p style={s.resultTitle}>Proposal Analysis Completed</p>

          {/* Score ring */}
          <div style={s.scoreCenter}>
            <ScoreRing score={data.overallScore} size={96} />
            <div>
              <p style={s.reqCount}>
                {data.categoryScores.reduce((a, c) => a + c.addressed, 0)} of{" "}
                {data.categoryScores.reduce((a, c) => a + c.total, 0)} requirements addressed
              </p>
              {data.warning && <p style={s.warningText}>Warning: {data.warning}</p>}
            </div>
          </div>

          {/* Category breakdown */}
          <div style={s.breakdownHeader}>
            <span style={s.breakdownTitle}>Category Breakdown</span>
            <span style={s.breakdownCount}>
              {data.categoryScores.length}/{data.categoryScores.length}
            </span>
          </div>
          <div style={s.catList}>
            {data.categoryScores.map((cat) => (
              <CategoryRow key={cat.category} cat={cat} />
            ))}
          </div>

          {/* Re-score button */}
          <button style={s.rescoreBtn} onClick={handleScore}>
            Re-score Document
          </button>
        </div>
      )}

      {/* Score button — shown when idle or error */}
      {(state === "idle" || state === "error") && (
        <button style={s.scoreBtn} onClick={handleScore}>
          Score Proposal
        </button>
      )}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px" },
  emptyWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    padding: "24px 16px",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  emptyText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.5,
  },
  miniDropHint: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    border: "1.5px dashed #CBD5E1",
    borderRadius: "8px",
    padding: "16px 24px",
    width: "100%",
    boxSizing: "border-box",
  },
  miniDropText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  miniDropSub: {
    margin: 0,
    fontSize: "12px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  chooseLink: { color: "#6366F1", fontWeight: 500, cursor: "pointer" },
  sessionPanel: {
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sessionLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  fileRow: { display: "flex", alignItems: "center", gap: "8px" },
  fileName: {
    fontSize: "12px",
    color: "#475569",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  divider: { height: "1px", backgroundColor: "#F1F5F9" },
  sessionActive: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 600,
    color: "#6366F1",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  sessionHint: {
    margin: 0,
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.4,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#EF4444",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  scoringCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px 0",
  },
  scoringTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  resultsWrapper: { display: "flex", flexDirection: "column", gap: "12px" },
  resultTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  scoreCenter: { display: "flex", alignItems: "center", gap: "16px" },
  reqCount: {
    margin: 0,
    fontSize: "12px",
    color: "#475569",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  warningText: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "#F59E0B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  breakdownHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  breakdownTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  breakdownCount: {
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  catList: { display: "flex", flexDirection: "column", gap: "4px" },
  catBlock: { display: "flex", flexDirection: "column", gap: "4px" },
  catRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
    width: "100%",
    textAlign: "left",
  },
  catName: {
    flex: 1,
    fontSize: "12px",
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  catScore: { fontSize: "12px", fontWeight: 600, fontFamily: "'Segoe UI', system-ui, sans-serif" },
  barTrack: {
    width: "100%",
    height: "4px",
    backgroundColor: "#E2E8F0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: "999px", transition: "width 0.6s ease" },
  itemList: { display: "flex", flexDirection: "column", gap: "1px", paddingLeft: "20px" },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px",
    backgroundColor: "#F8FAFC",
    borderRadius: "6px",
    marginBottom: "4px",
  },
  statusDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "3px" },
  itemContent: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  itemReq: {
    margin: 0,
    fontSize: "11px",
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.4,
  },
  itemEvidence: {
    margin: 0,
    fontSize: "10px",
    color: "#22C55E",
    fontStyle: "italic",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  itemSuggestion: {
    margin: 0,
    fontSize: "10px",
    color: "#F59E0B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  statusBadge: {
    fontSize: "9px",
    fontWeight: 600,
    padding: "1px 6px",
    borderRadius: "999px",
    flexShrink: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  scoreBtn: {
    width: "100%",
    padding: "11px",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "#6366F1",
    color: "#FFFFFF",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  rescoreBtn: {
    width: "100%",
    padding: "9px",
    border: "1px solid #6366F1",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#6366F1",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
};

export default ScoreTab;
