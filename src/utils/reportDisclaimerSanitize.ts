/** Strip legacy coaching-programme disclaimer wording from stored HTML reports. */

const COACHING_PROGRAMME_CLAUSE =
  /\s+as part of The [^.]+?\s+coaching programme\.\s*It is for wellbeing coaching and education/gi;

const WELLBEING_COACHING_ONLY = /It is for wellbeing coaching and education/gi;

export function sanitizeWellnessReportDisclaimer(html: string): string {
  if (!html) return html;
  return html
    .replace(
      COACHING_PROGRAMME_CLAUSE,
      '. It is for wellbeing and education',
    )
    .replace(WELLBEING_COACHING_ONLY, 'It is for wellbeing and education');
}
