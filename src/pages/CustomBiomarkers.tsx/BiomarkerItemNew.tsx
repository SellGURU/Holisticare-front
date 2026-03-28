/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import { MainModal } from '../../Components';
import SvgIcon from '../../utils/svgIcon';
import EditModal from './EditModal';
import Select from '../../Components/Select';
import StatusBarChartv3 from './StatusBarChartv3';
import SpinnerLoader from '../../Components/SpinnerLoader';

interface BiomarkerItemNewProps {
  data: any;
  biomarkers: any[];
  changeBiomarkersValue: (values: any) => void;
  searchTerm?: string;
  unitMappings?: any[];
  biomarkerMappings?: any[];
  onUnitMappingsChange?: (entries: any[]) => void;
  onBiomarkerMappingsChange?: (entries: any[]) => void;
}

const BiomarkerItem = ({
  data,
  biomarkers,
  changeBiomarkersValue,
  searchTerm = '',
  unitMappings = [],
  biomarkerMappings = [],
  onUnitMappingsChange,
  onBiomarkerMappingsChange,
}: BiomarkerItemNewProps) => {
  const getMaleThresholdKeys = () => {
    if (data && data.thresholds && data.thresholds.male) {
      return Object.keys(data.thresholds.male);
    }
    return [];
  };
  const getFemaleThresholdKeys = () => {
    if (data && data.thresholds && data.thresholds.female) {
      return Object.keys(data.thresholds.female);
    }
    return [];
  };
  const [activeEdit, setActiveEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModalEdit = () => setActiveEdit(true);
  const closeModalEdit = () => {
    setActiveEdit(false);
    setErrorDetails('');
  };
  const [activeBiomarker, setActiveBiomarker] = useState(() => {
    const maleKeys = getMaleThresholdKeys();
    const femaleKeys = getFemaleThresholdKeys();
    if (maleKeys.length > 0 && data?.thresholds?.male?.[maleKeys[0]]) {
      const maleData = data.thresholds.male[maleKeys[0]];
      if (maleData && (Array.isArray(maleData) ? maleData.length > 0 : Object.keys(maleData).length > 0)) {
        return maleData;
      }
    }
    if (femaleKeys.length > 0 && data?.thresholds?.female?.[femaleKeys[0]]) {
      return data.thresholds.female[femaleKeys[0]];
    }
    return null;
  });
  const [errorDetails, setErrorDetails] = useState('');
  const [showMappings, setShowMappings] = useState(false);
  const [savingMapping, setSavingMapping] = useState(false);

  useEffect(() => {
    const maleKeys = data && data.thresholds && data.thresholds.male ? Object.keys(data.thresholds.male) : [];
    const femaleKeys = data && data.thresholds && data.thresholds.female ? Object.keys(data.thresholds.female) : [];
    if (maleKeys.length > 0 && data?.thresholds?.male?.[maleKeys[0]]) {
      const maleData = data.thresholds.male[maleKeys[0]];
      if (maleData && (Array.isArray(maleData) ? maleData.length > 0 : Object.keys(maleData).length > 0)) {
        setActiveBiomarker(maleData);
        return;
      }
    }
    if (femaleKeys.length > 0 && data?.thresholds?.female?.[femaleKeys[0]]) {
      setActiveBiomarker(data.thresholds.female[femaleKeys[0]]);
      return;
    }
    setActiveBiomarker(null);
  }, [data]);

  const [gender, setGender] = useState('male');
  const [ageRange, setAgeRange] = useState(getMaleThresholdKeys()[0]);
  const avilableGenders = () => ['male', 'female'];
  const avilableAges = () => getMaleThresholdKeys();

  const replaceBiomarker = (biomarkers: any[], updatedItem: any): any[] => {
    return biomarkers.map((item) =>
      item.Biomarker === updatedItem.Biomarker ? updatedItem : item,
    );
  };

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      ),
    );
  };

  const onsave = (values: any) => {
    setLoading(true);
    BiomarkersApi.saveBiomarkersList({ updated_biomarker: values })
      .then(() => {
        closeModalEdit();
        changeBiomarkersValue(replaceBiomarker(biomarkers, values));
      })
      .catch((error) => {
        setErrorDetails(error.detail);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Filter mappings relevant to this biomarker
  const biomarkerName = data.Biomarker || '';
  const relevantUnitMappings = unitMappings.filter(
    (m) => m.biomarker?.toLowerCase() === biomarkerName.toLowerCase(),
  );
  const relevantBiomarkerMapping = biomarkerMappings.find(
    (m) => m.standard_name?.toLowerCase() === biomarkerName.toLowerCase(),
  );

  // Unit mapping inline management
  const [newUnit, setNewUnit] = useState('');
  const [newToUnit, setNewToUnit] = useState('');
  const [newFactor, setNewFactor] = useState('');
  const [newOffset, setNewOffset] = useState('');

  const handleAddUnitMapping = async () => {
    if (!newUnit.trim()) return;
    setSavingMapping(true);
    const entry = {
      biomarker: biomarkerName,
      unit: newUnit.trim(),
      to_unit: newToUnit.trim() || data.unit || '',
      conversion_factor: newFactor ? Number(newFactor) : null,
      offset: newOffset ? Number(newOffset) : null,
    };
    const updated = [...unitMappings, entry];
    try {
      onUnitMappingsChange?.(updated);
      setNewUnit('');
      setNewToUnit('');
      setNewFactor('');
      setNewOffset('');
    } finally {
      setSavingMapping(false);
    }
  };

  const handleRemoveUnitMapping = (idx: number) => {
    const globalIdx = unitMappings.findIndex(
      (m) => m.biomarker?.toLowerCase() === biomarkerName.toLowerCase() && unitMappings.indexOf(m) >= 0,
    );
    if (globalIdx === -1) return;
    let count = 0;
    const removeIdx = unitMappings.findIndex((m) => {
      if (m.biomarker?.toLowerCase() === biomarkerName.toLowerCase()) {
        if (count === idx) return true;
        count++;
      }
      return false;
    });
    if (removeIdx !== -1) {
      const updated = unitMappings.filter((_, i) => i !== removeIdx);
      onUnitMappingsChange?.(updated);
    }
  };

  // Biomarker name mapping inline management
  const [newVariation, setNewVariation] = useState('');

  const handleAddVariation = () => {
    if (!newVariation.trim()) return;
    const existing = relevantBiomarkerMapping;
    if (existing) {
      const updated = biomarkerMappings.map((m) =>
        m.standard_name?.toLowerCase() === biomarkerName.toLowerCase()
          ? { ...m, variations: [...(m.variations || []), newVariation.trim()] }
          : m,
      );
      onBiomarkerMappingsChange?.(updated);
    } else {
      const updated = [...biomarkerMappings, {
        standard_name: biomarkerName,
        variations: [biomarkerName, newVariation.trim()],
      }];
      onBiomarkerMappingsChange?.(updated);
    }
    setNewVariation('');
  };

  const handleRemoveVariation = (variation: string) => {
    const updated = biomarkerMappings.map((m) =>
      m.standard_name?.toLowerCase() === biomarkerName.toLowerCase()
        ? { ...m, variations: (m.variations || []).filter((v: string) => v !== variation) }
        : m,
    );
    onBiomarkerMappingsChange?.(updated);
  };

  return (
    <>
      <div className="w-full relative py-2 px-3 bg-[#F4F4F4] pt-2 rounded-[12px] border border-gray-50 min-h-[60px]">
        <div className="flex flex-col md:flex-row gap-6 w-full min-h-[60px] justify-start items-start">
          <div className="md:w-[200px]">
            <div className="text-[10px] md:text-[12px] font-medium text-Text-Primary">
              {highlightText(data.Biomarker, searchTerm)}
              <span className="text-[8px] md:text-[10px] text-[#888888] ml-[2px]">
                ({data.unit})
              </span>
            </div>
            <div className="text-[8px] md:text-[10px] text-nowrap mt-1 text-Text-Quadruple">
              {data.Category}
            </div>
          </div>
          <div className="w-full md:w-[80%] mt-4 md:mt-8">
            <StatusBarChartv3 isCustom data={activeBiomarker ?? []} />
          </div>
          <div className="absolute right-4 gap-2 flex justify-end items-center top-2">
            <div className="hidden">
              <Select key="ages" onChange={(val) => setAgeRange(val)} value={ageRange} options={avilableAges()} />
            </div>
            <div className="hidden">
              <Select isCapital key="gender" onChange={(val) => setGender(val)} value={gender} options={avilableGenders()} />
            </div>
            {/* Mapping toggle */}
            <button
              type="button"
              onClick={() => setShowMappings(!showMappings)}
              className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors ${
                showMappings
                  ? 'bg-Primary-DeepTeal text-white border-Primary-DeepTeal'
                  : 'bg-white text-Text-Secondary border-Gray-50 hover:border-Primary-DeepTeal'
              }`}
              title="Manage unit & name mappings"
            >
              Mappings
              {(relevantUnitMappings.length > 0 || relevantBiomarkerMapping) && (
                <span className="ml-1 bg-white/30 rounded-full px-1 text-[8px]">
                  {relevantUnitMappings.length + (relevantBiomarkerMapping ? (relevantBiomarkerMapping.variations?.length || 0) : 0)}
                </span>
              )}
            </button>
            <div onClick={openModalEdit}>
              <SvgIcon color="#005F73" src="./icons/edit-green.svg" />
            </div>
          </div>
        </div>

        {/* Mappings panel */}
        {showMappings && (
          <div className="mt-3 border-t border-Gray-50 pt-3 space-y-3">
            {/* Unit Mappings */}
            <div>
              <div className="text-[10px] font-semibold text-Text-Primary mb-1.5">
                Unit Mappings
                <span className="text-Text-Secondary font-normal ml-1">({relevantUnitMappings.length})</span>
              </div>
              {relevantUnitMappings.length > 0 && (
                <div className="space-y-1 mb-2">
                  {relevantUnitMappings.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] bg-white rounded-lg px-2 py-1 border border-gray-100">
                      <span className="font-mono text-Text-Primary">{m.unit}</span>
                      <span className="text-Text-Secondary">→</span>
                      <span className="font-mono text-Text-Primary">{m.to_unit}</span>
                      {m.conversion_factor != null && (
                        <span className="text-Text-Secondary text-[9px]">×{m.conversion_factor}</span>
                      )}
                      {m.offset != null && m.offset !== 0 && (
                        <span className="text-Text-Secondary text-[9px]">+{m.offset}</span>
                      )}
                      <button
                        type="button"
                        className="ml-auto text-red-400 hover:text-red-600 text-[12px]"
                        onClick={() => handleRemoveUnitMapping(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Add new unit mapping */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="From unit"
                  className="w-[80px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                />
                <span className="text-Text-Secondary text-[10px]">→</span>
                <input
                  type="text"
                  value={newToUnit}
                  onChange={(e) => setNewToUnit(e.target.value)}
                  placeholder={data.unit || 'To unit'}
                  className="w-[80px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                />
                <input
                  type="number"
                  step="any"
                  value={newFactor}
                  onChange={(e) => setNewFactor(e.target.value)}
                  placeholder="Factor"
                  className="w-[60px] border border-Gray-50 rounded-lg px-1 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                />
                <input
                  type="number"
                  step="any"
                  value={newOffset}
                  onChange={(e) => setNewOffset(e.target.value)}
                  placeholder="Offset"
                  className="w-[55px] border border-Gray-50 rounded-lg px-1 py-0.5 text-[10px] outline-none text-center focus:border-Primary-DeepTeal bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddUnitMapping}
                  disabled={savingMapping || !newUnit.trim()}
                  className="text-[9px] text-Primary-DeepTeal hover:underline font-medium disabled:opacity-40"
                >
                  {savingMapping ? <SpinnerLoader color="#005F73" /> : '+ Add'}
                </button>
              </div>
            </div>

            {/* Biomarker Name Mappings */}
            <div>
              <div className="text-[10px] font-semibold text-Text-Primary mb-1.5">
                Name Variations
                <span className="text-Text-Secondary font-normal ml-1">
                  ({relevantBiomarkerMapping?.variations?.length || 0})
                </span>
              </div>
              {relevantBiomarkerMapping?.variations?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {relevantBiomarkerMapping.variations.map((v: string, i: number) => (
                    <span
                      key={i}
                      className="bg-white border border-gray-100 rounded-full px-2 py-0.5 text-[10px] text-Text-Secondary flex items-center gap-1"
                    >
                      {v}
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 text-[11px] leading-none"
                        onClick={() => handleRemoveVariation(v)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newVariation}
                  onChange={(e) => setNewVariation(e.target.value)}
                  placeholder="Add name variation..."
                  className="w-[160px] border border-Gray-50 rounded-lg px-1.5 py-0.5 text-[10px] outline-none focus:border-Primary-DeepTeal bg-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVariation(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddVariation}
                  disabled={!newVariation.trim()}
                  className="text-[9px] text-Primary-DeepTeal hover:underline font-medium disabled:opacity-40"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MainModal isOpen={activeEdit} onClose={closeModalEdit}>
        <EditModal
          onCancel={closeModalEdit}
          onSave={(values: any) => onsave(values)}
          data={data}
          loading={loading}
          errorDetails={errorDetails}
          setErrorDetails={setErrorDetails}
        />
      </MainModal>
    </>
  );
};

export default BiomarkerItem;
