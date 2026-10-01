import { describe, expect, it } from 'vitest';
import {
  globalDemoStatusClass,
  globalDemoStatusLabel,
  hasDemoTemplateManage,
  isCandidateSelectable,
  jobIsActive,
  maskIdentifier,
  progressSummary,
} from './globalDemoUtils';

describe('globalDemoUtils', () => {
  it('masks identifiers without exposing the full value', () => {
    expect(maskIdentifier('12345678')).toBe('••••5678');
    expect(maskIdentifier('12')).toBe('••');
    expect(maskIdentifier(null)).toBe('••••');
  });

  it('checks demo_template_manage from stored permissions', () => {
    expect(hasDemoTemplateManage({ demo_template_manage: true })).toBe(true);
    expect(hasDemoTemplateManage({ demo_template_manage: 'true' })).toBe(true);
    expect(hasDemoTemplateManage({})).toBe(false);
  });

  it('disables already-global candidates', () => {
    expect(
      isCandidateSelectable({
        patient_id: '1',
        patient_id_masked: '•1',
        member_id_masked: '•2',
        clinic_id: 3,
        clinic_name: 'North',
        display_name: 'Ada',
        already_global: true,
      }),
    ).toBe(false);
  });

  it('labels statuses and active jobs', () => {
    expect(globalDemoStatusLabel('failed')).toBe('Needs retry');
    expect(globalDemoStatusClass('active')).toContain('emerald');
    expect(jobIsActive({ status: 'running' })).toBe(true);
    expect(jobIsActive({ status: 'succeeded' })).toBe(false);
  });

  it('summarizes progress', () => {
    expect(
      progressSummary({
        global_demo_id: 'g',
        source_patient_id: '1',
        source_patient_id_masked: '•1',
        source_member_id_masked: '•2',
        source_clinic_id: 3,
        display_name: 'Demo Client1',
        status: 'active',
        revision: 1,
        progress: { total: 4, copied: 2, skipped: 1, failed: 1, archived: 0 },
        failed_clinics: [],
      }),
    ).toBe('Copied 2 · skipped 1 · failed 1 · total 4');
  });
});
