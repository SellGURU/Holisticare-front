/**
 * Run: npx tsx scripts/run-category-ring-style-tests.ts
 */
import { resolveShowRingLoading } from '../src/utils/asyncProcessing';
import {
  buildCategoryStatusRingBackground,
  CATEGORY_STATUS_RING_PLACEHOLDER,
  resolveCategoryStatusRingBackground,
} from '../src/utils/categoryStatusRingStyle';

const VALID = [10, 20, 30, 25, 15] as const;

type Case = {
  name: string;
  run: () => boolean;
};

const cases: Case[] = [
  {
    name: 'null status returns undefined',
    run: () =>
      buildCategoryStatusRingBackground(null, 'summary6') === undefined,
  },
  {
    name: 'short array returns undefined',
    run: () =>
      buildCategoryStatusRingBackground([10, 20], 'summary6') === undefined,
  },
  {
    name: 'summary6 valid returns conic-gradient with #37B45E',
    run: () => {
      const bg = buildCategoryStatusRingBackground(VALID, 'summary6');
      return (
        typeof bg === 'string' &&
        bg.includes('conic-gradient') &&
        bg.includes('#37B45E')
      );
    },
  },
  {
    name: 'print4 valid returns conic-gradient',
    run: () => {
      const bg = buildCategoryStatusRingBackground(VALID, 'print4');
      return typeof bg === 'string' && bg.includes('conic-gradient');
    },
  },
  {
    name: 'printPurple valid returns #7F39FB',
    run: () => {
      const bg = buildCategoryStatusRingBackground(VALID, 'printPurple');
      return typeof bg === 'string' && bg.includes('#7F39FB');
    },
  },
  {
    name: 'palettes differ for same array',
    run: () => {
      const s6 = buildCategoryStatusRingBackground(VALID, 'summary6');
      const p4 = buildCategoryStatusRingBackground(VALID, 'print4');
      const pp = buildCategoryStatusRingBackground(VALID, 'printPurple');
      return s6 !== p4 && p4 !== pp && s6 !== pp;
    },
  },
  {
    name: 'resolveCategoryStatusRingBackground uses placeholder when invalid',
    run: () =>
      resolveCategoryStatusRingBackground(null, 'print4') ===
      CATEGORY_STATUS_RING_PLACEHOLDER,
  },
  {
    name: 'resolveShowRingLoading true when status null',
    run: () => resolveShowRingLoading({ status: null }, false, false) === true,
  },
  {
    name: 'resolveShowRingLoading false when status valid',
    run: () =>
      resolveShowRingLoading({ status: [...VALID] }, false, false) === false,
  },
];

let failed = 0;
for (const c of cases) {
  if (!c.run()) {
    failed += 1;
    console.error(`FAIL: ${c.name}`);
  } else {
    console.log(`OK: ${c.name}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
console.log(`All ${cases.length} category ring style cases passed.`);
