import { useEffect, useMemo, useState } from 'react';
import { MapNumberEditor } from './mapNumberEditor';
import { StringListEditor } from './StringListEditor';
import { MapStringArrayEditor } from './MapStringArrayEditor';
import  ArrayOfObjectsTableEditor  from './table';

type UnitMapping = {
  unit_conversions: Record<string, number>;
  common_prefixes: Record<string, number>;
  case_sensitive_units: string[];
  common_unit_aliases: Record<string, string[]>;
  biomarker_specific: Array<{
    biomarker: string;
    to_unit: string;
    unit: string;
    conversion_factor: number;
  }>;
};
const ALL_SECTIONS: SectionKey[] = [
  'unit_conversions',
  'common_prefixes',
  'case_sensitive_units',
  'common_unit_aliases',
  'biomarker_specific',
];
type SectionKey = keyof UnitMapping;

const SECTION_LABELS: Record<SectionKey, string> = {
  unit_conversions: 'unit_conversions (key → number)',
  common_prefixes: 'common_prefixes (prefix → number)',
  case_sensitive_units: 'case_sensitive_units (string list)',
  common_unit_aliases: 'common_unit_aliases (unit → aliases[])',
  biomarker_specific: 'biomarker_specific (table)',
};

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}
function hasAnyRecordEntries(obj?: Record<string, any>) {
  return !!obj && Object.keys(obj).length > 0;
}

function hasAnyStringArray(arr?: string[]) {
  return Array.isArray(arr) && arr.some((s) => String(s ?? '').trim() !== '');
}

function hasAnyAliasMap(map?: Record<string, string[]>) {
  if (!map) return false;
  return Object.entries(map).some(([k, v]) => {
    if (!k.trim()) return false;
    return Array.isArray(v) && v.some((s) => String(s ?? '').trim() !== '');
  });
}

function hasAnyBiomarkerRows(
  rows?: Array<{ biomarker?: string; unit?: string; to_unit?: string }>,
) {
  return Array.isArray(rows) && rows.some((r) => {
    return (
      String(r?.biomarker ?? '').trim() ||
      String(r?.unit ?? '').trim() ||
      String(r?.to_unit ?? '').trim()
    );
  });
}

function sectionsWithContent(value: UnitMapping): SectionKey[] {
  const result: SectionKey[] = [];

  if (hasAnyRecordEntries(value.unit_conversions)) result.push('unit_conversions');
  if (hasAnyRecordEntries(value.common_prefixes)) result.push('common_prefixes');
  if (hasAnyStringArray(value.case_sensitive_units)) result.push('case_sensitive_units');
  if (hasAnyAliasMap(value.common_unit_aliases)) result.push('common_unit_aliases');
  if (hasAnyBiomarkerRows(value.biomarker_specific)) result.push('biomarker_specific');

  // if file is valid but empty, show all (or at least one)
  return result.length ? result : [...ALL_SECTIONS];
}
export function UnitMappingEditor({
  value,
  onChange,
}: {
  value: UnitMapping;
  onChange: (next: UnitMapping) => void;
}) {
  const allSections = useMemo(
    () => Object.keys(SECTION_LABELS) as SectionKey[],
    [],
  );

  // user decides what to show
  const [visible, setVisible] = useState<SectionKey[]>(() => sectionsWithContent(value));
  const [active, setActive] = useState<SectionKey>(() => sectionsWithContent(value)[0]);

  useEffect(() => {
    const nextVisible = sectionsWithContent(value);
    setVisible(nextVisible);

    // keep current active if still visible, else switch to first visible
    setActive((prev) => (nextVisible.includes(prev) ? prev : nextVisible[0]));
  }, [value]);
  function toggleVisible(k: SectionKey) {
    setVisible((prev) => {
      const next = prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k];
      // keep at least one
      if (!next.length) return prev;
      // if you hide active, switch to first visible
      if (!next.includes(active)) setActive(next[0]);
      return next;
    });
  }

  const shown = allSections.filter((k) => visible.includes(k));

  return (
    <div className="space-y-4">
      {/* Section picker */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">
          Unit Mapping sections
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Choose what sections are visible. (Keeps the page clean.)
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {allSections.map((k) => {
            const checked = visible.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleVisible(k)}
                className={classNames(
                  'rounded-full border px-3 py-1.5 text-xs transition',
                  checked
                    ? 'bg-Primary-DeepTeal border border-Gray-50 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                )}
              >
                {SECTION_LABELS[k]}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shown.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActive(k)}
              className={classNames(
                'rounded-lg px-3 py-2 text-xs font-medium transition',
                active === k
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Active editor */}
      {active === 'unit_conversions' && (
        <MapNumberEditor
          title="unit_conversions"
          value={value.unit_conversions}
          onChange={(nextMap) => onChange({ ...value, unit_conversions: nextMap })}
          numberStep="any"
        />
      )}

      {active === 'common_prefixes' && (
        <MapNumberEditor
          title="common_prefixes"
          value={value.common_prefixes}
          onChange={(nextMap) => onChange({ ...value, common_prefixes: nextMap })}
          numberStep="any"
        />
      )}

      {active === 'case_sensitive_units' && (
        <StringListEditor
          title="case_sensitive_units"
          value={value.case_sensitive_units}
          onChange={(next) => onChange({ ...value, case_sensitive_units: next })}
          placeholder="e.g. mg/dL"
        />
      )}

      {active === 'common_unit_aliases' && (
        <MapStringArrayEditor
          title="common_unit_aliases"
          value={value.common_unit_aliases}
          onChange={(next) => onChange({ ...value, common_unit_aliases: next })}
        />
      )}

      {active === 'biomarker_specific' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                biomarker_specific
              </div>
              <div className="text-xs text-slate-500">
                Add/Edit rows from the table modal.
              </div>
            </div>
          </div>

          <ArrayOfObjectsTableEditor
            value={value.biomarker_specific}
            columns={['biomarker', 'to_unit', 'unit', 'conversion_factor']}
            onChange={(next) => onChange({ ...value, biomarker_specific: next })}
            // optional: make "Add row" open modal first (see note below)
            // addOpensModal
          />
        </div>
      )}
    </div>
  );
}
