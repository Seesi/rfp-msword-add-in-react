import React, { useState } from "react";
import { ChecklistResponse, LoadingState } from "../types";

interface ChecklistTabProps {
  state: LoadingState;
  error: string | null;
  data: ChecklistResponse | null;
  hasSession: boolean;
}

export const ChecklistTab: React.FC<ChecklistTabProps> = ({ state, error, data, hasSession }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // ── Empty / no session ──────────────────────────────────────
  if (!hasSession) {
    return (
      <div style={s.emptyWrapper}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-6-6z"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M14 2v6h6M9 8h1M14 8h1"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 12l1 1 2-2"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 style={s.emptyTitle}>Upload RFP to Generate Compliance Checklist</h3>
        <p style={s.emptyText}>
          Transform your Request for Proposal into an actionable compliance matrix instantly.
        </p>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────
  if (state === "loading") {
    const totalItems = 10; // placeholder until data arrives
    return (
      <div style={s.container}>
        <div style={s.progressSection}>
          <style>{`@keyframes rfp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
          <svg
            style={{ animation: "rfp-spin 0.85s linear infinite" }}
            width="32"
            height="32"
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
          <p style={s.progressTitle}>Generating Compliance Checklist</p>
          <p style={s.progressSub}>Analyzing RFP requirements...</p>
        </div>
        {/* Skeleton rows */}
        <div style={s.skeletonList}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={s.skeletonRow}>
              <div
                style={{ ...s.skeletonBox, width: "12px", height: "12px", borderRadius: "3px" }}
              />
              <div style={{ ...s.skeletonBox, flex: 1, height: "12px", borderRadius: "4px" }} />
              <div
                style={{ ...s.skeletonBox, width: "40px", height: "12px", borderRadius: "4px" }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div style={s.container}>
        <div style={s.errorBanner}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{error || "Failed to load checklist."}</span>
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────
  if (state === "success" && data) {
    // API signals doc is not a valid RFP
    if (data.message || data.hasAnalysisContent === false) {
      return (
        <div style={s.container}>
          <div style={s.invalidDocBanner}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <p style={s.invalidDocTitle}>Not a Valid RFP Document</p>
              <p style={s.invalidDocText}>
                {data.message ||
                  "The uploaded document does not appear to contain RFP content. Please upload a valid RFP document."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    const allItems = data.categories.flatMap((c) => c.items);
    const totalCount = allItems.length;
    const checkedCount = allItems.filter((item) => checked[item.id]).length;
    const allDone = totalCount > 0 && checkedCount === totalCount;

    return (
      <div style={s.container}>
        {/* Progress header */}
        <div style={s.progressHeader}>
          {allDone ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#DCFCE7" />
              <path
                d="M7 13l3 3 7-7"
                stroke="#16A34A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span style={s.progressCount}>
              {checkedCount}/{totalCount} Completed
            </span>
          )}
          <div style={s.progressBarTrack}>
            <div
              style={{
                ...s.progressBarFill,
                width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
          {allDone && (
            <>
              <p style={s.doneTitle}>Compliance Checklist Generated</p>
              <p style={s.doneSub}>RFP analysis done.</p>
            </>
          )}
        </div>

        {/* Categories */}
        <div style={s.categoryList}>
          {data.categories.map((cat) => {
            const isExpanded = expanded[cat.category] !== false; // default open
            const catChecked = cat.items.filter((i) => checked[i.id]).length;
            return (
              <div key={cat.category} style={s.categoryBlock}>
                {/* Category header */}
                <button style={s.categoryHeader} onClick={() => toggleCategory(cat.category)}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.15s",
                    }}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="#475569"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={s.categoryName}>{cat.category}</span>
                  <span style={s.categoryCount}>
                    {catChecked}/{cat.items.length}
                  </span>
                </button>

                {/* Items */}
                {isExpanded && (
                  <div style={s.itemList}>
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          ...s.itemRow,
                          ...(checked[item.id] ? s.itemRowChecked : {}),
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!checked[item.id]}
                          onChange={() => toggleCheck(item.id)}
                          style={s.checkbox}
                          id={item.id}
                        />
                        <label htmlFor={item.id} style={s.itemLabel}>
                          <span
                            style={{
                              ...s.itemText,
                              ...(checked[item.id] ? s.itemTextChecked : {}),
                            }}
                          >
                            {item.requirement}
                          </span>
                          {item.source && <span style={s.itemSource}>{item.source}</span>}
                          {item.notes && <span style={s.itemNotes}>{item.notes}</span>}
                        </label>
                        <span
                          style={{
                            ...s.typeBadge,
                            ...(item.type === "Required"
                              ? s.typeBadgeRequired
                              : s.typeBadgeAdvisory),
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
    lineHeight: 1.4,
  },
  emptyText: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.5,
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "12px",
  },
  progressTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  progressSub: {
    margin: 0,
    fontSize: "12px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  skeletonList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  skeletonBox: {
    backgroundColor: "#E2E8F0",
    borderRadius: "4px",
  },
  progressHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    paddingBottom: "4px",
  },
  progressCount: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  progressBarTrack: {
    width: "100%",
    height: "4px",
    backgroundColor: "#E2E8F0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },
  doneTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  doneSub: {
    margin: 0,
    fontSize: "11px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryBlock: {
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  categoryHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "10px 12px",
    background: "#F8FAFC",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  categoryName: {
    flex: 1,
    fontSize: "12px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  categoryCount: {
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    backgroundColor: "#F1F5F9",
  },
  itemRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 12px",
    backgroundColor: "#FFFFFF",
    transition: "background 0.15s",
  },
  itemRowChecked: {
    backgroundColor: "#F0FDF4",
  },
  checkbox: {
    marginTop: "2px",
    flexShrink: 0,
    width: "14px",
    height: "14px",
    cursor: "pointer",
    accentColor: "#6366F1",
  },
  itemLabel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    cursor: "pointer",
  },
  itemText: {
    fontSize: "12px",
    color: "#1E293B",
    lineHeight: 1.5,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  itemTextChecked: {
    textDecoration: "line-through",
    color: "#94A3B8",
  },
  itemSource: {
    fontSize: "10px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  itemNotes: {
    fontSize: "10px",
    color: "#F59E0B",
    fontStyle: "italic",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  typeBadge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "2px 6px",
    borderRadius: "999px",
    flexShrink: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  typeBadgeRequired: {
    backgroundColor: "#EEF2FF",
    color: "#4338CA",
  },
  typeBadgeAdvisory: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  invalidDocBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FCD34D",
    borderRadius: "8px",
  },
  invalidDocTitle: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 700,
    color: "#92400E",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  invalidDocText: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#92400E",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    lineHeight: 1.5,
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

export default ChecklistTab;
