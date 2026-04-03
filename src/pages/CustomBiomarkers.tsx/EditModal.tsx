/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState, useCallback } from 'react';
import SpinnerLoader from '../../Components/SpinnerLoader';
import { ApiBiomarkerData } from '../../types/biormarker';
import BiomarkersApi from '../../api/Biomarkers';
import BenchmarkAreaSelect from '../../Components/BenchmarkAreaSelect';

const ALLOWED_STATUSES = [
  { value: 'OptimalRange', label: 'Optimal Range', color: '#22C55E' },
  { value: 'HealthyRange', label: 'Healthy Range', color: '#86EFAC' },
  { value: 'BorderlineRange', label: 'Borderline Range', color: '#FDE68A' },
  { value: 'DiseaseRange', label: 'Disease Range', color: '#F97316' },
  { value: 'CriticalRange', label: 'Critical Range', color: '#EF4444' },
];

interface EditModalProps {
  data: ApiBiomarkerData;
  onCancel: () => void;
  onSave: (values: ApiBiomarkerData) => void;
  loading: boolean;
  errorDetails: string;
  setErrorDetails: (errorDetails: string) => void;
}

const EditModal: FC<EditModalProps> = ({
  data,
  onCancel,
  onSave,
  loading,
  errorDetails,
  setErrorDetails,
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [draft, setDraft] = useState<any>({ ...data });
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [benchmarkAreaOptions, setBenchmarkAreaOptions] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    BiomarkersApi.getBiomarkersList()
      .then((res: any) => {
        if (!isMounted || !Array.isArray(res?.data)) return;
        const options = Array.from(
          new Set<string>(
            res.data
              .map((item: any) => String(item?.['Benchmark areas'] || '').trim())
              .filter((item: string) => Boolean(item)),
          ),
        ).sort((a: string, b: string) => a.localeCompare(b));
        setBenchmarkAreaOptions(options);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setDraft({ ...data });
    setJsonText(JSON.stringify(data, null, 2));
  }, [data]);

  const updateDraft = (field: string, value: any) => {
    const updated = { ...draft, [field]: value };
    setDraft(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    setJsonError('');
    try {
      const parsed = JSON.parse(text);
      setDraft(parsed);
    } catch {
      setJsonError('Invalid JSON');
    }
  };

  const updateThresholdRange = useCallback(
    (gender: 'male' | 'female', ageKey: string, rangeIdx: number, field: string, value: any) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const ranges = [...(genderData[ageKey] || [])];
      ranges[rangeIdx] = { ...ranges[rangeIdx], [field]: value };
      genderData[ageKey] = ranges;
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const updateThresholdStatus = useCallback(
    (gender: 'male' | 'female', ageKey: string, rangeIdx: number, status: string) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const ranges = [...(genderData[ageKey] || [])];
      const found = ALLOWED_STATUSES.find((item) => item.value === status);
      ranges[rangeIdx] = {
        ...ranges[rangeIdx],
        status,
        color: found?.color || ranges[rangeIdx]?.color || '#22C55E',
      };
      genderData[ageKey] = ranges;
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const addThresholdRange = useCallback(
    (gender: 'male' | 'female', ageKey: string) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const ranges = [...(genderData[ageKey] || [])];
      ranges.push({ label: '', status: 'OptimalRange', low: null, high: null, color: '#22C55E' });
      genderData[ageKey] = ranges;
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const removeThresholdRange = useCallback(
    (gender: 'male' | 'female', ageKey: string, rangeIdx: number) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const ranges = [...(genderData[ageKey] || [])];
      ranges.splice(rangeIdx, 1);
      genderData[ageKey] = ranges;
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const addAgeGroup = useCallback(
    (gender: 'male' | 'female') => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const existingKeys = Object.keys(genderData);
      const newKey = existingKeys.length === 0 ? '18-100' : '';
      genderData[newKey] = [
        { label: 'Critical Low', status: 'CriticalRange', low: null, high: null, color: '#EF4444' },
        { label: 'Optimal', status: 'OptimalRange', low: null, high: null, color: '#22C55E' },
        { label: 'Critical High', status: 'CriticalRange', low: null, high: null, color: '#EF4444' },
      ];
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const removeAgeGroup = useCallback(
    (gender: 'male' | 'female', ageKey: string) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      delete genderData[ageKey];
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const renameAgeGroup = useCallback(
    (gender: 'male' | 'female', oldKey: string, newKey: string) => {
      const thresholds = { ...(draft.thresholds || { male: {}, female: {} }) };
      const genderData = { ...(thresholds[gender] || {}) };
      const ranges = genderData[oldKey];
      delete genderData[oldKey];
      genderData[newKey] = ranges;
      thresholds[gender] = genderData;
      updateDraft('thresholds', thresholds);
    },
    [draft],
  );

  const handleSave = () => {
    setErrorDetails('');
    if (!draft.Biomarker?.trim()) {
      setErrorDetails('Biomarker name is required.');
      return;
    }
    if (!draft['Benchmark areas']?.trim()) {
      setErrorDetails('Benchmark area is required.');
      return;
    }
    if (viewMode === 'json' && jsonError) {
      setErrorDetails('Please fix the JSON errors before saving.');
      return;
    }
    onSave(draft);
  };

  const renderThresholdGender = (gender: 'male' | 'female') => {
    const genderData = draft.thresholds?.[gender] || {};
    const ageKeys = Object.keys(genderData);
    return (
      <div className="mb-3 border border-Gray-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-Text-Primary capitalize">
            {gender} Thresholds
          </span>
          <button
            type="button"
            className="text-[9px] text-Primary-DeepTeal hover:underline font-medium"
            onClick={() => addAgeGroup(gender)}
          >
            + Add {gender} Age Group
          </button>
        </div>
        {ageKeys.length === 0 && (
          <div className="text-[9px] text-Text-Secondary italic py-2 text-center">
            No age groups defined.
          </div>
        )}
        {ageKeys.map((ageKey) => {
          const ranges = genderData[ageKey];
          if (!Array.isArray(ranges)) return null;
          return (
            <div key={ageKey} className="mb-3 bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] text-Text-Secondary shrink-0">Age Range:</span>
                <input
                  type="text"
                  value={ageKey}
                  onChange={(e) => renameAgeGroup(gender, ageKey, e.target.value)}
                  placeholder="e.g. 18-100"
                  className="w-[80px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                />
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600 text-[9px] ml-auto shrink-0"
                  onClick={() => removeAgeGroup(gender, ageKey)}
                >
                  Remove Age Group
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[9px] text-Text-Secondary mb-0.5 px-0.5">
                  <span className="w-4" />
                  <span className="w-[80px]">Label</span>
                  <span className="w-[110px]">Status</span>
                  <span className="w-[55px] text-center">Low</span>
                  <span className="w-[55px] text-center">High</span>
                  <span className="w-4" />
                </div>
                {ranges.map((range: any, rIdx: number) => {
                  const statusInfo = ALLOWED_STATUSES.find((s) => s.value === range.status);
                  return (
                    <div key={rIdx} className="flex items-center gap-1.5 text-[10px]">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 border border-gray-200"
                        style={{ backgroundColor: statusInfo?.color || range.color || '#22C55E' }}
                      />
                      <input
                        type="text"
                        value={range.label || ''}
                        onChange={(e) => updateThresholdRange(gender, ageKey, rIdx, 'label', e.target.value)}
                        placeholder="e.g. Optimal"
                        className="w-[80px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                      />
                      <select
                        value={range.status || ''}
                        onChange={(e) =>
                          updateThresholdStatus(
                            gender,
                            ageKey,
                            rIdx,
                            e.target.value,
                          )
                        }
                        className="w-[110px] border border-Gray-50 rounded-lg px-1 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                      >
                        <option value="">— select —</option>
                        {ALLOWED_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="any"
                        value={range.low ?? ''}
                        onChange={(e) => updateThresholdRange(gender, ageKey, rIdx, 'low', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="null"
                        className="w-[55px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                      />
                      <input
                        type="number"
                        step="any"
                        value={range.high ?? ''}
                        onChange={(e) => updateThresholdRange(gender, ageKey, rIdx, 'high', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="null"
                        className="w-[55px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                      />
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 text-[12px] leading-none ml-0.5"
                        onClick={() => removeThresholdRange(gender, ageKey, rIdx)}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="text-[9px] text-Primary-DeepTeal hover:underline mt-0.5 ml-5"
                  onClick={() => addThresholdRange(gender, ageKey)}
                >
                  + Add range
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-[90vw] md:w-[620px] max-w-[620px] max-h-[85vh] relative bg-white rounded-[16px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-Gray-50">
        <div>
          <div className="TextStyle-Headline-5 text-Text-Primary">Edit Biomarker</div>
          <div className="text-[10px] text-Text-Secondary mt-0.5">
            {draft.Biomarker} · {draft.unit || 'No unit'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
              viewMode === 'form'
                ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                : 'bg-white text-Text-Secondary border-Gray-50 hover:border-Primary-DeepTeal'
            }`}
            onClick={() => setViewMode('form')}
          >
            Form
          </button>
          <button
            type="button"
            className={`text-[11px] px-3 py-1 rounded-full border transition-colors ${
              viewMode === 'json'
                ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                : 'bg-white text-Text-Secondary border-Gray-50 hover:border-Primary-DeepTeal'
            }`}
            onClick={() => {
              setJsonText(JSON.stringify(draft, null, 2));
              setViewMode('json');
            }}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorDetails && (
        <div className="mx-6 mt-3 bg-[#F9DEDC] rounded-xl px-4 py-2 text-[10px] text-Text-Primary flex items-start gap-2">
          <img src="/icons/info-circle-orange.svg" alt="" className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{errorDetails}</span>
          <img src="/icons/close-black.svg" alt="" className="cursor-pointer w-4 h-4" onClick={() => setErrorDetails('')} />
        </div>
      )}

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
        {viewMode === 'form' ? (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Benchmark Area <span className="text-red-500">*</span></label>
              <BenchmarkAreaSelect
                value={draft['Benchmark areas'] || ''}
                options={benchmarkAreaOptions}
                onChange={(value) => updateDraft('Benchmark areas', value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Biomarker Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={draft.Biomarker || ''}
                onChange={(e) => updateDraft('Biomarker', e.target.value)}
                disabled
                className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none bg-gray-50 text-Text-Secondary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={draft.unit || ''}
                onChange={(e) => updateDraft('unit', e.target.value)}
                placeholder="e.g. mmol/L"
                className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Definition</label>
              <textarea
                value={draft.Definition || ''}
                onChange={(e) => updateDraft('Definition', e.target.value)}
                placeholder="Clinical description"
                rows={3}
                className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none resize-none focus:border-Primary-DeepTeal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Thresholds (Reference Ranges)</label>
              {renderThresholdGender('male')}
              {renderThresholdGender('female')}
            </div>
          </>
        ) : (
          <>
            <div className="text-[10px] text-Text-Secondary mb-1">
              Edit the full JSON definition directly.
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={18}
              spellCheck={false}
              className={`w-full font-mono text-[11px] border rounded-xl px-3 py-2 outline-none resize-none ${
                jsonError ? 'border-red-400 bg-red-50' : 'border-Gray-50 focus:border-Primary-DeepTeal'
              }`}
            />
            {jsonError && <div className="text-[10px] text-red-500">{jsonError}</div>}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-Gray-50 flex items-center justify-end gap-4">
        <div onClick={onCancel} className="TextStyle-Headline-5 cursor-pointer text-Disable">Cancel</div>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="TextStyle-Headline-5 cursor-pointer text-Primary-DeepTeal disabled:opacity-50"
        >
          {loading ? <SpinnerLoader color="#005F73" /> : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default EditModal;
