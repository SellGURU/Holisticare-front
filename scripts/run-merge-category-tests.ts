/**
 * Run: npx tsx scripts/run-merge-category-tests.ts
 */
import { mergeCategoryCard } from '../src/utils/mergeCategoryCards';

type Case = {
  name: string;
  existing: Record<string, unknown>;
  incoming: Record<string, unknown>;
  expectedDescription: string;
  expectedReady: boolean;
  expectedPending: boolean;
};

const cases: Case[] = [
  {
    name: 'Upload (pending true)',
    existing: {
      description_ready: true,
      description: 'old',
      subcategory: 'Thyroid Function',
    },
    incoming: {
      description_ready: false,
      description_pending: true,
      description: 'stale from server',
    },
    expectedDescription: '',
    expectedReady: false,
    expectedPending: true,
  },
  {
    name: 'Missing pending field',
    existing: {
      description_ready: true,
      description: 'old',
    },
    incoming: {
      description_ready: false,
      description: 'stale from server',
    },
    expectedDescription: '',
    expectedReady: false,
    expectedPending: true,
  },
  {
    name: 'Explicit glitch (pending false)',
    existing: {
      description_ready: true,
      description: 'old',
    },
    incoming: {
      description_ready: false,
      description_pending: false,
    },
    expectedDescription: 'old',
    expectedReady: false,
    expectedPending: false,
  },
  {
    name: 'New ready text',
    existing: {
      description_ready: true,
      description: 'old',
    },
    incoming: {
      description_ready: true,
      description: 'new',
    },
    expectedDescription: 'new',
    expectedReady: true,
    expectedPending: false,
  },
];

let failed = 0;
for (const c of cases) {
  const merged = mergeCategoryCard(c.existing, c.incoming);
  const ok =
    merged.description === c.expectedDescription &&
    merged.description_ready === c.expectedReady &&
    merged.description_pending === c.expectedPending;
  if (!ok) {
    failed += 1;
    console.error(`FAIL: ${c.name}`, {
      expected: c,
      got: {
        description: merged.description,
        description_ready: merged.description_ready,
        description_pending: merged.description_pending,
      },
    });
  } else {
    console.log(`OK: ${c.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(`All ${cases.length} merge cases passed.`);
