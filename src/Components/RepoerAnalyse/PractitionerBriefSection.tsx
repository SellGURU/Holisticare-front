import { useEffect, useMemo, useState } from 'react';
import Application from '../../api/app';
import MarkdownText from '../markdownText';
import resolveAnalyseIcon from './resolveAnalyseIcon';
import type { PractitionerBriefResponse } from './practitionerBrief';

type Biomarker = {
  name?: string;
  Result?: string | number;
  Units?: string;
};

type ConcerningGroup = {
  subcategory?: string;
  biomarkers?: Biomarker[];
};

type CategoryReason = {
  subcategory?: string;
  description?: string;
  reasoning?: string;
  risk_flags?: string[];
};

type ClientProfile = {
  medication?: string;
  conditions?: string;
  allergy?: string;
};

type PractitionerBriefSectionProps = {
  memberId: number | string | null;
  enabled?: boolean;
  summary?: string;
  groups?: ConcerningGroup[];
  categories?: CategoryReason[];
  profile?: ClientProfile | null;
};

type NarrativeBlock = {
  label: string;
  icon: string;
  tint: string;
  text: string;
};

const severityClass: Record<string, string> = {
  informational: 'bg-slate-100 text-slate-700',
  monitor: 'bg-sky-100 text-sky-800',
  review: 'bg-amber-100 text-amber-800',
  urgent_review: 'bg-orange-100 text-orange-800',
};

const proseClass =
  'text-sm leading-6 text-Text-Secondary [&_p]:m-0 [&_strong]:rounded [&_strong]:bg-[#E7F6F2] [&_strong]:px-1 [&_strong]:font-semibold [&_strong]:text-[#005F73]';

function narrativeBlock(sentence: string): Omit<NarrativeBlock, 'text'> {
  const text = sentence.toLowerCase();
  if (/next step|confirm|align a plan|follow-up|review/.test(text)) {
    return {
      label: 'Practitioner review',
      icon: '/icons/task-square-green.svg',
      tint: 'bg-emerald-50',
    };
  }
  if (/sleep|stress|shift|exercise|hydration|lifestyle|diet/.test(text)) {
    return {
      label: 'Lifestyle',
      icon: '/icons/activity-green.svg',
      tint: 'bg-sky-50',
    };
  }
  if (/medication|treated|asthma|copd|supplement|dose/.test(text)) {
    return {
      label: 'Medications',
      icon: '/icons/biomarkers/pil.svg',
      tint: 'bg-violet-50',
    };
  }
  if (/goal|hormone|menopause|energy|female|male|age/.test(text)) {
    return {
      label: 'Client context',
      icon: '/icons/health.svg',
      tint: 'bg-teal-50',
    };
  }
  return {
    label: 'Key findings',
    icon: '/icons/chart.svg',
    tint: 'bg-amber-50',
  };
}

function narrativeBlocks(summary: string): NarrativeBlock[] {
  const sentences = summary
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  return sentences.reduce<NarrativeBlock[]>((blocks, sentence) => {
    const section = narrativeBlock(sentence);
    const previous = blocks[blocks.length - 1];
    if (previous?.label === section.label) {
      previous.text = `${previous.text} ${sentence}`;
      return blocks;
    }
    blocks.push({ ...section, text: sentence });
    return blocks;
  }, []);
}

function shorten(text: string, max = 360): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const stop = cut.lastIndexOf('. ');
  return `${(stop > 80 ? cut.slice(0, stop + 1) : cut).trim()}…`;
}

function reasonForGroup(
  group: ConcerningGroup,
  categories: CategoryReason[],
  summary: string,
): string {
  const name = (group.subcategory || '').trim().toLowerCase();
  const category = categories.find(
    (item) => (item.subcategory || '').trim().toLowerCase() === name,
  );
  const direct = category?.reasoning || category?.description || '';
  if (direct.trim()) return shorten(direct);

  const markers = (group.biomarkers ?? [])
    .map((item) => (item.name || '').toLowerCase())
    .filter(Boolean);
  const related = summary
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => {
      const text = sentence.toLowerCase();
      return (
        text.includes(name) ||
        markers.some((marker) => marker && text.includes(marker))
      );
    });
  if (related.length > 0) return shorten(related.join(' '));

  const listed = (group.biomarkers ?? [])
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
  return listed
    ? `${listed} ${listed.includes(',') ? 'are' : 'is'} outside the usual reference or optimal range, so this area is included for practitioner review.`
    : 'This area is included because one or more results need practitioner review.';
}

const CLINICAL_ROWS = [
  { key: 'medication', label: 'Medication', icon: '/icons/pill.svg' },
  {
    key: 'conditions',
    label: 'Medical Condition',
    icon: '/icons/healtcare.svg',
  },
  { key: 'allergy', label: 'Allergy', icon: '/icons/allergy.svg' },
] as const;

