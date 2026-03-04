import { useState } from "react";
import {
  UploadResponse,
  ChecklistResponse,
  FlagsResponse,
  DatesResponse,
  ScoringResponse,
  LoadingState,
} from "../types";

const BASE =
  "https://func-app-wordaddin-ai-01-hhbce0gsbbbkdqes.westeurope-01.azurewebsites.net/api";

const EP = {
  upload: `${BASE}/compliance/upload`,
  checklist: `${BASE}/compliance/checklist`,
  flags: `${BASE}/compliance/flags`,
  dates: `${BASE}/compliance/dates`,
  scoring: `${BASE}/compliance/scoring`,
  session: (id: string) => `${BASE}/compliance/session/${id}`,
};

async function postJson<T>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface UseComplianceApiReturn {
  sessionId: string | null;
  uploadedFileName: string | null;
  uploadState: LoadingState;
  uploadError: string | null;
  uploadFile: (files: File[]) => Promise<void>;
  checklistState: LoadingState;
  checklistError: string | null;
  checklistData: ChecklistResponse | null;
  fetchChecklist: () => Promise<void>;
  flagsState: LoadingState;
  flagsError: string | null;
  flagsData: FlagsResponse | null;
  fetchFlags: () => Promise<void>;
  datesState: LoadingState;
  datesError: string | null;
  datesData: DatesResponse | null;
  fetchDates: () => Promise<void>;
  scoringState: LoadingState;
  scoringError: string | null;
  scoringData: ScoringResponse | null;
  fetchScoring: (proposalText: string) => Promise<void>;
  reset: () => void;
}

export const useComplianceApi = (): UseComplianceApiReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<LoadingState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<LoadingState>("idle");
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [checklistData, setChecklistData] = useState<ChecklistResponse | null>(null);
  const [flagsState, setFlagsState] = useState<LoadingState>("idle");
  const [flagsError, setFlagsError] = useState<string | null>(null);
  const [flagsData, setFlagsData] = useState<FlagsResponse | null>(null);
  const [datesState, setDatesState] = useState<LoadingState>("idle");
  const [datesError, setDatesError] = useState<string | null>(null);
  const [datesData, setDatesData] = useState<DatesResponse | null>(null);
  const [scoringState, setScoringState] = useState<LoadingState>("idle");
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [scoringData, setScoringData] = useState<ScoringResponse | null>(null);

  const uploadFile = async (files: File[]): Promise<void> => {
    setUploadState("loading");
    setUploadError(null);
    setUploadedFileName(
      files.length === 1 ? files[0].name : `${files[0].name} +${files.length - 1} more`
    );
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file, file.name));
      const res = await fetch(EP.upload, { method: "POST", body: formData });
      if (!res.ok)
        throw new Error((await res.text().catch(() => "")) || `Upload failed (${res.status})`);
      const data: UploadResponse = await res.json();
      setSessionId(data.sessionId);
      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  const fetchChecklist = async (): Promise<void> => {
    if (!sessionId) return;
    setChecklistState("loading");
    setChecklistError(null);
    try {
      setChecklistData(await postJson<ChecklistResponse>(EP.checklist, { sessionId }));
      setChecklistState("success");
    } catch (err) {
      setChecklistState("error");
      setChecklistError(err instanceof Error ? err.message : "Failed to fetch checklist.");
    }
  };

  const fetchFlags = async (): Promise<void> => {
    if (!sessionId) return;
    setFlagsState("loading");
    setFlagsError(null);
    try {
      setFlagsData(await postJson<FlagsResponse>(EP.flags, { sessionId }));
      setFlagsState("success");
    } catch (err) {
      setFlagsState("error");
      setFlagsError(err instanceof Error ? err.message : "Failed to fetch flags.");
    }
  };

  const fetchDates = async (): Promise<void> => {
    if (!sessionId) return;
    setDatesState("loading");
    setDatesError(null);
    try {
      setDatesData(await postJson<DatesResponse>(EP.dates, { sessionId }));
      setDatesState("success");
    } catch (err) {
      setDatesState("error");
      setDatesError(err instanceof Error ? err.message : "Failed to fetch dates.");
    }
  };

  const fetchScoring = async (proposalText: string): Promise<void> => {
    if (!sessionId) return;
    setScoringState("loading");
    setScoringError(null);
    try {
      setScoringData(await postJson<ScoringResponse>(EP.scoring, { sessionId, proposalText }));
      setScoringState("success");
    } catch (err) {
      setScoringState("error");
      setScoringError(err instanceof Error ? err.message : "Failed to score proposal.");
    }
  };

  const reset = () => {
    if (sessionId) fetch(EP.session(sessionId), { method: "DELETE" }).catch(() => {});
    setSessionId(null);
    setUploadedFileName(null);
    setUploadState("idle");
    setUploadError(null);
    setChecklistState("idle");
    setChecklistError(null);
    setChecklistData(null);
    setFlagsState("idle");
    setFlagsError(null);
    setFlagsData(null);
    setDatesState("idle");
    setDatesError(null);
    setDatesData(null);
    setScoringState("idle");
    setScoringError(null);
    setScoringData(null);
  };

  return {
    sessionId,
    uploadedFileName,
    uploadState,
    uploadError,
    uploadFile,
    checklistState,
    checklistError,
    checklistData,
    fetchChecklist,
    flagsState,
    flagsError,
    flagsData,
    fetchFlags,
    datesState,
    datesError,
    datesData,
    fetchDates,
    scoringState,
    scoringError,
    scoringData,
    fetchScoring,
    reset,
  };
};
