import { describe, expect, it } from 'vitest';

import { resolveExpertNoteDisplayAuthor } from './expertNoteDisplayAuthor';

describe('resolveExpertNoteDisplayAuthor', () => {
  it('prefers coach_name when set', () => {
    expect(
      resolveExpertNoteDisplayAuthor({
        coach_name: 'Dr. Smith',
        name: 'Christell Skin Clinic',
      }),
    ).toBe('Dr. Smith');
  });

  it('falls back to clinic name when coach_name is empty', () => {
    expect(
      resolveExpertNoteDisplayAuthor({
        coach_name: '',
        name: 'Christell Skin Clinic',
      }),
    ).toBe('Christell Skin Clinic');
  });

  it('falls back to clinic name when coach_name is whitespace only', () => {
    expect(
      resolveExpertNoteDisplayAuthor({
        coach_name: '   ',
        name: 'New Clinic Name',
      }),
    ).toBe('New Clinic Name');
  });

  it('returns empty string when both are missing', () => {
    expect(resolveExpertNoteDisplayAuthor({})).toBe('');
  });
});