function profileChips(value: unknown): string[] {
  if (value == null) return [];
  return String(value)
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter((part) => {
      const token = part.toLowerCase();
      return (
        part !== '' && token !== '-' && token !== 'null' && token !== 'none'
      );
    });
}

function SectionIcon({ src, tint }: { src: string; tint: string }) {
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
    >
      <img src={src} alt="" className="h-5 w-5 object-contain" />
    </span>
  );
}

export default function PractitionerBriefSection({
  memberId,
  enabled = true,
  summary = '',
  groups = [],
  categories = [],
  profile = null,
}: PractitionerBriefSectionProps) {
  const [brief, setBrief] = useState<PractitionerBriefResponse | null>(null);

  useEffect(() => {
    if (!enabled || memberId == null) return;
    let cancelled = false;
    Application.getPractitionerBrief({ member_id: memberId })
      .then((response) => {
        if (!cancelled && response?.data?.brief) setBrief(response.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, memberId]);

  const visibleSummary = brief?.brief?.executive_summary || summary || '';
  const blocks = useMemo(
    () => narrativeBlocks(visibleSummary),
    [visibleSummary],
  );
  const signals = brief?.brief?.priority_signals ?? [];
  const profileRows = CLINICAL_ROWS.map((row) => ({
    ...row,
    chips: profileChips(profile?.[row.key]),
  })).filter((row) => row.chips.length > 0);

  if (!enabled) return null;

  return (
    <section
      id="AI Clinical Brief"
      className="sectionScrollEl my-10"
      aria-label="AI Clinical Brief"
    >
      <div className="mb-4 flex items-start gap-3">
        <SectionIcon src="/icons/ai-icon.svg" tint="bg-[#E7F6F2]" />
        <div>
          <h2 className="TextStyle-Headline-4 text-Text-Primary">
            AI Clinical Brief
          </h2>
          <p className="mt-1 text-sm text-Text-Secondary">
            Practitioner review summary. Not a diagnosis or treatment
            instruction.
          </p>
        </div>
      </div>

      {profileRows.length > 0 && (
        <div className="mb-4 grid gap-3">
          {profileRows.map((row) => (
            <article
              key={row.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <SectionIcon src={row.icon} tint="bg-[#E7F6F2]" />
                  <h3 className="text-sm font-semibold text-Text-Primary">
                    {row.label}
                  </h3>
                </div>
                <div className="flex min-w-0 flex-wrap gap-1.5 sm:justify-end">
                  {row.chips.map((chip, index) => (
                    <span
                      key={`${row.key}-${index}`}
                      className="max-w-full break-words rounded-full bg-[#F4F7F8] px-3 py-1 text-xs leading-4 text-Text-Primary"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="grid gap-3">
        {blocks.map((block) => (
          <article
            key={`${block.label}-${block.text.slice(0, 24)}`}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <SectionIcon src={block.icon} tint={block.tint} />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-Text-Primary">
                {block.label}
              </h3>
              <MarkdownText
                className={`mt-1 ${proseClass}`}
                text={block.text}
              />
            </div>
          </article>
        ))}
        {blocks.length === 0 && (
          <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-Text-Secondary">
            The narrative summary is not ready yet. Detailed biomarker values
            remain available in Need Focus and Detailed Analysis.
          </article>
        )}
      </div>

      {(signals.length > 0 || groups.length > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {signals.map((signal) => (
            <article
              key={signal.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <SectionIcon
                  src="/icons/info-circle-blue.svg"
                  tint="bg-sky-50"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-Text-Primary">
                      {signal.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${severityClass[signal.severity] || severityClass.review}`}
                    >
                      {signal.severity.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <MarkdownText
                    className={`mt-1 ${proseClass}`}
                    text={signal.why_review}
                  />
                </div>
              </div>
            </article>
          ))}
          {signals.length === 0 &&
            groups.map((group) => (
              <article
                key={group.subcategory}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <SectionIcon
                    src={resolveAnalyseIcon(group.subcategory || '')}
                    tint="bg-[#F3F7F8]"
                  />
                  <h3 className="font-semibold text-Text-Primary">
                    {group.subcategory}
                  </h3>
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#005F73]">
                  Why it is flagged
                </p>
                <MarkdownText
                  className={`mt-1 ${proseClass}`}
                  text={reasonForGroup(group, categories, visibleSummary)}
                />
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(group.biomarkers ?? []).map((item) => (
                    <li
                      key={`${group.subcategory}-${item.name}`}
                      className="rounded-full bg-[#F4F7F8] px-3 py-1 text-xs text-Text-Primary"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="ml-1 text-Text-Secondary">
                        {item.Result ?? '-'} {item.Units ?? ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
