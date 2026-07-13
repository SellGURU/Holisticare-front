import { describe, expect, it } from 'vitest';
import { resolveDescriptionDisplayPhase } from './resolveDescriptionDisplayPhase';

describe('resolveDescriptionDisplayPhase', () => {
  it('shows loading for fresh generate with interim text', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: false,
      descriptionText: 'wrong',
      committedText: null,
      overviewProcessing: true,
    });
    expect(result.phase).toBe('loading');
    expect(result.nextCommittedText).toBeNull();
  });

  it('commits cached DB description on first ready poll', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: true,
      descriptionText: 'A',
      committedText: null,
      overviewProcessing: false,
    });
    expect(result.phase).toBe('ready_changed');
    expect(result.nextCommittedText).toBe('A');
  });

  it('stays ready_unchanged when text is stable', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: true,
      descriptionText: 'A',
      committedText: 'A',
      overviewProcessing: false,
    });
    expect(result.phase).toBe('ready_unchanged');
    expect(result.nextCommittedText).toBe('A');
  });

  it('transitions ready_changed when text updates', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: true,
      descriptionText: 'B',
      committedText: 'A',
      overviewProcessing: true,
    });
    expect(result.phase).toBe('ready_changed');
    expect(result.nextCommittedText).toBe('B');
  });

  it('holds committed text during processing when not ready', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: false,
      descriptionText: 'wrong interim',
      committedText: 'A',
      overviewProcessing: true,
    });
    expect(result.phase).toBe('ready_unchanged');
    expect(result.nextCommittedText).toBe('A');
  });

  it('shows loading when ready flag is true but text is empty', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: true,
      descriptionText: '',
      committedText: null,
      overviewProcessing: false,
    });
    expect(result.phase).toBe('loading');
    expect(result.nextCommittedText).toBeNull();
  });

  it('shows loading during reprocessing even with failOpen', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: false,
      descriptionText: 'Catalog fallback text',
      committedText: null,
      overviewProcessing: true,
      isReprocessing: true,
      failOpen: true,
    });
    expect(result.phase).toBe('loading');
    expect(result.nextCommittedText).toBeNull();
  });

  it('fail-opens to catalog text only when permanently missing', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: false,
      descriptionText: 'Catalog fallback text',
      committedText: null,
      overviewProcessing: false,
      isReprocessing: false,
      failOpen: true,
    });
    expect(result.phase).toBe('ready_unchanged');
    expect(result.nextCommittedText).toBe('Catalog fallback text');
  });

  it('does not fail-open when fallback text is whitespace only', () => {
    const result = resolveDescriptionDisplayPhase({
      descriptionReady: false,
      descriptionText: '   ',
      committedText: null,
      overviewProcessing: false,
      failOpen: true,
    });
    expect(result.phase).toBe('loading');
    expect(result.nextCommittedText).toBeNull();
  });
});
