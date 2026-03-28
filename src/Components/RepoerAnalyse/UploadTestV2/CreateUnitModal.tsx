/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import SpinnerLoader from '../../SpinnerLoader';
import Application from '../../../api/app';

interface Props {
  biomarkerName: string;
  extractedUnit: string;
  extractedValue?: string;
  systemUnit?: string;
  suggestions?: Array<{ system_biomarker: string; confidence: number; reason: string }>;
  onClose: () => void;
  onCreated: (newUnit: string) => void;
}

const CreateUnitModal: React.FC<Props> = ({
  biomarkerName,
  extractedUnit,
  extractedValue = '',
  systemUnit = '',
  suggestions = [],
  onClose,
  onCreated,
}) => {
  const [unit, setUnit] = useState(extractedUnit || '');
  // toUnit is always the biomarker's system unit — fixed target, not user-editable
  const toUnit = systemUnit || extractedUnit;
  const [conversionFactor, setConversionFactor] = useState('');
  const [offset, setOffset] = useState('');
  const [prefilling, setPrefilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live preview: compute what the extracted value would convert to
  const livePreview = useMemo(() => {
    const factor = parseFloat(conversionFactor);
    const off = parseFloat(offset) || 0;
    const sampleVal = parseFloat(extractedValue);
    if (!isNaN(factor) && !isNaN(sampleVal)) {
      const result = sampleVal * factor + off;
      const rounded = parseFloat(result.toPrecision(6));
      return { input: sampleVal, factor, offset: off, result: rounded };
    }
    return null;
  }, [conversionFactor, offset, extractedValue]);

  // Pre-fill conversion factor and offset via LLM on mount
  useEffect(() => {
    const prefill = async () => {
      if (!extractedUnit) return;
      setPrefilling(true);
      try {
        const res = await Application.prefillBiomarkerDraft({
          extracted_name: biomarkerName,
          extracted_value: extractedValue,
          extracted_unit: extractedUnit,
          // Pass system_unit so the LLM knows the conversion TARGET
          system_unit: toUnit,
          mode: 'unit',
          suggestions: suggestions.slice(0, 3),
        });
        if (res?.data?.draft) {
          const d = res.data.draft;
          // Don't override the unit (it's the extracted one) or to_unit (it's fixed)
          if (d.conversion_factor != null) {
            setConversionFactor(String(d.conversion_factor));
          }
          if (d.offset != null && d.offset !== 0) {
            setOffset(String(d.offset));
          }
        }
      } catch {
        // Prefill failed — leave defaults
      } finally {
        setPrefilling(false);
      }
    };
    prefill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setErrorMsg('');
    if (!unit.trim()) {
      setErrorMsg('Unit name is required.');
      return;
    }
    if (!biomarkerName.trim()) {
      setErrorMsg('Biomarker name is missing.');
      return;
    }

    const parsedFactor =
      conversionFactor.trim() !== '' ? parseFloat(conversionFactor) : null;
    const parsedOffset = offset.trim() !== '' ? parseFloat(offset) : null;

    if (parsedFactor !== null && isNaN(parsedFactor)) {
      setErrorMsg('Conversion factor must be a valid number.');
      return;
    }
    if (parsedOffset !== null && isNaN(parsedOffset)) {
      setErrorMsg('Offset must be a valid number.');
      return;
    }

    setSaving(true);
    try {
      await Application.addBiomarkerUnit({
        biomarker_name: biomarkerName,
        new_unit: unit.trim(),
        to_unit: toUnit.trim() || unit.trim(),
        conversion_factor: parsedFactor,
        offset: parsedOffset,
      });
      onCreated(unit.trim());
      onClose();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.detail ||
        err?.message ||
        'Failed to save unit.';
      setErrorMsg(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[90vw] max-w-[480px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-Gray-50">
          <div>
            <div className="TextStyle-Headline-5 text-Text-Primary">
              Create New Unit
            </div>
            <div className="text-[10px] text-Text-Secondary mt-0.5">
              Biomarker: <span className="font-medium text-Text-Primary">{biomarkerName || '—'}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        {/* Loading */}
        {prefilling && (
          <div className="flex items-center justify-center py-8 gap-2 text-[12px] text-Text-Secondary">
            <SpinnerLoader color="#005F73" />
            <span>Calculating conversion with AI…</span>
          </div>
        )}

        {!prefilling && (
          <>
            {/* Error banner */}
            {errorMsg && (
              <div className="mx-6 mt-4 bg-[#F9DEDC] rounded-xl px-4 py-2 text-[10px] text-Text-Primary flex items-start gap-2">
                <img src="/icons/info-circle-orange.svg" alt="" className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="px-6 py-4 space-y-4 overflow-y-auto">

              {/* New Unit (extracted, editable) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  New Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. mg/dL, µmol/L"
                  className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                />
                <div className="text-[9px] text-Text-Secondary mt-0.5 ml-1">
                  The extracted unit from the lab report that needs to be mapped.
                </div>
              </div>

              {/* Convert To Unit (system unit — read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Convert To Unit
                  <span className="text-[10px] text-Text-Secondary font-normal ml-1">(biomarker's standard unit)</span>
                </label>
                <div className="w-full border border-Gray-50 bg-gray-50 rounded-2xl px-3 py-2 text-[12px] text-Text-Secondary flex items-center justify-between">
                  <span className={`font-medium ${toUnit ? 'text-Text-Primary' : 'text-Text-Quadruple italic'}`}>
                    {toUnit || 'No standard unit defined'}
                  </span>
                  <span className="text-[9px] text-Text-Secondary bg-gray-200 rounded-full px-2 py-0.5 ml-2 shrink-0">
                    read-only
                  </span>
                </div>
                <div className="text-[9px] text-Text-Secondary mt-0.5 ml-1">
                  The system will always convert to this unit. Defined by the biomarker's standard definition.
                </div>
              </div>

              {/* Conversion Factor + Offset */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Conversion Factor
                    <span className="text-[10px] text-Primary-DeepTeal font-normal ml-1">✦ AI-suggested</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(e.target.value)}
                    placeholder="e.g. 0.0555"
                    className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Offset
                    <span className="text-[10px] text-Text-Secondary font-normal ml-1">(rare)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={offset}
                    onChange={(e) => setOffset(e.target.value)}
                    placeholder="0"
                    className="w-full border border-Gray-50 rounded-2xl px-3 py-2 text-[12px] outline-none focus:border-Primary-DeepTeal"
                  />
                </div>
              </div>

              {/* Live Conversion Preview */}
              <div className={`rounded-xl border px-3 py-2.5 text-[11px] ${
                livePreview
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium text-Text-Primary mb-1">
                  Conversion Preview
                </div>
                <div className="font-mono text-[10px] text-Text-Secondary mb-1.5">
                  result = value × factor + offset
                </div>
                {livePreview ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-[11px] font-medium text-Text-Primary">
                        {livePreview.input}
                      </span>
                      <span className="text-Text-Secondary text-[10px]">{unit || '?'}</span>
                      <span className="text-Text-Secondary">×</span>
                      <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-[11px] text-Primary-DeepTeal font-medium">
                        {livePreview.factor}
                      </span>
                      {livePreview.offset !== 0 && (
                        <>
                          <span className="text-Text-Secondary">+</span>
                          <span className="bg-white border border-gray-200 rounded px-1.5 py-0.5 font-mono text-[11px] text-Primary-DeepTeal font-medium">
                            {livePreview.offset}
                          </span>
                        </>
                      )}
                      <span className="text-Text-Secondary">=</span>
                      <span className="bg-green-100 border border-green-300 rounded px-1.5 py-0.5 font-mono text-[12px] font-bold text-green-700">
                        {livePreview.result}
                      </span>
                      <span className="text-Text-Secondary text-[10px]">{toUnit || '?'}</span>
                    </div>
                    <div className="text-[9px] text-Text-Secondary mt-1">
                      Based on the extracted sample value from the lab report. Verify this result matches clinical expectation.
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-Text-Secondary italic">
                    {conversionFactor
                      ? 'Enter a sample value above to see the conversion result.'
                      : 'Enter the conversion factor (AI-suggested above) to see a live preview.'}
                  </div>
                )}
              </div>
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
                {saving ? <SpinnerLoader color="#005F73" /> : 'Save Unit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateUnitModal;
