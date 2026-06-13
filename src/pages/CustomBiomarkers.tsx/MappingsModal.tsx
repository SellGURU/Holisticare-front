/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import SpinnerLoader from '../../Components/SpinnerLoader';
import {
  buildMappingEntryFromBiomarker,
  buildUnitMappingEntryFromBiomarker,
  filterUnitMappingsForBiomarker,
  findBiomarkerMapping,
  updateBiomarkerMappingsForBiomarker,
} from './biomarkerIdentity';

interface MappingsModalProps {
  data: any;
  allBiomarkers: any[];
  unitMappings: any[];
  biomarkerMappings: any[];
  formatBiomarkerTypeLabel?: (value: string) => string;
  onClose: () => void;
  onUnitMappingsChange?: (entries: any[]) => void;
  onBiomarkerMappingsChange?: (entries: any[]) => void;
}

const MappingsModal: React.FC<MappingsModalProps> = ({
  data,
  allBiomarkers,
  unitMappings,
  biomarkerMappings,
  formatBiomarkerTypeLabel = (value) => value,
  onClose,
  onUnitMappingsChange,
  onBiomarkerMappingsChange,
}) => {
  const biomarkerName = data?.Biomarker || '';
  const targetUnit = String(data?.unit || '').trim();
  const biomarkerTypeLabel = formatBiomarkerTypeLabel(
    data?.biomarker_type || 'blood',
  );
  const panelLabel = String(data?.['Benchmark areas'] || '').trim();
  const [savingMapping, setSavingMapping] = useState(false);
  const [newUnit, setNewUnit] = useState('');
  const [newFactor, setNewFactor] = useState('');
  const [newOffset, setNewOffset] = useState('');
  const [newVariation, setNewVariation] = useState('');

  const relevantUnitMappings = useMemo(
    () => filterUnitMappingsForBiomarker(unitMappings, data, allBiomarkers),
    [unitMappings, data, allBiomarkers],
  );

  const relevantBiomarkerMapping = useMemo(
    () => findBiomarkerMapping(biomarkerMappings, data, allBiomarkers),
    [biomarkerMappings, data, allBiomarkers],
  );

  const handleAddUnitMapping = () => {
    if (!newUnit.trim()) return;
    setSavingMapping(true);

    const entry = buildUnitMappingEntryFromBiomarker(data, {
      unit: newUnit.trim(),
      to_unit: targetUnit,
      conversion_factor: newFactor ? Number(newFactor) : null,
      offset: newOffset ? Number(newOffset) : null,
    });

    onUnitMappingsChange?.([...unitMappings, entry]);
    setNewUnit('');
    setNewFactor('');
    setNewOffset('');
    setSavingMapping(false);
  };

  const handleRemoveUnitMapping = (localIndex: number) => {
    const target = relevantUnitMappings[localIndex];
    if (!target) return;

    onUnitMappingsChange?.(
      unitMappings.filter((mapping) => mapping !== target),
    );
  };

  const handleAddVariation = () => {
    const value = newVariation.trim();
    if (!value) return;

    const updated = updateBiomarkerMappingsForBiomarker(
      biomarkerMappings,
      data,
      allBiomarkers,
      (mapping) => {
        const currentVariations = mapping.variations || [];
        const exists = currentVariations.some(
          (variation: string) =>
            variation.trim().toLowerCase() === value.toLowerCase(),
        );
        if (exists) return mapping;

        return {
          ...buildMappingEntryFromBiomarker(data, currentVariations),
          variations: [...currentVariations, value],
        };
      },
    );

    onBiomarkerMappingsChange?.(updated);
    setNewVariation('');
  };

  const handleRemoveVariation = (variation: string) => {
    const updated = updateBiomarkerMappingsForBiomarker(
      biomarkerMappings,
      data,
      allBiomarkers,
      (mapping) => ({
        ...mapping,
        variations: (mapping.variations || []).filter(
          (item: string) => item !== variation,
        ),
      }),
    );

    onBiomarkerMappingsChange?.(updated);
  };

  return (
    <div className="w-[94vw] max-w-[760px] max-h-[86vh] bg-white rounded-[18px] flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-Gray-50">
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-Text-Primary truncate">
            Manage Mappings
          </div>
          <div className="mt-1 text-[10px] text-Text-Secondary truncate">
            {biomarkerName}
            {targetUnit ? ` · ${targetUnit}` : ' · no unit'}
            {panelLabel ? ` · ${panelLabel}` : ''}
            {` · ${biomarkerTypeLabel}`}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-full border border-Gray-50 text-[14px] text-Text-Secondary hover:border-Primary-DeepTeal hover:text-Primary-DeepTeal"
          aria-label="Close mappings modal"
        >
          x
        </button>
      </div>

      <div className="overflow-y-auto px-5 py-4 space-y-4">
        <section className="rounded-2xl border border-Gray-50 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-Text-Primary">
                Unit Mappings
              </div>
              <div className="text-[10px] text-Text-Secondary">
                Convert imported lab units into this biomarker default unit.
              </div>
            </div>
            <span className="rounded-full bg-[#F4F7F7] px-2 py-1 text-[10px] text-Text-Secondary">
              {relevantUnitMappings.length}
            </span>
          </div>

          {relevantUnitMappings.length > 0 ? (
            <div className="mb-3 overflow-hidden rounded-xl border border-Gray-50">
              <div className="grid grid-cols-[1fr_1fr_90px_80px_52px] gap-2 bg-gray-50 px-3 py-2 text-[10px] font-semibold uppercase text-Text-Secondary">
                <span>From unit</span>
                <span>To unit</span>
                <span className="text-center">Factor</span>
                <span className="text-center">Offset</span>
                <span />
              </div>
              {relevantUnitMappings.map((mapping, index) => (
                <div
                  key={`${mapping.unit}-${mapping.to_unit}-${index}`}
                  className="grid grid-cols-[1fr_1fr_90px_80px_52px] items-center gap-2 border-t border-Gray-50 px-3 py-2 text-[11px]"
                >
                  <span className="font-mono text-Text-Primary">
                    {mapping.unit}
                  </span>
                  <span className="font-mono text-Text-Primary">
                    {mapping.to_unit}
                  </span>
                  <span className="text-center text-Text-Secondary">
                    {mapping.conversion_factor ?? '-'}
                  </span>
                  <span className="text-center text-Text-Secondary">
                    {mapping.offset ?? '-'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnitMapping(index)}
                    className="text-[10px] text-red-400 hover:text-red-600"
                  >
                    Del
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-3 rounded-xl bg-[#F8FAFA] px-3 py-3 text-center text-[11px] text-Text-Secondary">
              No unit mappings for this biomarker.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_1fr_90px_80px_70px]">
            <input
              type="text"
              value={newUnit}
              onChange={(event) => setNewUnit(event.target.value)}
              placeholder="From unit"
              className="rounded-xl border border-Gray-50 bg-white px-3 py-2 text-[11px] outline-none focus:border-Primary-DeepTeal"
            />
            <input
              type="text"
              value={targetUnit}
              readOnly
              placeholder="No default unit"
              title="Target unit is fixed from the biomarker default unit."
              className="cursor-not-allowed rounded-xl border border-Gray-50 bg-gray-50 px-3 py-2 text-[11px] text-Text-Secondary outline-none"
            />
            <input
              type="number"
              step="any"
              value={newFactor}
              onChange={(event) => setNewFactor(event.target.value)}
              placeholder="Factor"
              className="rounded-xl border border-Gray-50 bg-white px-3 py-2 text-center text-[11px] outline-none focus:border-Primary-DeepTeal"
            />
            <input
              type="number"
              step="any"
              value={newOffset}
              onChange={(event) => setNewOffset(event.target.value)}
              placeholder="Offset"
              className="rounded-xl border border-Gray-50 bg-white px-3 py-2 text-center text-[11px] outline-none focus:border-Primary-DeepTeal"
            />
            <button
              type="button"
              onClick={handleAddUnitMapping}
              disabled={savingMapping || !newUnit.trim() || !targetUnit}
              className="rounded-xl bg-Primary-DeepTeal px-3 py-2 text-[11px] font-medium text-white disabled:opacity-40"
            >
              {savingMapping ? <SpinnerLoader color="#FFFFFF" /> : 'Add'}
            </button>
          </div>
          {!targetUnit ? (
            <div className="mt-2 text-[10px] text-red-400">
              This biomarker has no default unit, so a conversion target cannot
              be created.
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-Gray-50 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-Text-Primary">
                Name Variations
              </div>
              <div className="text-[10px] text-Text-Secondary">
                Alternate names that should map to this specific biomarker row.
              </div>
            </div>
            <span className="rounded-full bg-[#F4F7F7] px-2 py-1 text-[10px] text-Text-Secondary">
              {relevantBiomarkerMapping?.variations?.length || 0}
            </span>
          </div>

          {relevantBiomarkerMapping?.variations?.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {relevantBiomarkerMapping.variations.map(
                (variation: string, index: number) => (
                  <span
                    key={`${variation}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-Gray-50 bg-[#F8FAFA] px-3 py-1 text-[11px] text-Text-Secondary"
                  >
                    {variation}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariation(variation)}
                      className="text-[12px] leading-none text-red-400 hover:text-red-600"
                      aria-label={`Remove ${variation}`}
                    >
                      x
                    </button>
                  </span>
                ),
              )}
            </div>
          ) : (
            <div className="mb-3 rounded-xl bg-[#F8FAFA] px-3 py-3 text-center text-[11px] text-Text-Secondary">
              No name variations for this biomarker yet.
            </div>
          )}

          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              value={newVariation}
              onChange={(event) => setNewVariation(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddVariation();
                }
              }}
              placeholder="Add name variation..."
              className="flex-1 rounded-xl border border-Gray-50 bg-white px-3 py-2 text-[11px] outline-none focus:border-Primary-DeepTeal"
            />
            <button
              type="button"
              onClick={handleAddVariation}
              disabled={!newVariation.trim()}
              className="rounded-xl bg-Primary-DeepTeal px-4 py-2 text-[11px] font-medium text-white disabled:opacity-40"
            >
              Add variation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MappingsModal;
