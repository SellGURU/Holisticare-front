import { describe, expect, it } from 'vitest';
import {
  shouldKeepOverviewPollRunning,
  shouldResetOverviewPollSession,
  shouldRefreshBiomarkersOnCountChange,
  snapshotHasCanonicalOperation,
  snapshotIsInFlight,
  snapshotIsSettled,
  sourceSnapshotChanged,
  snapshotSourceSignature,
  type OverviewSnapshot,
} from './useOverviewPoll';
import { domainsThatBecameTerminal } from '../utils/processingCompletion';

describe('sourceSnapshotChanged', () => {
  it('is false when revision and count match the baseline', () => {
    const snapshot: OverviewSnapshot = {
      data_revision: 'rev-1',
      biomarker_count: 2,
      data_phase: 'complete',
      processing: false,
    };
    expect(
      sourceSnapshotChanged(snapshotSourceSignature(snapshot), snapshot),
    ).toBe(false);
  });

  it('is true when biomarker_count drops after a questionnaire delete', () => {
    const baseline = { revision: 'rev-1', count: 2 };
    const afterDelete: OverviewSnapshot = {
      data_revision: 'rev-1',
      biomarker_count: 1,
      data_phase: 'complete',
      processing: false,
    };
    expect(sourceSnapshotChanged(baseline, afterDelete)).toBe(true);
  });

  it('treats background 1.3 work as still in flight', () => {
    expect(
      snapshotIsInFlight({
        processing: false,
        background_processing: true,
      }),
    ).toBe(true);
    expect(
      snapshotIsSettled({
        processing: false,
        background_processing: true,
      }),
    ).toBe(false);
  });

  it('does not reset an in-flight overview poll session', () => {
    expect(shouldResetOverviewPollSession(true)).toBe(false);
    expect(shouldResetOverviewPollSession(false)).toBe(true);
  });

  it('does not treat timeout-equivalent idle snapshot as the current operation', () => {
    expect(
      snapshotHasCanonicalOperation(
        {
          processing: false,
          operation_state: 'completed',
          operation_started_at: '2020-01-01T00:00:00.000Z',
          outcomes: {
            biomarkers: { state: 'ready' },
          },
        },
        Date.now(),
      ),
    ).toBe(false);
  });

  it('accepts a running operation as canonical without waiting for timeout', () => {
    expect(
      snapshotHasCanonicalOperation({
        processing: true,
        operation_state: 'running',
        outcomes: { biomarkers: { state: 'pending' } },
      }),
    ).toBe(true);
  });

  it('treats a questionnaire fill log as canonical while biomarkers are still pending', () => {
    expect(
      snapshotHasCanonicalOperation({
        processing: false,
        operation_state: 'running',
        outcomes: { biomarkers: { state: 'pending' } },
      }),
    ).toBe(true);
  });

  it('emits biomarker domain ready without waiting for narrative', () => {
    const domains = domainsThatBecameTerminal(
      { biomarkers: { state: 'pending' }, client_summary: { state: 'pending' } },
      {
        biomarkers: { state: 'ready', data_revision: 'r2' },
        client_summary: { state: 'pending' },
      },
    );
    expect(domains).toEqual(['biomarkers']);
  });

  it('collects an all-terminal first snapshot into one domain wave', () => {
    const next = {
      biomarkers: { state: 'ready' as const, data_revision: 'b1' },
      category_insights: { state: 'ready' as const, data_revision: 'c1' },
    };
    const became = domainsThatBecameTerminal({}, next);
    expect(became.sort()).toEqual(['biomarkers', 'category_insights']);
  });

  it('keeps polling after domains are ready while background processing is on', () => {
    expect(
      shouldKeepOverviewPollRunning({
        processing: false,
        background_processing: true,
        operation_state: 'completed',
        outcomes: {
          biomarkers: { state: 'ready' },
          client_summary: { state: 'ready' },
        },
      }),
    ).toBe(true);
    expect(
      shouldKeepOverviewPollRunning({
        processing: true,
        background_processing: false,
        outcomes: { biomarkers: { state: 'pending' } },
      }),
    ).toBe(true);
    expect(
      shouldKeepOverviewPollRunning({
        processing: false,
        background_processing: false,
        operation_state: 'completed',
        outcomes: {
          biomarkers: { state: 'ready' },
          client_summary: { state: 'ready' },
        },
      }),
    ).toBe(false);
  });

  it('refreshes Need Focus as soon as scored biomarker count appears', () => {
    expect(shouldRefreshBiomarkersOnCountChange(null, 0)).toBe(false);
    expect(shouldRefreshBiomarkersOnCountChange(null, 4)).toBe(true);
    expect(shouldRefreshBiomarkersOnCountChange(4, 4)).toBe(false);
    expect(shouldRefreshBiomarkersOnCountChange(4, 12)).toBe(true);
    expect(shouldRefreshBiomarkersOnCountChange(12, 0)).toBe(true);
  });
});
