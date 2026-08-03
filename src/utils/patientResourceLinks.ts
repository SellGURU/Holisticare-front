import { resolveBaseUrl } from '../api/base';

/** Wrap holisticare.io educational links for the patient-safe viewer (no demo CTAs). */
export function toPatientResourceViewerUrl(
  externalUrl: string,
  portalBase = resolveBaseUrl(),
): string {
  const cleaned = String(externalUrl || '').trim();
  if (!cleaned) return cleaned;
  try {
    const parsed = new URL(cleaned);
    const host = parsed.hostname.toLowerCase();
    if (host !== 'holisticare.io' && host !== 'www.holisticare.io') {
      return cleaned;
    }
    const origin = portalBase.replace(/\/$/, '');
    return `${origin}/patient-resource?url=${encodeURIComponent(cleaned)}`;
  } catch {
    return cleaned;
  }
}

export function rewriteHolisticPlanResourceLinks(
  html: string,
  portalBase = resolveBaseUrl(),
): string {
  if (!html) return html;
  let out = html.replace(
    /href="(https:\/\/(?:www\.)?holisticare\.io[^"]*)"/gi,
    (_match, url: string) =>
      `href="${toPatientResourceViewerUrl(url, portalBase)}"`,
  );
  out = out.replace(
    /(data=)(https%3A%2F%2F(?:www\.)?holisticare\.io[^"&]*)/gi,
    (_match, prefix: string, encoded: string) => {
      try {
        const decoded = decodeURIComponent(encoded);
        return (
          prefix +
          encodeURIComponent(toPatientResourceViewerUrl(decoded, portalBase))
        );
      } catch {
        return _match;
      }
    },
  );
  return out;
}
