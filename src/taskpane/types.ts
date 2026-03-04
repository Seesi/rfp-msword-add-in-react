export interface RfpSummary {
  title: string;
  issuingOrganization: string;
  submissionDueDate: string;
  submissionMethod: string;
}

export interface UploadResponse {
  sessionId: string;
  fileCount: number;
}

export interface ChecklistItem {
  id: string;
  requirement: string;
  type: "Required" | "Conditional" | "Advisory" | string;
  source: string;
  condition: string | null;
  notes: string | null;
}

export interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export interface ChecklistResponse {
  message?: string;
  hasAnalysisContent?: boolean;
  summary: RfpSummary;
  categories: ChecklistCategory[];
}

export type FlagSeverity = "Critical" | "Warning" | "Info" | string;

export interface FlagItem {
  id: string;
  title: string;
  severity: FlagSeverity;
  issue: string;
  source: string;
  recommendation: string;
}

export interface FlagsResponse {
  summary: RfpSummary;
  flags: FlagItem[];
}

export interface DateEntry {
  event: string;
  date: string;
  source: string;
  conflict: string | null;
}

export interface DatesResponse {
  summary: RfpSummary;
  dates: DateEntry[];
}

export type ScoringStatus = "Addressed" | "Partial" | "Missing" | "NotApplicable" | string;

export interface ItemAssessment {
  id: string;
  requirement: string;
  status: ScoringStatus;
  evidence: string | null;
  suggestion: string | null;
}

export interface CategoryScore {
  category: string;
  score: number;
  addressed: number;
  total: number;
  items: ItemAssessment[];
}

export interface ScoringResponse {
  summary: RfpSummary;
  overallScore: number;
  categoryScores: CategoryScore[];
  warning: string | null;
}

export type TabId = "upload" | "checklist" | "flags" | "dates" | "score";
export type LoadingState = "idle" | "loading" | "success" | "error";
