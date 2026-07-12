/**
 * Run: npx tsx scripts/run-description-phase-tests.ts
 * (No vitest install required)
 */
import {
  resolveDescriptionDisplayPhase,
  type DescriptionDisplayPhase,
} from '../src/utils/resolveDescriptionDisplayPhase';

type Case = {
  name: string;
  input: Parameters<typeof resolveDescriptionDisplayPhase>[0];
  expectedPhase: DescriptionDisplayPhase;
  expectedText: string | null;
};

const cases: Case[] = [
  {
    name: 'Fresh generate',
    input: {
      descriptionReady: false,
      descriptionText: 'wrong',
      committedText: null,
      overviewProcessing: true,
    },
    expectedPhase: 'loading',
    expectedText: null,
  },
  {
    name: 'Cached DB',
    input: {
      descriptionReady: true,
      descriptionText: 'A',
      committedText: null,
      overviewProcessing: false,
    },
    expectedPhase: 'ready_changed',
    expectedText: 'A',
  },
  {
    name: 'A→A stable',
    input: {
      descriptionReady: true,
      descriptionText: 'A',
      committedText: 'A',
      overviewProcessing: false,
    },
    expectedPhase: 'ready_unchanged',
    expectedText: 'A',
  },
  {
    name: 'A→B change',
    input: {
      descriptionReady: true,
      descriptionText: 'B',
      committedText: 'A',
      overviewProcessing: true,
    },
    expectedPhase: 'ready_changed',
    expectedText: 'B',
  },
  {
    name: 'Processing hold (not reprocessing)',
    input: {
      descriptionReady: false,
      descriptionText: 'wrong interim',
      committedText: 'A',
      overviewProcessing: false,
      isReprocessing: false,
    },
    expectedPhase: 'ready_unchanged',
    expectedText: 'A',
  },
  {
    name: 'Upload reprocess',
    input: {
      descriptionReady: false,
      descriptionText: 'old interim',
      committedText: 'old',
      overviewProcessing: true,
      isReprocessing: true,
    },
    expectedPhase: 'loading',
    expectedText: null,
  },
  {
    name: 'Upload done',
    input: {
      descriptionReady: true,
      descriptionText: 'new',
      committedText: null,
      overviewProcessing: false,
      isReprocessing: false,
    },
    expectedPhase: 'ready_changed',
    expectedText: 'new',
  },
  {
    name: 'Empty ready flag',
    input: {
      descriptionReady: true,
      descriptionText: '',
      committedText: null,
      overviewProcessing: false,
    },
    expectedPhase: 'loading',
    expectedText: null,
  },
];

let failed = 0;
for (const c of cases) {
  const result = resolveDescriptionDisplayPhase(c.input);
  const ok =
    result.phase === c.expectedPhase &&
    result.nextCommittedText === c.expectedText;
  if (!ok) {
    failed += 1;
    console.error(`FAIL: ${c.name}`, { expected: c, got: result });
  } else {
    console.log(`OK: ${c.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(`All ${cases.length} cases passed.`);
