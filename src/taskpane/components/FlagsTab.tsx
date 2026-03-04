import React, { useState } from "react";
import { FlagsResponse, FlagItem, FlagSeverity, LoadingState } from "../types";

interface FlagsTabProps {
  state: LoadingState;
  error: string | null;
  data: FlagsResponse | null;
  hasSession: boolean;
}

const severityColors = (severity: FlagSeverity): { bg: string; color: string; border: string } => {
  const s = severity?.toLowerCase();
  if (s === "critical") return { bg: "#FEE2E2", color: "#991B1B", border: "#FCA5A5" };
  if (s === "warning") return { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D" };
  if (s === "info") return { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" };
  return { bg: "#F1F5F9", color: "#475569", border: "#E2E8F0" };
};

const FlagCard: React.FC<{ flag: FlagItem }> = ({ flag }) => {
  const [resolved, setResolved] = useState(false);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const colors = severityColors(flag.severity);

  return (
    <div style={{ ...s.card, borderColor: colors.border, opacity: resolved ? 0.5 : 1 }}>
      <div style={s.cardTop}>
        <span style={{ ...s.badge, backgroundColor: colors.bg, color: colors.color }}>
          {flag.severity}
        </span>
        <button
          style={s.iconBtn}
          onClick={() => setResolved(!resolved)}
          title={resolved ? "Mark unresolved" : "Mark resolved"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke={resolved ? "#16A34A" : "#CBD5E1"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p style={s.cardTitle}>{flag.title}</p>
      {flag.issue && <p style={s.cardIssue}>"{flag.issue}"</p>}
      {flag.recommendation && <p style={s.cardRisk}>Risk: {flag.recommendation}</p>}
      {flag.source && <p style={s.cardSource}>{flag.source}</p>}
      <button style={s.commentBtn} onClick={() => setShowComment(!showComment)}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="#6366F1"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{showComment ? "Hide Comment" : "Add Comment"}</span>
      </button>
      {showComment && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your notes here..."
          style={s.commentInput}
          rows={2}
        />
      )}
    </div>
  );
};

export const FlagsTab: React.FC<FlagsTabProps> = ({ state, error, data, hasSession }) => {
  if (!hasSession) {
    return (
      <div style={s.emptyWrapper}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M4 22v-7" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h3 style={s.emptyTitle}>No Flags Yet</h3>
        <p style={s.emptyText}>Upload and analyse an RFP to see flagged issues.</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div style={s.container}>
        <style>{`@keyframes rfp-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <div style={s.loadingCenter}>
          <svg
            style={{ animation: "rfp-spin 0.85s linear infinite" }}
            width="28"
            height="28"
            viewBox="0 0 36 36"
            fill="none"
          >
            <circle cx="18" cy="18" r="15" stroke="#E2E8F0" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              stroke="#6366F1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="40 94"
            />
          </svg>
          <p style={s.loadingText}>Analysing flagged issues...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={s.container}>
        <div style={s.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{error || "Failed to load flags."}</span>
        </div>
      </div>
    );
  }

  if (state === "success" && data) {
    const flags = data.flags || [];
    return (
      <div style={s.container}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionTitle}>Flagged Issues</h3>
          <p style={s.sectionSub}>
            {flags.length} item{flags.length !== 1 ? "s" : ""} require attention
          </p>
        </div>
        {flags.length === 0 ? (
          <p style={s.emptyText}>No flagged issues found.</p>
        ) : (
          <div style={s.cardList}>
            {flags.map((flag) => (
              <FlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const s: Record<string, React.CSSProperties> = {
  container: { display: "flex", flexDirection: "column", gap: "12px", padding: "16px" },
  emptyWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "10px",
    padding: "32px 20px",
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
  },
  loadingCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "32px 0",
  },
  loadingText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  sectionHeader: { marginBottom: "4px" },
  sectionTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 700,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  sectionSub: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  cardList: { display: "flex", flexDirection: "column", gap: "10px" },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "12px",
    border: "1px solid",
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  badge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "999px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  cardIssue: {
    margin: 0,
    fontSize: "11px",
    color: "#475569",
    fontStyle: "italic",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  cardRisk: {
    margin: 0,
    fontSize: "11px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  cardSource: {
    margin: 0,
    fontSize: "10px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  commentBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 0",
    fontSize: "11px",
    color: "#6366F1",
    fontWeight: 500,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  commentInput: {
    width: "100%",
    padding: "8px",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    fontSize: "12px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1E293B",
    resize: "none",
    boxSizing: "border-box",
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
};

export default FlagsTab;
