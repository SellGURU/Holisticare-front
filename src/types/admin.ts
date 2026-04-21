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
export type ReportTone = 'neutral' | 'supportive' | 'action_oriented' | 'executive';
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
