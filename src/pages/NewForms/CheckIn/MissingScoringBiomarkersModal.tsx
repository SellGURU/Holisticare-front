import { FC, useEffect, useMemo, useState } from 'react';
import BiomarkersApi from '../../../api/Biomarkers';
import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
import BenchmarkAreaSelect from '../../../Components/BenchmarkAreaSelect';
import { prepareBiomarkerForApi } from '../../CustomBiomarkers.tsx/biomarkerFormUtils';
import {
  invalidateLabEntryBiomarkerUnitsCache,
  LAB_ENTRY_BIOMARKER_NAMES_INVALIDATED,
  PORTAL_CACHE_KEYS,
} from '../../../utils/cacheKeys';
import { publish } from '../../../utils/event';
import { formatApiErrorMessage } from '../../../utils/jsonErrorDetails';
import { removeCachedKey } from '../../../utils/pageCache';
import type { MissingScoringCatalogBiomarker } from './questionFormula';

interface MissingScoringBiomarkersModalProps {
  missing: Array<MissingScoringCatalogBiomarker>;
  onClose: () => void;
  onAdded?: (name: string) => void;
}

const itemKey = (item: MissingScoringCatalogBiomarker) =>
  `${item.ruleIndex}-${item.mapTo}`;

const catalogRows = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const record = raw as { chart_bounds?: unknown; configs?: { more_info?: unknown } };
    if (Array.isArray(record.chart_bounds)) return record.chart_bounds;
    if (Array.isArray(record.configs?.more_info)) return record.configs.more_info;
  }
  return [];
};

const benchmarkAreasFromCatalog = (rows: any[]): string[] => {
  const areas: string[] = [];
  const seen = new Set<string>();
  rows.forEach((item) => {
    const area = String(item?.['Benchmark areas'] || '').trim();
    if (!area) return;
    const key = area.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    areas.push(area);
  });
  return areas.sort((a, b) => a.localeCompare(b));
};

const suggestedBenchmarkArea = (options: string[]) => {
  const sexual = options.find((area) => /sexual/i.test(area));
  if (sexual) return sexual;
  const other = options.find((area) => /other|unclass/i.test(area));
  return other || options[0] || 'Sexual Health';
};

const invalidateBiomarkerCaches = () => {
  removeCachedKey('portal:biomarkers:list');
  removeCachedKey(PORTAL_CACHE_KEYS.labEntryBiomarkerNames);
  invalidateLabEntryBiomarkerUnitsCache();
  publish(LAB_ENTRY_BIOMARKER_NAMES_INVALIDATED, null);
};

const MissingScoringBiomarkersModal: FC<MissingScoringBiomarkersModalProps> = ({
  missing,
  onClose,
  onAdded,
}) => {
  const [items] = useState(missing);
  const [area, setArea] = useState('');
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        const options = benchmarkAreasFromCatalog(catalogRows(res.data));
        setAreaOptions(options);
        setArea((current) => current || suggestedBenchmarkArea(options));
      })
      .catch(() => {
        setArea((current) => current || 'Sexual Health');
      });
  }, []);

  const remaining = useMemo(
    () => items.filter((item) => !addedKeys.has(itemKey(item))),
    [items, addedKeys],
  );
  const allAdded = remaining.length === 0 && items.length > 0;

  const addOne = async (item: MissingScoringCatalogBiomarker) => {
    const key = itemKey(item);
    const benchmark = area.trim();
    if (!benchmark) {
      setRowErrors((current) => ({
        ...current,
        [key]: 'Choose a benchmark area first.',
      }));
      return false;
    }
    setSavingKey(key);
    setRowErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    try {
      const new_biomarker = prepareBiomarkerForApi(
        {
          Biomarker: item.mapTo,
          unit: item.unit || 'points',
          biomarker_type: 'other',
          'Benchmark areas': benchmark,
          Definition: item.ruleName || item.mapTo,
        },
        'add',
      );
      await BiomarkersApi.addBiomarkersList({ new_biomarker });
      invalidateBiomarkerCaches();
      setAddedKeys((current) => new Set(current).add(key));
      onAdded?.(item.mapTo);
      return true;
    } catch (error) {
      setRowErrors((current) => ({
        ...current,
        [key]: formatApiErrorMessage(error, 'Could not add this biomarker.'),
      }));
      return false;
    } finally {
      setSavingKey(null);
    }
  };

  const addRemaining = async () => {
    if (!area.trim() || remaining.length === 0) return;
    setSavingAll(true);
    for (const item of remaining) {
      const ok = await addOne(item);
      if (!ok) break;
    }
    setSavingAll(false);
  };

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-[#0000004D]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-[90vw] max-w-[560px] rounded-2xl bg-white p-5 shadow-800"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="text-[15px] font-semibold text-Text-Primary">
          These scores are not in your biomarker list
        </div>
        <p className="mt-2 text-xs text-Text-Secondary">
          Add them here. Each saved score gets a check, then you can save the
          questionnaire.
        </p>
        <div className="mt-3">
          <label className="mb-1 block text-[11px] font-medium text-gray-700">
            Benchmark area <span className="text-red-500">*</span>
          </label>
          <BenchmarkAreaSelect
            value={area}
            options={areaOptions}
            suggestedValue={suggestedBenchmarkArea(areaOptions)}
            placeholder="Select or create a benchmark area"
            createContextLabel="Other"
            onChange={setArea}
          />
        </div>
        <ul className="mt-3 max-h-[280px] space-y-2 overflow-y-auto">
          {items.map((item) => {
            const key = itemKey(item);
            const added = addedKeys.has(key);
            const saving = savingKey === key;
            return (
              <li
                key={key}
                className={`rounded-xl border px-3 py-2 ${
                  added ? 'border-[#10B981]/40 bg-[#F0FDF4]' : 'border-Gray-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-gray-800">
                      {item.ruleName}
                    </div>
                    <div className="mt-0.5 break-all text-[11px] text-gray-500">
                      {item.mapTo}
                      {item.unit ? ` · ${item.unit}` : ''}
                    </div>
                  </div>
                  {added ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-[#059669]">
                      <img
                        src="/icons/check-circle.svg"
                        alt=""
                        className="h-4 w-4"
                      />
                      Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="shrink-0 text-[11px] font-medium text-Primary-DeepTeal disabled:text-gray-400"
                      disabled={saving || savingAll || !area.trim()}
                      onClick={() => {
                        void addOne(item);
                      }}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  )}
                </div>
                {rowErrors[key] ? (
                  <div className="mt-1 text-[10px] text-Red">{rowErrors[key]}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-sm font-medium text-[#909090]"
            onClick={onClose}
          >
            {allAdded ? 'Close' : 'Cancel'}
          </button>
          {allAdded ? (
            <ButtonSecondary size="small" onClick={onClose} ClassName="h-9">
              Done
            </ButtonSecondary>
          ) : (
            <ButtonSecondary
              size="small"
              onClick={() => {
                void addRemaining();
              }}
              disabled={savingAll || Boolean(savingKey) || !area.trim()}
              ClassName="h-9"
            >
              {savingAll ? 'Saving…' : 'Save remaining'}
            </ButtonSecondary>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissingScoringBiomarkersModal;
