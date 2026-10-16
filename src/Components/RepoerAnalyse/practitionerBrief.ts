export type BriefSeverity =
  | 'informational'
  | 'monitor'
  | 'review'
  | 'urgent_review';
export type CoverageStatus = 'covered' | 'partial' | 'not_available' | 'failed';

export type SourceRef = {
  ref_id: string;
  source_type: string;
  label: string;
  source_date?: string | null;
};

export type SourceCoverage = {
  source_type: string;
  status: CoverageStatus;
  item_count: number;
  last_source_date?: string | null;
};

export type PractitionerBrief = {
  executive_summary: string;
  priority_signals: Array<{
    title: string;
    severity: BriefSeverity;
    why_review: string;
    source_refs: SourceRef[];
  }>;
  source_summaries: Array<{
    source_type: string;
    summary: string;
    source_refs: SourceRef[];
  }>;
  cross_source_patterns: Array<{
    title: string;
    summary: string;
    source_refs: SourceRef[];
  }>;
  data_gaps: Array<{ source_type: string; summary: string }>;
  review_suggestions: Array<{
    topic: string;
    practitioner_review_note: string;
    source_refs: SourceRef[];
  }>;
  source_coverage: SourceCoverage[];
};

export type PractitionerBriefResponse = {
  feature_enabled: boolean;
  status: 'empty' | 'pending' | 'ready' | 'partial' | 'failed' | 'hidden';
  locale: string;
  is_stale: boolean;
  stale_reasons: string[];
  generated_at?: string | null;
  brief?: PractitionerBrief | null;
  source_coverage: SourceCoverage[];
};

export const SEVERITY_LABELS: Record<BriefSeverity, string> = {
  informational: 'Informational',
  monitor: 'Monitor',
  review: 'Review',
  urgent_review: 'Urgent review',
};
