/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import SpinnerLoader from '../../SpinnerLoader';
import Application from '../../../api/app';
import BiomarkersApi from '../../../api/Biomarkers';

interface Props {
  extractedName: string;
  extractedValue?: string;
  extractedUnit?: string;
  suggestions?: Array<{ system_biomarker: string; confidence: number; reason: string }>;
  onClose: () => void;
  onCreated: (newBiomarkerName: string) => void;
}

const ALLOWED_STATUSES = [
  { value: 'OptimalRange', label: 'Optimal Range', color: '#22C55E' },
  { value: 'HealthyRange', label: 'Healthy Range', color: '#86EFAC' },
  { value: 'BorderlineRange', label: 'Borderline Range', color: '#FDE68A' },
  { value: 'DiseaseRange', label: 'Disease Range', color: '#F97316' },
  { value: 'CriticalRange', label: 'Critical Range', color: '#EF4444' },
];

const EMPTY_DRAFT = {
  'Benchmark areas': '',
  Biomarker: '',
  Definition: '',
  unit: '',
  source: 'Custom',
  'show_in_maual_entry': true,
  thresholds: { male: {}, female: {} },
};

const CreateBiomarkerModal: React.FC<Props> = ({
  extractedName,
  extractedValue = '',
  extractedUnit = '',
  suggestions = [],
  onClose,
  onCreated,
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'json'>('form');
  const [draft, setDraft] = useState<any>(EMPTY_DRAFT);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [prefilling, setPrefilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill via LLM on mount
  useEffect(() => {
    const prefill = async () => {
      setPrefilling(true);
      try {
        const res = await Application.prefillBiomarkerDraft({
          extracted_name: extractedName,
          extracted_value: extractedValue,
          extracted_unit: extractedUnit,
          mode: 'biomarker',
          suggestions: suggestions.slice(0, 3),
        });
        if (res?.data?.draft) {
          const d = {
            ...EMPTY_DRAFT,
            ...res.data.draft,
            thresholds: res.data.draft.thresholds || { male: {}, female: {} },
            'show_in_maual_entry': true,
            source: res.data.draft.source || 'Custom',
          };
          setDraft(d);
          setJsonText(JSON.stringify(d, null, 2));
        }
      } catch {
        // If prefill fails, just use the empty draft with extracted name
        const d = { ...EMPTY_DRAFT, Biomarker: extractedName, unit: extractedUnit };
        setDraft(d);
        setJsonText(JSON.stringify(d, null, 2));
      } finally {
        setPrefilling(false);
      }
    };
    prefill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep JSON text in sync with form fields
  const updateDraft = (field: string, value: any) => {
    const updated = { ...draft, [field]: value };
    setDraft(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  // When user edits raw JSON
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

  // Switch from JSON view back to form — apply JSON edits first
  const handleSwitchToForm = () => {
    if (jsonError) {
      setErrorMsg('Please fix the JSON errors before switching views.');
      return;
    }
    setViewMode('form');
    setErrorMsg('');
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

  const handleSave = async () => {
    setErrorMsg('');
    if (!draft.Biomarker?.trim()) {
      setErrorMsg('Biomarker name is required.');
      return;
    }
    if (!draft['Benchmark areas']?.trim()) {
      setErrorMsg('Benchmark area is required.');
      return;
    }

    // If in JSON mode, validate once more
    if (viewMode === 'json') {
      if (jsonError) {
        setErrorMsg('Please fix the JSON errors before saving.');
        return;
      }
    }

    setSaving(true);
    try {
      await BiomarkersApi.addBiomarkersList({ new_biomarker: draft });
      onCreated(draft.Biomarker);
      onClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.detail ||
        err?.message ||
        'Failed to save biomarker.';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-[620px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-Gray-50">
          <div>
            <div className="TextStyle-Headline-5 text-Text-Primary">
              Create New Biomarker
            </div>
            <div className="text-[10px] text-Text-Secondary mt-0.5">
              Extracted: <span className="font-medium text-Text-Primary">{extractedName}</span>
              {extractedUnit && (
                <span> &nbsp;·&nbsp; Unit: <span className="font-medium">{extractedUnit}</span></span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Loading overlay */}
        {prefilling && (
          <div className="flex items-center justify-center py-8 gap-2 text-[12px] text-Text-Secondary">
            <SpinnerLoader color="#005F73" />
            <span>Generating draft with AI…</span>
          </div>
        )}

        {!prefilling && (
          <>
            {/* View toggle */}
            <div className="flex items-center gap-3 px-6 pt-4">
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

            {/* Error banner */}
            {errorMsg && (
              <div className="mx-6 mt-3 bg-[#F9DEDC] rounded-xl px-4 py-2 text-[10px] text-Text-Primary flex items-start gap-2">
                <img src="/icons/info-circle-orange.svg" alt="" className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {viewMode === 'form' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Benchmark Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft['Benchmark areas'] || ''}
                      onChange={(e) => updateDraft('Benchmark areas', e.target.value)}
                      placeholder="e.g. Vitamins, Cardiovascular Risk"
                      className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Biomarker Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.Biomarker || ''}
                      onChange={(e) => updateDraft('Biomarker', e.target.value)}
                      placeholder="Canonical system name"
                      className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={draft.unit || ''}
                      onChange={(e) => updateDraft('unit', e.target.value)}
                      placeholder="e.g. mmol/L, µg/dL"
                      className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Definition
                    </label>
                    <textarea
                      value={draft.Definition || ''}
                      onChange={(e) => updateDraft('Definition', e.target.value)}
                      placeholder="Clinical description of this biomarker"
                      rows={3}
                      className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none resize-none focus:border-Primary-DeepTeal"
                    />
                  </div>

                  {/* Thresholds section */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Thresholds (Reference Ranges)
                    </label>
                    <div className="text-[9px] text-Text-Secondary mb-2">
                      AI-suggested clinical ranges based on international standards. Review and adjust as needed.
                    </div>
                    {(['male', 'female'] as const).map((gender) => {
                      const genderData = draft.thresholds?.[gender] || {};
                      const ageKeys = Object.keys(genderData);
                      return (
                        <div key={gender} className="mb-3 border border-Gray-50 rounded-xl p-3">
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
                              No age groups defined. Click "Add {gender} Age Group" to start.
                            </div>
                          )}
                          {ageKeys.map((ageKey) => {
                            const ranges = genderData[ageKey];
                            if (!Array.isArray(ranges)) return null;
                            return (
                              <div key={ageKey} className="mb-3 bg-gray-50 rounded-lg p-2 relative">
                                {/* Age group header with editable age range */}
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
                                  {/* Header row */}
                                  <div className="flex items-center gap-1.5 text-[9px] text-Text-Secondary mb-0.5 px-0.5">
                                    <span className="w-4" />
                                    <span className="w-[80px]">Label</span>
                                    <span className="w-[110px]">Status</span>
                                    <span className="w-[55px] text-center">Low</span>
                                    <span className="w-[55px] text-center">High</span>
                                    <span className="w-4" />
                                  </div>
                                  {ranges.map((range: any, rIdx: number) => {
                                    const statusInfo = ALLOWED_STATUSES.find(
                                      (s) => s.value === range.status,
                                    );
                                    return (
                                      <div
                                        key={rIdx}
                                        className="flex items-center gap-1.5 text-[10px]"
                                      >
                                        <div
                                          className="w-4 h-4 rounded-full shrink-0 border border-gray-200"
                                          style={{
                                            backgroundColor:
                                              statusInfo?.color || range.color || '#22C55E',
                                          }}
                                        />
                                        <input
                                          type="text"
                                          value={range.label || ''}
                                          onChange={(e) =>
                                            updateThresholdRange(gender, ageKey, rIdx, 'label', e.target.value)
                                          }
                                          placeholder="e.g. Optimal"
                                          className="w-[80px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                                        />
                                        <select
                                          value={range.status || ''}
                                          onChange={(e) => {
                                            const found = ALLOWED_STATUSES.find(
                                              (s) => s.value === e.target.value,
                                            );
                                            updateThresholdRange(gender, ageKey, rIdx, 'status', e.target.value);
                                            if (found) {
                                              updateThresholdRange(gender, ageKey, rIdx, 'color', found.color);
                                            }
                                          }}
                                          className="w-[110px] border border-Gray-50 rounded-lg px-1 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                                        >
                                          <option value="">— select —</option>
                                          {ALLOWED_STATUSES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                              {s.label}
                                            </option>
                                          ))}
                                        </select>
                                        <input
                                          type="number"
                                          step="any"
                                          value={range.low ?? ''}
                                          onChange={(e) =>
                                            updateThresholdRange(
                                              gender,
                                              ageKey,
                                              rIdx,
                                              'low',
                                              e.target.value === '' ? null : Number(e.target.value),
                                            )
                                          }
                                          placeholder="null"
                                          className="w-[55px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                                        />
                                        <input
                                          type="number"
                                          step="any"
                                          value={range.high ?? ''}
                                          onChange={(e) =>
                                            updateThresholdRange(
                                              gender,
                                              ageKey,
                                              rIdx,
                                              'high',
                                              e.target.value === '' ? null : Number(e.target.value),
                                            )
                                          }
                                          placeholder="null"
                                          className="w-[55px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                                        />
                                        <button
                                          type="button"
                                          className="text-red-400 hover:text-red-600 text-[12px] leading-none ml-0.5"
                                          title="Remove range"
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
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[10px] text-Text-Secondary mb-1">
                    Edit the full JSON definition. Must follow chart_bounds schema.
                  </div>
                  <textarea
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={16}
                    spellCheck={false}
                    className={`w-full font-mono text-[11px] border rounded-xl px-3 py-2 outline-none resize-none ${
                      jsonError
                        ? 'border-red-400 bg-red-50'
                        : 'border-Gray-50 focus:border-Primary-DeepTeal'
                    }`}
                  />
                  {jsonError && (
                    <div className="text-[10px] text-red-500">{jsonError}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleSwitchToForm}
                    className="text-[10px] text-Primary-DeepTeal underline"
                  >
                    Switch to form view
                  </button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-Gray-50 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="TextStyle-Headline-5 text-Disable cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="TextStyle-Headline-5 text-Primary-DeepTeal cursor-pointer disabled:opacity-50"
              >
                {saving ? <SpinnerLoader color="#005F73" /> : 'Save Biomarker'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateBiomarkerModal;
