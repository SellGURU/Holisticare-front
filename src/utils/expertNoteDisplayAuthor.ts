/** Brand fields used for Expert's Note author line (coach, then clinic name). */
export type ExpertNoteBrandElements = {
  coach_name?: unknown;
  name?: unknown;
};

/**
 * Label shown above each expert note: branding coach name, else current clinic name.
 */
export function resolveExpertNoteDisplayAuthor(
  brand: ExpertNoteBrandElements,
): string {
  const coach = String(brand.coach_name ?? '').trim();
  const clinic = String(brand.name ?? '').trim();
  return coach || clinic || '';
}
