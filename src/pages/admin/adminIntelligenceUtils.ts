export function canManageClinicIntelligence(
  clinicId: number | '',
): clinicId is number {
  return typeof clinicId === 'number' && clinicId > 0;
}

export interface IntelligenceCopySummary {
  source_formula_count: number;
  clinics_targeted: number;
  copied: number;
  skipped_existing: number;
  skipped_unavailable: number;
}

export interface IntelligenceSyncSummary {
  formula_count: number;
  clinics_targeted: number;
  created: number;
  updated: number;
  skipped: number;
}

export function intelligenceSyncSummaryMessage(
  summary: IntelligenceSyncSummary,
): string {
  if (!summary.formula_count) {
    return 'There are no default formulas to sync.';
  }
  if (!summary.clinics_targeted) {
    return 'There are no clinics to sync.';
  }
  const formulaLabel = summary.formula_count === 1 ? 'formula' : 'formulas';
  const clinicLabel = summary.clinics_targeted === 1 ? 'clinic' : 'clinics';
  const parts = [
    `Synced ${summary.formula_count} default ${formulaLabel} to ${summary.clinics_targeted} ${clinicLabel}.`,
  ];
  if (summary.created > 0) {
    parts.push(`${summary.created} added.`);
  }
  if (summary.updated > 0) {
    parts.push(`${summary.updated} updated.`);
  }
  if (summary.skipped > 0) {
    parts.push(
      `${summary.skipped} could not be copied because a clinic is missing a biomarker or questionnaire the formula needs.`,
    );
  }
  return parts.join(' ');
}

export function intelligenceCopySummaryMessage(
  summary: IntelligenceCopySummary,
): string {
  if (!summary.source_formula_count) {
    return 'This clinic has no Intelligence formulas to copy.';
  }
  if (!summary.clinics_targeted) {
    return 'There are no other clinics to copy these formulas to.';
  }
  if (
    summary.copied === 0 &&
    summary.skipped_unavailable === 0 &&
    summary.skipped_existing > 0
  ) {
    return 'Every other clinic already has these formulas.';
  }

  const formulaLabel = summary.copied === 1 ? 'formula' : 'formulas';
  const clinicLabel = summary.clinics_targeted === 1 ? 'clinic' : 'clinics';
  const parts = [
    `Copied ${summary.copied} ${formulaLabel} across ${summary.clinics_targeted} ${clinicLabel}.`,
  ];
  if (summary.skipped_existing > 0) {
    parts.push(`${summary.skipped_existing} already existed and were left unchanged.`);
  }
  if (summary.skipped_unavailable > 0) {
    parts.push(
      `${summary.skipped_unavailable} could not be copied because a clinic is missing a biomarker or questionnaire the formula needs.`,
    );
  }
  return parts.join(' ');
}
