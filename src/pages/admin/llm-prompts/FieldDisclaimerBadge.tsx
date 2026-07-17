import { AlertTriangle } from 'lucide-react';

export type FieldDisclaimerType =
  | 'fc_orphan'
  | 'dynamic_schema'
  | 'extra_orphan'
  | 'partial_template'
  | 'legacy_indexed';

export const FIELD_DISCLAIMER_MESSAGES: Record<FieldDisclaimerType, string> = {
  fc_orphan:
    'Source: inline Python (_build_tools) — this DB value is ignored by FC agents at runtime. Displayed for reference only.',
  dynamic_schema:
    'Dynamic schema — this is a static skeleton only; the real enum/values vary per request.',
  extra_orphan:
    'Not consumed by any agent at runtime — reserved for future use; no effect on LLM behavior.',
  partial_template:
    'Partial/template — runtime prompt includes dynamic content not shown here.',
  legacy_indexed:
    'Indexed (legacy) — extracted from legacy helper; may not match the live FC agent prompt.',
};

type FieldDisclaimerBadgeProps = {
  type: FieldDisclaimerType;
  message?: string;
};

export default function FieldDisclaimerBadge({
  type,
  message,
}: FieldDisclaimerBadgeProps) {
  const text = message ?? FIELD_DISCLAIMER_MESSAGES[type];
  const isWarning =
    type === 'fc_orphan' ||
    type === 'dynamic_schema' ||
    type === 'partial_template' ||
    type === 'legacy_indexed';

  return (
    <div
      className={`mb-2 flex items-start gap-2 rounded-[10px] border px-2.5 py-2 text-[11px] leading-snug ${
        isWarning
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-Gray-50 bg-Gray-50/40 text-Text-Secondary'
      }`}
      role="note"
      data-disclaimer-type={type}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
      ) : null}
      <span>{text}</span>
    </div>
  );
}

export function getFieldDisclaimerMessage(type: FieldDisclaimerType): string {
  return FIELD_DISCLAIMER_MESSAGES[type];
}
