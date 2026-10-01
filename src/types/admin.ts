export interface GlobalDemoProgress {
  total: number;
  copied: number;
  skipped: number;
  failed: number;
  archived: number;
}

export interface GlobalDemoFailedClinic {
  clinic_id: number;
  error?: string | null;
}

export interface GlobalDemoJob {
  job_id: string;
  status: string;
  copied?: number;
  skipped?: number;
  failed?: number;
  total?: number;
  current_clinic_id?: number | null;
  last_error?: string | null;
}

export interface GlobalDemoCandidate {
  patient_id: string;
  patient_id_masked: string;
  member_id_masked: string;
  clinic_id: number;
  clinic_name: string;
  display_name: string;
  already_global: boolean;
}

export interface GlobalDemoClientItem {
  global_demo_id: string;
  source_patient_id: string;
  source_patient_id_masked: string;
  source_member_id_masked: string;
  source_clinic_id: number;
  source_clinic_name?: string | null;
  display_name: string;
  status: string;
  revision: number;
  job_id?: string | null;
  last_error?: string | null;
  progress: GlobalDemoProgress;
  failed_clinics: GlobalDemoFailedClinic[];
  job?: GlobalDemoJob | null;
}

export interface GlobalDemoJobAccepted {
  global_demo_id: string;
  job_id: string;
  status: string;
  reused?: boolean;
}

export type NotePeriodType = 'one_off' | 'daily' | 'weekly' | 'monthly';
export type NoteVisibility = 'internal' | 'leadership';
export type FollowUpState =
  | 'no_action'
  | 'monitor'
  | 'follow_up_this_week'
  | 'escalate'
  | 'resolved';
export type AdminTagType =
  | 'sentiment'
  | 'product_issue'
  | 'business_issue'
  | 'opportunity'
  | 'workflow'
  | 'custom';
export type ReportMode =
  | 'quick_summary'
  | 'kpi_report'
  | 'reasoning_report'
  | 'stakeholder_update'
  | 'portfolio_report';
export type ReportAudience =
  | 'internal_support'
  | 'product_team'
  | 'founders'
  | 'external_stakeholder';
export type ReportTone =
  | 'neutral'
  | 'supportive'
  | 'action_oriented'
  | 'executive';
export type ReportLength = 'short' | 'medium' | 'long';

export interface ClinicNote {
  id: string;
  clinicEmail: string;
  author: string;
  createdAt: string;
  periodType: NotePeriodType;
  title: string;
  body: string;
  tags: string[];
  visibility: NoteVisibility;
  followUpRequired: boolean;
  followUpDueDate: string;
  pinned: boolean;
  templateKey?: string;
}

export interface ClinicTag {
  id: string;
  clinicEmail: string;
  name: string;
  tagType: AdminTagType;
  color: string;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface ClinicWorkspaceRecord {
  clinicEmail: string;
  followUpState: FollowUpState;
  notes: ClinicNote[];
  tags: ClinicTag[];
  updatedAt: string;
}

export interface ClinicReport {
  id: string;
  clinicEmails: string[];
  mode: ReportMode;
  audience: ReportAudience;
  tone: ReportTone;
  length: ReportLength;
  includeSections: string[];
  customPrompt: string;
  createdAt: string;
  output: string;
}

export interface ReportComposerState {
  clinicEmails: string[];
  mode: ReportMode;
  audience: ReportAudience;
  tone: ReportTone;
  length: ReportLength;
  includeSections: string[];
  customPrompt: string;
}
