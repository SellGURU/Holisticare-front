/** Strip legacy coaching-programme disclaimer wording from stored HTML reports. */

const COACHING_PROGRAMME_CLAUSE =
  /\s+as part of The [^.]+?\s+coaching programme\.?\s*It is for wellbeing coaching and education/gi;

const WELLBEING_COACHING_ONLY = /It is for wellbeing coaching and education/gi;

const HERO_TITLE_SPAN =
  '<span class="clinic-hero-protocol text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-teal-200 to-white">';

const INNER_BRAND_SPAN =
  /<span\b[^>]*(?:clinic-hero-protocol|from-brand-teal)[^>]*>([\s\S]*?)<\/span>/gi;

export function sanitizeWellnessReportDisclaimer(html: string): string {
  if (!html) return html;
  return html
    .replace(COACHING_PROGRAMME_CLAUSE, '. It is for wellbeing and education')
    .replace(WELLBEING_COACHING_ONLY, 'It is for wellbeing and education');
}

/** Put "Health Optimization" in the same branded gradient as "Protocol". */
export function wrapHeroTitleWithBrand(html: string): string {
  if (!html || !html.includes('Health Optimization')) return html;
  const headerOpen = html.search(/<header\b/i);
  if (headerOpen < 0) return html;
  const headerEnd = html.toLowerCase().indexOf('</header>', headerOpen);
  if (headerEnd < 0) return html;

  const header = html.slice(headerOpen, headerEnd);
  const h1Match = header.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/i);
  if (!h1Match) return html;
  const h1 = h1Match[0];
  if (/clinic-hero-protocol[^>]*>[\s\S]*Health Optimization/i.test(h1)) {
    return html;
  }

  const parts = h1.match(/^(<h1\b[^>]*>)([\s\S]*)(<\/h1>)$/i);
  if (!parts) return html;
  const unwrapped = parts[2]
    .replace(INNER_BRAND_SPAN, '$1')
    .trim();
  if (!unwrapped) return html;

  let openTag = parts[1].replace(/\btext-white\b/g, 'text-transparent');
  if (!openTag.includes('clinic-hero-title')) {
    openTag = openTag.includes('class="')
      ? openTag.replace('class="', 'class="clinic-hero-title ')
      : openTag.replace('<h1', '<h1 class="clinic-hero-title"');
  }
  const nextH1 = `${openTag}${HERO_TITLE_SPAN}${unwrapped}</span>${parts[3]}`;
  return (
    html.slice(0, headerOpen) +
    header.replace(h1, nextH1) +
    html.slice(headerEnd)
  );
}
