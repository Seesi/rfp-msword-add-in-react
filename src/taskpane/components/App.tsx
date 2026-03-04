import * as React from "react";
import { useState } from "react";
import { useComplianceApi } from "../hooks/useComplianceApi";
import { UploadTab } from "./UploadTab";
import { ChecklistTab } from "./CheckListTab";
import { FlagsTab } from "./FlagsTab";
import { DatesTab } from "./DateTab";
import { ScoreTab } from "./ScoreTab";
import { TabId } from "../types";

interface AppProps {
  title: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "checklist", label: "Checklist" },
  { id: "flags", label: "Flags" },
  { id: "dates", label: "Dates" },
  { id: "score", label: "Score" },
];

const App: React.FC<AppProps> = () => {
  const [activeTab, setActiveTab] = useState<TabId>("upload");
  const [lastUpdated] = useState<string>(
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );

  const api = useComplianceApi();

  const handleGenerateChecklist = async () => {
    setActiveTab("checklist");
    // Fire all 3 analysis calls in parallel
    await Promise.all([api.fetchChecklist(), api.fetchFlags(), api.fetchDates()]);
  };

  const handleReset = () => {
    api.reset();
    setActiveTab("upload");
  };

  const hasSession = !!api.sessionId;

  return (
    <div style={s.root}>
      {/* ── Header ─────────────────────────────────────── */}
      <div style={s.header}>
        <div>
          <h1 style={s.headerTitle}>RFP Compliance assistant</h1>
          <p style={s.headerSub}>Analyze and track RFP requirements</p>
        </div>
        {/* Three-dot menu placeholder */}
        <button style={s.menuBtn} onClick={handleReset} title="Reset session">
          <span style={s.dot} />
          <span style={s.dot} />
          <span style={s.dot} />
        </button>
      </div>

      {/* ── Tab bar ────────────────────────────────────── */}
      <div style={s.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...s.tabBtn,
              ...(activeTab === tab.id ? s.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && <div style={s.tabUnderline} />}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────── */}
      <div style={s.tabContent}>
        {activeTab === "upload" && (
          <UploadTab
            uploadState={api.uploadState}
            uploadError={api.uploadError}
            uploadedFileName={api.uploadedFileName}
            onUpload={(files) => api.uploadFile(files)}
            onGenerateChecklist={handleGenerateChecklist}
            sessionId={api.sessionId}
          />
        )}
        {activeTab === "checklist" && (
          <ChecklistTab
            state={api.checklistState}
            error={api.checklistError}
            data={api.checklistData}
            hasSession={hasSession}
          />
        )}
        {activeTab === "flags" && (
          <FlagsTab
            state={api.flagsState}
            error={api.flagsError}
            data={api.flagsData}
            hasSession={hasSession}
          />
        )}
        {activeTab === "dates" && (
          <DatesTab
            state={api.datesState}
            error={api.datesError}
            data={api.datesData}
            hasSession={hasSession}
          />
        )}
        {activeTab === "score" && (
          <ScoreTab
            state={api.scoringState}
            error={api.scoringError}
            data={api.scoringData}
            hasSession={hasSession}
            sessionId={api.sessionId}
            uploadedFileName={api.uploadedFileName}
            onScore={api.fetchScoring}
          />
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <div style={s.footer}>
        <span style={s.footerText}>
          {hasSession ? `Last updated: ${lastUpdated}` : "No session active"}
        </span>
        <button style={s.settingsBtn} onClick={handleReset} title="Reset session">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15a3 3 0 100-6 3 3 0 000 6z"
              stroke="#94A3B8"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
              stroke="#94A3B8"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#FFFFFF",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    padding: "14px 16px 0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottom: "1px solid #F1F5F9",
  },
  headerTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 700,
    color: "#0F172A",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  headerSub: {
    margin: "2px 0 12px",
    fontSize: "11px",
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  menuBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    gap: "3px",
    padding: "4px",
    marginTop: "2px",
    alignItems: "center",
  },
  dot: {
    display: "inline-block",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#94A3B8",
  },
  tabBar: {
    display: "flex",
    borderBottom: "1px solid #E2E8F0",
    padding: "0 8px",
    overflowX: "auto",
  },
  tabBtn: {
    position: "relative",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "10px 10px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#64748B",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  tabBtnActive: { color: "#6366F1", fontWeight: 600 },
  tabUnderline: {
    position: "absolute",
    bottom: "-1px",
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: "#6366F1",
    borderRadius: "2px 2px 0 0",
  },
  tabContent: { flex: 1, overflowY: "auto" },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "1px solid #F1F5F9",
  },
  footerText: {
    fontSize: "11px",
    color: "#94A3B8",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  settingsBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
  },
};

export default App;
