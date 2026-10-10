import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  CONTENT_LOCALE_TAGS,
  formatContentLocaleLabel,
} from './contentLocaleCatalog';

const here = dirname(fileURLToPath(import.meta.url));
const backendCatalogPath = join(
  here,
  '..',
  '..',
  '..',
  'Holisticare',
  'packages',
  'shared',
  'locale',
  'content_locale_catalog.py',
);

function parseBackendTags(source: string): string[] {
  const match = source.match(
    /CONTENT_LOCALE_TAGS[^=]*=\s*\(([\s\S]*?)\)\s*\n\nCONTENT_LOCALE_TAG_SET/,
  );
  if (!match) {
    throw new Error('CONTENT_LOCALE_TAGS block not found');
  }
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

describe('contentLocaleCatalog', () => {
  it('matches backend CONTENT_LOCALE_TAGS', () => {
    const py = readFileSync(backendCatalogPath, 'utf8');
    const backendTags = parseBackendTags(py);
    expect(CONTENT_LOCALE_TAGS).toEqual(backendTags);
  });

  it('formats en-GB with UK shorthand', () => {
    expect(formatContentLocaleLabel('en-GB', 'en')).toBe('English (UK)');
  });
});
