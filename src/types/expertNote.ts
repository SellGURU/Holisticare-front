/**
 * Expert Note file attachment types.
 *
 * See doc/EXPERT_NOTE_FILE_ATTACHMENT_PLAN.md for the full design.
 */

export interface NoteAttachmentInput {
  blob_url: string;
  file_name: string;
  file_type: string;
}

export type NoteAttachmentExtractionStatus =
  | 'pending'
  | 'done'
  | 'failed'
  | 'skipped'
  | null;

export interface ExpertNote {
  date: string;
  time: string;
  writer: string;
  note: string;
  unique_id: string;
  has_attachment: boolean;
  attachment_file_name: string | null;
  attachment_extraction_status: NoteAttachmentExtractionStatus;
}
