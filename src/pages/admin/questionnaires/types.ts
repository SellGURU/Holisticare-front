export interface AdminClinicOption {
  clinic_id: number;
  name: string;
  primary_email?: string;
}

export interface QuestionnaireTemplateRow {
  id: number;
  unique_id: string | null;
  clinic_id: number;
  title: string;
  description: string;
  questions: unknown[];
  questions_count: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ClinicQuestionnaireRow {
  id: string;
  title: string;
  questions: number;
  created_on: string | null;
  created_by: string;
  time_required: number;
  show_consent?: boolean;
  consent_text?: string;
}

export type CopySource =
  | { kind: 'template'; templateId: number; title: string }
  | { kind: 'clinic'; clinicId: number; uniqueId: string; title: string };
