import { describe, expect, it } from 'vitest';
import {
  resolveCompileButtonState,
  resolveOverviewPageAndButtonProcessing,
} from './compileButtonState';

const idleInput = {
  progressData: [] as Array<{ category?: string; process_status?: boolean }>,
  isCompiling: false,
  isLoading: false,
  needCompile: false,
  isSyncing: false,
  beRecompile: false,
  overviewProcessing: false,
};

describe('resolveCompileButtonState', () => {
  it('shows Processing when overview.processing is true even with empty progress', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        overviewProcessing: true,
      }),
    ).toBe('PROGRESSING');
  });

  it('returns Compiled after overview processing finishes and progress is empty', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        overviewProcessing: false,
      }),
    ).toBe('IDLE');
  });

  it('shows Processing while a questionnaire or file is in flight', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        progressData: [
          { category: 'questionnaire', process_status: false },
        ],
      }),
    ).toBe('PROGRESSING');
  });

  it('shows Processing while a questionnaire is in flight without implying page skeletons', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        overviewProcessing: true,
      }),
    ).toBe('PROGRESSING');
    expect(
      resolveOverviewPageAndButtonProcessing({
        processing: false,
        background_processing: true,
      }).pageProcessing,
    ).toBe(false);
  });

  it('keeps Compiling above overview processing so existing report data can stay on screen', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        isCompiling: true,
        overviewProcessing: true,
      }),
    ).toBe('COMPILING');
  });

  it('shows Compile when needCompile is true and nothing is in flight', () => {
    expect(
      resolveCompileButtonState({
        ...idleInput,
        needCompile: true,
      }),
    ).toBe('READY_TO_COMPILE');
  });
});

describe('resolveOverviewPageAndButtonProcessing', () => {
  it('keeps page loaders off while 1.3 runs in the background', () => {
    expect(
      resolveOverviewPageAndButtonProcessing({
        processing: false,
        background_processing: true,
      }),
    ).toEqual({ pageProcessing: false, buttonProcessing: true });
  });

  it('still blocks the page while scoring or 1.1-1.2 are in flight', () => {
    expect(
      resolveOverviewPageAndButtonProcessing({
        processing: true,
        background_processing: false,
      }),
    ).toEqual({ pageProcessing: true, buttonProcessing: true });
  });

  it('clears page loaders on stale or review even if a job was running', () => {
    expect(
      resolveOverviewPageAndButtonProcessing({
        processing: true,
        stale: true,
      }),
    ).toEqual({ pageProcessing: false, buttonProcessing: false });
  });
});
