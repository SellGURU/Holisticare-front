/**
 * Run: npx tsx scripts/run-category-ring-loading-tests.ts
 */
import { categoryRingLoading } from '../src/utils/asyncProcessing';

type Case = {
  name: string;
  card: {
    status?: number[] | null;
    values_ready?: boolean;
    flags_ready?: boolean;
    flags_source?: string;
  };
  scoringComplete: boolean;
  expected: boolean;
};

const cases: Case[] = [
  {
    name: 'preview_raw null with scoringComplete',
    card: { status: null, flags_ready: false, values_ready: true },
    scoringComplete: true,
    expected: true,
  },
  {
    name: 'ready array',
    card: {
      status: [10, 20, 30, 25, 15],
      flags_ready: true,
      flags_source: 'scored',
      values_ready: true,
    },
    scoringComplete: true,
    expected: false,
  },
  {
    name: 'missing during scoring',
    card: { status: null, flags_ready: false, values_ready: false },
    scoringComplete: false,
    expected: true,
  },
  {
    name: 'undefined status',
    card: { flags_ready: true, values_ready: true },
    scoringComplete: true,
    expected: true,
  },
];

let failed = 0;
for (const c of cases) {
  const result = categoryRingLoading(c.card, c.scoringComplete);
  if (result !== c.expected) {
    failed += 1;
    console.error(`FAIL: ${c.name}`, { expected: c.expected, got: result });
  } else {
    console.log(`OK: ${c.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(`All ${cases.length} category ring cases passed.`);
