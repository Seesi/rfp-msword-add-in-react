import React from "react";
import { DatesResponse, DateEntry, LoadingState } from "../types";

interface DatesTabProps {
  state: LoadingState;
  error: string | null;
  data: DatesResponse | null;
  hasSession: boolean;
}

const isUpcoming = (dateStr: string): boolean => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 14; // within 14 days
  } catch {
    return false;
  }
};

const isPast = (dateStr: string): boolean => {
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
};

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const DateItem: React.FC<{ entry: DateEntry; isLast: boolean }> = ({ entry, isLast }) => {
  const upcoming = isUpcoming(entry.date);
  const past = isPast(entry.date);

  return (
    <div style={s.timelineItem}>
      {/* Dot + line */}
      <div style={s.timelineLeft}>
        <div
          style={{
            ...s.dot,
            backgroundColor: upcoming ? "#F59E0B" : past ? "#CBD5E1" : "#6366F1",
          }}
        />
        {!isLast && <div style={s.line} />}
      </div>

      {/* Content */}
      <div style={s.timelineContent}>
        <p
          style={{
            ...s.dateText,
            color: past ? "#94A3B8" : "#1E293B",
          }}
        >
          {formatDate(entry.date)}
        </p>
        <p
          style={{
            ...s.eventTitle,
            color: past ? "#94A3B8" : "#1E293B",
          }}
        >
          {entry.event}
        </p>
        {entry.source && <p style={s.sourceText}>{entry.source}</p>}
        {entry.conflict && <p style={s.conflictText}>⚠ {entry.conflict}</p>}
        {/* Add reminder button */}
        <button style={s.reminderBtn}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Add Reminder</span>
        </button>
      </div>
    </div>
  );
};

export const DatesTab: React.FC<DatesTabProps> = ({ state, error, data, hasSession }) => {
  if (!hasSession) {
    return (
      <div style={s.emptyWrapper}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#CBD5E1" strokeWidth="1.5" />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <h3 style={s.emptyTitle}>No Dates Yet</h3>
        <p style={s.emptyText}>Upload and analyse an RFP to see key dates and milestones.</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div style={s.container}>
        <style>{`@keyframes rfp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
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
          <p style={s.loadingText}>Extracting key dates...</p>
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
          <span>{error || "Failed to load dates."}</span>
        </div>
      </div>
    );
  }

  if (state === "success" && data) {
    const dates = data.dates || [];
    return (
      <div style={s.container}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionTitle}>Key Dates</h3>
          <p style={s.sectionSub}>Important RFP milestones</p>
        </div>
        {dates.length === 0 ? (
          <p style={s.emptyText}>No key dates found in this RFP.</p>
        ) : (
          <div style={s.timeline}>
            {dates.map((entry, i) => (
              <DateItem key={i} entry={entry} isLast={i === dates.length - 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const s: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
  },
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
  sectionHeader: {
    marginBottom: "4px",
  },
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
  timeline: {
    display: "flex",
    flexDirection: "column",
  },
  timelineItem: {
    display: "flex",
    gap: "12px",
  },
  timelineLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "3px",
  },
  line: {
    width: "2px",
    flex: 1,
    backgroundColor: "#E2E8F0",
    margin: "4px 0",
    minHeight: "20px",
  },
  timelineContent: {
    flex: 1,
    paddingBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  dateText: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  eventTitle: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 500,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  sourceText: {
    margin: 0,
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  conflictText: {
    margin: 0,
    fontSize: "11px",
    color: "#F59E0B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  reminderBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px 0",
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    marginTop: "2px",
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

export default DatesTab;
