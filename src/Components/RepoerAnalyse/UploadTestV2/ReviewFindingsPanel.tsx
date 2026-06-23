import React, { useMemo, useState } from 'react';
import Application from '../../../api/app';

export interface ReviewFinding {
  id: number;
  file_id: string;
  finding_type: string;
  severity: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'ignored';
  extracted_biomarker?: string | null;
  detail?: string | null;
  display_detail?: string | null;
  biomarker_id?: string | null;
}

interface ReviewFindingsPanelProps {
  findings: ReviewFinding[];
  loading?: boolean;
  // Called after a finding's status changes so the parent can refresh counts.
  onFindingUpdated?: () => void;
}

const FINDING_TYPE_LABELS: Record<string, string> = {
  biomarker_not_found: 'Unresolved biomarker',
  unit_mismatch: 'Unit warning',
  value_mismatch: 'Value warning',
  duplicate_biomarker: 'Duplicate',
  missing_clinic_rules: 'Missing clinic rules',
  unsupported_lab_type: 'Unsupported lab type',
  name_resolution: 'Name resolution',
  validation: 'Validation',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  ignored: 'bg-gray-100 text-gray-500 border-gray-200',
};

const ReviewFindingsPanel: React.FC<ReviewFindingsPanelProps> = ({
  findings,
  loading = false,
  onFindingUpdated,
}) => {
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { open, resolved } = useMemo(() => {
    const openList = findings.filter(
      (f) => f.status === 'pending' || f.status === 'reviewed',
    );
    const resolvedList = findings.filter(
      (f) => f.status === 'resolved' || f.status === 'ignored',
    );
    return { open: openList, resolved: resolvedList };
  }, [findings]);

  const updateStatus = async (
    finding: ReviewFinding,
    status: ReviewFinding['status'],
  ) => {
    if (updatingId) return;
    setUpdatingId(finding.id);
    try {
      await Application.updateLabReviewFinding({
        finding_id: finding.id,
        status,
      });
      onFindingUpdated?.();
    } catch (err) {
      console.error('Failed to update review finding:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!loading && findings.length === 0) {
    return null;
  }

  const renderFinding = (finding: ReviewFinding) => {
    const isTerminal =
      finding.status === 'resolved' || finding.status === 'ignored';
    return (
      <div
        key={finding.id}
        className="flex items-start justify-between gap-3 rounded-md border border-Gray-50 bg-white px-3 py-2"
      >
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-medium px-2 py-[1px] rounded-full border ${
                STATUS_STYLES[finding.status] || STATUS_STYLES.pending
              }`}
            >
              {finding.status}
            </span>
            <span className="text-[11px] text-Text-Secondary">
              {FINDING_TYPE_LABELS[finding.finding_type] || finding.finding_type}
            </span>
          </div>
          <span className="text-xs text-Text-Primary break-words">
            {finding.display_detail || finding.detail || finding.extracted_biomarker}
          </span>
        </div>
        {!isTerminal ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={updatingId === finding.id}
              onClick={() => updateStatus(finding, 'resolved')}
              className="text-[11px] font-medium px-2 py-1 rounded-md border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              Mark resolved
            </button>
            <button
              type="button"
              disabled={updatingId === finding.id}
              onClick={() => updateStatus(finding, 'ignored')}
              className="text-[11px] font-medium px-2 py-1 rounded-md border border-Gray-100 text-Text-Secondary hover:bg-Gray-50 disabled:opacity-50"
            >
              Ignore
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={updatingId === finding.id}
            onClick={() => updateStatus(finding, 'pending')}
            className="text-[11px] font-medium px-2 py-1 rounded-md border border-Gray-100 text-Text-Secondary hover:bg-Gray-50 disabled:opacity-50 shrink-0"
          >
            Reopen
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/40 p-3 mb-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-Text-Primary">
          Review findings
          {open.length > 0 ? ` (${open.length} open)` : ''}
        </span>
        {loading ? (
          <span className="text-[11px] text-Text-Secondary">Loading…</span>
        ) : null}
      </div>
      <p className="text-[11px] text-Text-Secondary">
        These items were flagged during review. Saving was not blocked — fix the
        biomarker rows above and mark each finding resolved, or ignore it.
      </p>
      <div className="flex flex-col gap-2 max-h-[220px] overflow-auto">
        {open.map(renderFinding)}
        {resolved.map(renderFinding)}
      </div>
    </div>
  );
};

export default ReviewFindingsPanel;
