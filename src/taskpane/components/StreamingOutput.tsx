import React, { useEffect, useRef, useState } from "react";

interface StreamingOutputProps {
  content: string;
  isLoading: boolean;
}

type CategoryFilter = "all" | "administrative" | "technical" | "financial";
type TypeFilter = "all" | "required" | "advisory";

export const StreamingOutput: React.FC<StreamingOutputProps> = ({ content, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Auto-scroll to bottom as new content arrives
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content]);

  // Apply filters whenever content or filter values change
  // Works by reading data-category and data-type attributes on <li> elements
  // and toggling their visibility — no API call needed (task #4275)
  useEffect(() => {
    if (!contentRef.current) return;

    const items = contentRef.current.querySelectorAll<HTMLLIElement>("li[data-category]");
    setTotalCount(items.length);

    let visible = 0;
    items.forEach((item) => {
      const category = item.getAttribute("data-category") ?? "";
      const type = item.getAttribute("data-type") ?? "";

      const categoryMatch = categoryFilter === "all" || category === categoryFilter;
      const typeMatch = typeFilter === "all" || type === typeFilter;

      if (categoryMatch && typeMatch) {
        item.style.display = "";
        visible++;
      } else {
        item.style.display = "none";
      }
    });

    setVisibleCount(visible);
  }, [content, categoryFilter, typeFilter]);

  if (!content && !isLoading) return null;

  const hasActiveFilter = categoryFilter !== "all" || typeFilter !== "all";
  const isEmpty = hasActiveFilter && totalCount > 0 && visibleCount === 0;

  return (
    <div style={styles.wrapper}>
      <style>{`
        /* ── Animations ───────────────────────────────────────── */
        @keyframes rfp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes rfp-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .rfp-dot { animation: rfp-pulse 1.2s ease-in-out infinite; }
        .rfp-cursor { animation: rfp-blink 1s step-end infinite; }

        /* ── RFP Summary section ──────────────────────────────── */
        .rfp-html-content section { margin-bottom: 20px; }
        .rfp-html-content h2 {
          font-size: 14px;
          font-weight: 700;
          color: #1E293B;
          margin: 0 0 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E2E8F0;
        }
        .rfp-html-content h3 {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 16px 0 8px;
        }

        /* ── Definition list (RFP summary) ───────────────────── */
        .rfp-html-content dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 6px 12px;
          margin: 0;
        }
        .rfp-html-content dt {
          font-size: 12px;
          font-weight: 600;
          color: #64748B;
          white-space: nowrap;
        }
        .rfp-html-content dd {
          font-size: 12px;
          color: #334155;
          margin: 0;
        }
        .rfp-html-content dd ul {
          margin: 4px 0 0;
          padding-left: 16px;
        }
        .rfp-html-content dd ul li {
          font-size: 12px;
          color: #334155;
          margin-bottom: 2px;
          display: list-item !important;
          border: none !important;
          padding: 0 !important;
          background: none !important;
        }

        /* ── Checklist items ──────────────────────────────────── */
        .rfp-html-content ul.checklist {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rfp-html-content ul.checklist > li {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px 12px;
          transition: background 0.15s;
        }
        .rfp-html-content ul.checklist > li:has(input:checked) {
          background: #F0FDF4;
          border-color: #BBF7D0;
        }
        .rfp-html-content ul.checklist > li[data-type="required"] {
          border-left: 3px solid #2563EB;
        }
        .rfp-html-content ul.checklist > li[data-type="advisory"] {
          border-left: 3px solid #F59E0B;
        }
        .rfp-html-content ul.checklist input[type="checkbox"] {
          margin-top: 2px;
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          cursor: pointer;
          accent-color: #2563EB;
        }
        .rfp-html-content ul.checklist label {
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          flex: 1;
        }
        .rfp-html-content span.requirement {
          font-size: 12px;
          color: #1E293B;
          line-height: 1.5;
        }
        .rfp-html-content ul.checklist > li:has(input:checked) span.requirement {
          text-decoration: line-through;
          color: #94A3B8;
        }

        /* ── Badges ───────────────────────────────────────────── */
        .rfp-html-content span.badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 999px;
          width: fit-content;
        }
        .rfp-html-content li[data-type="required"] span.badge {
          background: #DBEAFE;
          color: #1D4ED8;
        }
        .rfp-html-content li[data-type="advisory"] span.badge {
          background: #FEF3C7;
          color: #B45309;
        }

        /* ── Source & notes meta ──────────────────────────────── */
        .rfp-html-content small.source {
          font-size: 10px;
          color: #94A3B8;
        }
        .rfp-html-content small.notes {
          font-size: 10px;
          color: #F59E0B;
          font-style: italic;
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12h6M9 16h4M7 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2"
              stroke="#2563EB"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path d="M9 4h6a1 1 0 011 1v1H8V5a1 1 0 011-1z" stroke="#2563EB" strokeWidth="1.75" />
          </svg>
          <span style={styles.headerTitle}>Compliance Analysis</span>
        </div>

        {isLoading && (
          <div style={styles.streamingBadge}>
            <span className="rfp-dot" style={styles.streamingDot} />
            Streaming
          </div>
        )}
        {!isLoading && content && (
          <div style={styles.doneBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Complete
          </div>
        )}
      </div>

      {/* ── Filter controls (task #4274) ─────────────────────────── */}
      {content && (
        <div style={styles.filterBar}>
          {/* Category filter */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Category</span>
            <div style={styles.filterPills}>
              {(["all", "administrative", "technical", "financial"] as CategoryFilter[]).map(
                (cat) => (
                  <button
                    key={cat}
                    style={{
                      ...styles.pill,
                      ...(categoryFilter === cat ? styles.pillActive : styles.pillInactive),
                    }}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Type filter */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Type</span>
            <div style={styles.filterPills}>
              {(["all", "required", "advisory"] as TypeFilter[]).map((type) => (
                <button
                  key={type}
                  style={{
                    ...styles.pill,
                    ...(typeFilter === type ? styles.pillActive : styles.pillInactive),
                  }}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter count */}
          {hasActiveFilter && totalCount > 0 && (
            <span style={styles.filterCount}>
              {visibleCount} of {totalCount} items
            </span>
          )}
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────────── */}
      <div style={styles.contentArea}>
        {content ? (
          <>
            {/* Empty filtered state (task #4275) */}
            {isEmpty && (
              <div style={styles.emptyState}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#CBD5E1" strokeWidth="1.75" />
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#CBD5E1"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                <p style={styles.emptyText}>No items match the selected filters.</p>
                <button
                  style={styles.clearFiltersBtn}
                  onClick={() => {
                    setCategoryFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            <div
              ref={contentRef}
              className="rfp-html-content"
              style={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {isLoading && <span className="rfp-cursor" style={styles.cursor} />}
          </>
        ) : (
          <p style={styles.placeholder}>Waiting for response...</p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#F8FAFC",
    borderBottom: "1px solid #E2E8F0",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  headerTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#1E293B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  streamingBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    color: "#2563EB",
    fontWeight: 500,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  streamingDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#2563EB",
    display: "inline-block",
  },
  doneBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#16A34A",
    fontWeight: 500,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "10px 14px",
    backgroundColor: "#FAFAFA",
    borderBottom: "1px solid #E2E8F0",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748B",
    minWidth: "60px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  filterPills: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap",
  },
  pill: {
    fontSize: "11px",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "999px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    transition: "all 0.15s",
  },
  pillActive: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    borderColor: "#2563EB",
  },
  pillInactive: {
    backgroundColor: "#FFFFFF",
    color: "#64748B",
    borderColor: "#E2E8F0",
  },
  filterCount: {
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  contentArea: {
    padding: "14px",
    maxHeight: "500px",
    overflowY: "auto",
    position: "relative",
  },
  htmlContent: {
    fontSize: "13px",
    lineHeight: 1.7,
    color: "#334155",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "24px",
    textAlign: "center",
  },
  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  clearFiltersBtn: {
    background: "none",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    color: "#2563EB",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 12px",
    cursor: "pointer",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  placeholder: {
    margin: 0,
    fontSize: "13px",
    color: "#94A3B8",
    fontStyle: "italic",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  cursor: {
    display: "inline-block",
    width: "2px",
    height: "14px",
    backgroundColor: "#2563EB",
    marginLeft: "2px",
    verticalAlign: "text-bottom",
  },
};

export default StreamingOutput;
