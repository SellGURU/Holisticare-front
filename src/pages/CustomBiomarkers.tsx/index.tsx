/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import BiomarkerRow from './BiomarkerItemNew';

import { MainModal } from '../../Components';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import AddModal from './AddModal';
import ChartModal from './ChartModal';
import MappingsModal from './MappingsModal';
import useIsDemo from '../../hooks/useIsDemo';

import DefaultData from './default.json';
import {
  ensureBiomarkerUid,
  migrateLegacyMappingsForDuplicates,
  migrateLegacyUnitMappingsForDuplicates,
  normalizeBiomarkersList,
} from './biomarkerIdentity';

type SortKey = 'Biomarker' | 'Benchmark areas' | 'biomarker_type' | 'unit';
type SortDirection = 'asc' | 'desc';

const DEFAULT_BIOMARKER_TYPES = [
  'blood',
  'urine',
  'dna',
  'gut',
  'saliva',
  'stool',
  'other',
];
const BIOMARKER_TYPE_LABELS: Record<string, string> = {
  blood: 'Blood',
  urine: 'Urine',
  dna: 'DNA',
  gut: 'Gut',
  saliva: 'Saliva',
  stool: 'Stool',
  other: 'Other',
};

const formatBiomarkerTypeLabel = (value: string) =>
  BIOMARKER_TYPE_LABELS[value] ||
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeSearchTerm = (value: any) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const getFieldValue = (item: any, key: SortKey) =>
  String(item?.[key] || '').trim();

const getUniqueOptions = (items: any[], key: string) =>
  Array.from(
    new Set(
      items.map((item) => String(item?.[key] || '').trim()).filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

const CustomBiomarkers = () => {
  const isDemo = useIsDemo();
  const [biomarkers, setBiomarkers] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [panelFilter, setPanelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('Biomarker');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeAdd, setActiveAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [selectedChartBiomarker, setSelectedChartBiomarker] =
    useState<any>(null);
  const [selectedMappingBiomarker, setSelectedMappingBiomarker] =
    useState<any>(null);

  const [unitMappingData, setUnitMappingData] = useState<any>(null);
  const [unitMappings, setUnitMappings] = useState<any[]>([]);
  const [biomarkerMappings, setBiomarkerMappings] = useState<any[]>([]);
  const [biomarkerTypes, setBiomarkerTypes] = useState<string[]>(
    DEFAULT_BIOMARKER_TYPES,
  );
  const mappingsMigrationDone = useRef(false);

  const changeBiomarkersValue = (values: any) => {
    setBiomarkers(normalizeBiomarkersList(values));
  };

  const openModalAdd = () => {
    if (isDemo) return;
    setActiveAdd(true);
  };
  const closeModalAdd = () => {
    setActiveAdd(false);
    setErrorDetails('');
  };

  const getBiomarkers = () => {
    setIsLoading(true);
    BiomarkersApi.getBiomarkerTypes()
      .then((res) => {
        const nextTypes = res?.data?.types;
        if (Array.isArray(nextTypes) && nextTypes.length > 0) {
          setBiomarkerTypes(nextTypes.map((type: any) => String(type)));
        }
      })
      .catch(() => {});
    BiomarkersApi.getBiomarkersList({ include_all: true })
      .then((res) => {
        setBiomarkers(normalizeBiomarkersList(res.data));
      })
      .catch((err) => {
        console.error('Error getting biomarkers:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadMappings = () => {
    BiomarkersApi.getUnitMapping()
      .then((res) => {
        const d = res.data;
        setUnitMappingData(d);
        setUnitMappings(d?.biomarker_specific || []);
      })
      .catch(() => {});

    BiomarkersApi.getBiomarkerMapping()
      .then((res) => {
        const data = res.data;
        if (data?.mappings && Array.isArray(data.mappings)) {
          setBiomarkerMappings(data.mappings);
        } else if (Array.isArray(data)) {
          setBiomarkerMappings(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    getBiomarkers();
    loadMappings();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchValue(searchInput);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (biomarkers.length > 0) {
      void import('./EditModal');
    }
  }, [biomarkers.length]);

  useEffect(() => {
    if (mappingsMigrationDone.current || biomarkers.length === 0 || isDemo) {
      return;
    }

    const migratedBiomarkerMappings = migrateLegacyMappingsForDuplicates(
      biomarkers,
      biomarkerMappings,
    );
    const migratedUnitMappings = migrateLegacyUnitMappingsForDuplicates(
      biomarkers,
      unitMappings,
    );

    const biomarkerMappingsChanged =
      migratedBiomarkerMappings.length !== biomarkerMappings.length ||
      migratedBiomarkerMappings.some(
        (entry, index) => entry !== biomarkerMappings[index],
      );
    const unitMappingsChanged =
      migratedUnitMappings.length !== unitMappings.length ||
      migratedUnitMappings.some(
        (entry, index) => entry !== unitMappings[index],
      );

    if (!biomarkerMappingsChanged && !unitMappingsChanged) {
      return;
    }

    mappingsMigrationDone.current = true;

    if (biomarkerMappingsChanged) {
      setBiomarkerMappings(migratedBiomarkerMappings);
      BiomarkersApi.updateBiomarkerMapping({
        mappings: migratedBiomarkerMappings,
      }).catch(() => {});
    }

    if (unitMappingsChanged) {
      setUnitMappings(migratedUnitMappings);
      const payload = {
        ...unitMappingData,
        biomarker_specific: migratedUnitMappings,
      };
      setUnitMappingData(payload);
      BiomarkersApi.updateUnitMapping(payload).catch(() => {});
    }
  }, [biomarkers, biomarkerMappings, unitMappings, unitMappingData, isDemo]);

  const handleUnitMappingsChange = (entries: any[]) => {
    if (isDemo) return;
    setUnitMappings(entries);
    const payload = { ...unitMappingData, biomarker_specific: entries };
    setUnitMappingData(payload);
    BiomarkersApi.updateUnitMapping(payload).catch(() => {});
  };

  const handleBiomarkerMappingsChange = (entries: any[]) => {
    if (isDemo) return;
    setBiomarkerMappings(entries);
    BiomarkersApi.updateBiomarkerMapping({ mappings: entries }).catch(() => {});
  };

  const handleUnitMappingsLocalChange = (entries: any[]) => {
    setUnitMappings(entries);
  };

  const handleBiomarkerMappingsLocalChange = (entries: any[]) => {
    setBiomarkerMappings(entries);
  };

  const normalizedSearchValue = useMemo(
    () => normalizeSearchTerm(searchValue),
    [searchValue],
  );

  const getBiomarkerSearchScore = (item: any) => {
    if (!normalizedSearchValue) return 1;

    const biomarkerName = normalizeSearchTerm(item?.Biomarker);
    const queryTokens = normalizedSearchValue.split(' ').filter(Boolean);

    if (biomarkerName === normalizedSearchValue) return 100;

    if (biomarkerName.startsWith(normalizedSearchValue)) return 80;

    const allTokensMatchBiomarker = queryTokens.every((token) =>
      biomarkerName.includes(token),
    );
    if (allTokensMatchBiomarker) return 60;

    return 0;
  };

  const benchmarkAreaOptions = useMemo(
    () => getUniqueOptions(biomarkers, 'Benchmark areas'),
    [biomarkers],
  );
  const benchmarkAreaOptionsByType = useMemo(() => {
    const optionsByType: Record<string, string[]> = {};
    biomarkers.forEach((item) => {
      const type = String(item?.biomarker_type || 'blood').trim();
      const area = String(item?.['Benchmark areas'] || '').trim();
      if (!type || !area) return;
      if (!optionsByType[type]) optionsByType[type] = [];
      if (
        !optionsByType[type].some(
          (existing) => existing.toLowerCase() === area.toLowerCase(),
        )
      ) {
        optionsByType[type].push(area);
      }
    });
    Object.keys(optionsByType).forEach((type) => {
      optionsByType[type].sort((a, b) => a.localeCompare(b));
    });
    return optionsByType;
  }, [biomarkers]);
  const biomarkerTypeOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...biomarkerTypes,
          ...getUniqueOptions(biomarkers, 'biomarker_type'),
        ]),
      ).filter(Boolean),
    [biomarkers, biomarkerTypes],
  );

  const filteredBiomarkerEntries = useMemo(() => {
    return biomarkers
      .map((item, originalIndex) => ({
        item,
        originalIndex,
        score: getBiomarkerSearchScore(item),
      }))
      .filter(({ item, score }) => {
        if (score <= 0) return false;
        if (panelFilter && item?.['Benchmark areas'] !== panelFilter)
          return false;
        if (typeFilter && item?.biomarker_type !== typeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const aValue = getFieldValue(a.item, sortKey);
        const bValue = getFieldValue(b.item, sortKey);
        const valueCompare = aValue.localeCompare(bValue, undefined, {
          sensitivity: 'base',
          numeric: true,
        });

        if (valueCompare !== 0) {
          return sortDirection === 'asc' ? valueCompare : -valueCompare;
        }

        if (b.score !== a.score) return b.score - a.score;

        return String(a.item?.Biomarker || '').localeCompare(
          String(b.item?.Biomarker || ''),
        );
      });
  }, [
    biomarkers,
    normalizedSearchValue,
    panelFilter,
    typeFilter,
    sortKey,
    sortDirection,
  ]);

  const filteredBiomarkers = useMemo(
    () => filteredBiomarkerEntries.map((entry) => entry.item),
    [filteredBiomarkerEntries],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const renderSortLabel = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1 text-left hover:text-Primary-DeepTeal"
    >
      {label}
      {sortKey === key ? (
        <span className="text-[9px]">
          {sortDirection === 'asc' ? '^' : 'v'}
        </span>
      ) : null}
    </button>
  );

  const clearFilters = () => {
    setSearchInput('');
    setSearchValue('');
    setPanelFilter('');
    setTypeFilter('');
  };

  const onsave = (values: any) => {
    setLoading(true);
    BiomarkersApi.addBiomarkersList({ new_biomarker: values })
      .then(() => {
        closeModalAdd();
        setBiomarkers((pre) => [...pre, ensureBiomarkerUid(values)]);
      })
      .catch((error) => {
        setErrorDetails(
          error?.response?.data?.detail ||
            error?.detail ||
            error?.message ||
            'Unable to add biomarker.',
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="fixed z-30 w-full bg-bg-color px-2 pt-6 pb-3 md:px-6 md:pr-[200px]">
        <div className="rounded-2xl border border-Gray-50 bg-white px-4 py-3 shadow-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[15px] font-semibold text-Text-Primary">
                Custom Biomarkers
              </div>
              <div className="mt-0.5 text-[10px] text-Text-Secondary">
                Showing {filteredBiomarkers.length} of {biomarkers.length}{' '}
                biomarkers
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <SearchBox
                value={searchInput}
                ClassName="!h-9 !rounded-xl !border !border-Gray-50 !bg-white !py-0 !px-3 !shadow-[unset] md:!min-w-[340px]"
                placeHolder="Search biomarker name..."
                onSearch={(val) => setSearchInput(val)}
                showClose
                isHaveBorder
              />

              <select
                value={panelFilter}
                onChange={(event) => setPanelFilter(event.target.value)}
                className="h-9 min-w-[170px] rounded-xl border border-Gray-50 bg-white px-3 text-[11px] text-Text-Primary outline-none focus:border-Primary-DeepTeal"
              >
                <option value="">All panels</option>
                {benchmarkAreaOptions.map((panel) => (
                  <option key={panel} value={panel}>
                    {panel}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-9 min-w-[140px] rounded-xl border border-Gray-50 bg-white px-3 text-[11px] text-Text-Primary outline-none focus:border-Primary-DeepTeal"
              >
                <option value="">All types</option>
                {biomarkerTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {formatBiomarkerTypeLabel(type)}
                  </option>
                ))}
              </select>

              {(searchInput || panelFilter || typeFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 rounded-xl border border-Gray-50 bg-white px-3 text-[11px] font-medium text-Text-Secondary hover:border-Primary-DeepTeal hover:text-Primary-DeepTeal"
                >
                  Clear
                </button>
              )}

              <ButtonSecondary
                ClassName="h-9 rounded-xl text-xs border border-white"
                disabled={isDemo}
                onClick={openModalAdd}
                title={isDemo ? 'Demo plan - upgrade to enable' : undefined}
              >
                <img src="/icons/add-square.svg" alt="" />
                Add Biomarker
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[550px] w-full items-center justify-center px-6 py-[100px]">
          <Circleloader />
        </div>
      ) : (
        <div className="min-h-full w-full px-2 pt-[150px] pb-8 md:px-6">
          <div className="overflow-hidden rounded-2xl border border-Gray-50 bg-white shadow-100">
            <div className="overflow-x-auto">
              <div className="grid min-w-[1000px] grid-cols-[48px_minmax(300px,1.5fr)_minmax(220px,1fr)_110px_90px_92px_128px] gap-3 border-b border-Gray-50 bg-gray-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-Text-Secondary">
                <span>#</span>
                <span>{renderSortLabel('Biomarker', 'Biomarker')}</span>
                <span>{renderSortLabel('Panel', 'Benchmark areas')}</span>
                <span>{renderSortLabel('Type', 'biomarker_type')}</span>
                <span>{renderSortLabel('Unit', 'unit')}</span>
                <span>Mappings</span>
                <span className="text-right">Actions</span>
              </div>

              {filteredBiomarkerEntries.map(
                ({ item: value, originalIndex }, index: number) => (
                  <BiomarkerRow
                    key={
                      value?.biomarker_uid ||
                      `${value?.Biomarker || 'biomarker'}-${originalIndex}`
                    }
                    rowIndex={index}
                    biomarkerIndex={originalIndex}
                    data={value}
                    biomarkers={biomarkers}
                    changeBiomarkersValue={changeBiomarkersValue}
                    searchTerm={searchValue}
                    benchmarkAreaOptions={benchmarkAreaOptions}
                    benchmarkAreaOptionsByType={benchmarkAreaOptionsByType}
                    biomarkerTypeOptions={biomarkerTypeOptions}
                    formatBiomarkerTypeLabel={formatBiomarkerTypeLabel}
                    unitMappings={unitMappings}
                    biomarkerMappings={biomarkerMappings}
                    onUnitMappingsLocalChange={handleUnitMappingsLocalChange}
                    onBiomarkerMappingsLocalChange={
                      handleBiomarkerMappingsLocalChange
                    }
                    onOpenChart={setSelectedChartBiomarker}
                    onOpenMappings={setSelectedMappingBiomarker}
                  />
                ),
              )}

              {filteredBiomarkers.length === 0 && (
                <div className="flex min-h-[320px] min-w-[1000px] flex-col items-center justify-center gap-2">
                  <img
                    className="w-[220px]"
                    src="/icons/empty-messages-coach.svg"
                    alt=""
                  />
                  <div className="-mt-10 text-center text-base font-medium text-Text-Primary">
                    No results found.
                  </div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[11px] font-medium text-Primary-DeepTeal hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MainModal isOpen={activeAdd} onClose={closeModalAdd}>
        <AddModal
          onCancel={closeModalAdd}
          onSave={(values: any) => onsave(values)}
          data={DefaultData}
          biomarkerTypeOptions={biomarkerTypeOptions}
          benchmarkAreaOptionsByType={benchmarkAreaOptionsByType}
          loading={loading}
          errorDetails={errorDetails}
          setErrorDetails={setErrorDetails}
        />
      </MainModal>

      <MainModal
        isOpen={Boolean(selectedChartBiomarker)}
        onClose={() => setSelectedChartBiomarker(null)}
      >
        <ChartModal
          data={selectedChartBiomarker}
          onClose={() => setSelectedChartBiomarker(null)}
        />
      </MainModal>

      <MainModal
        isOpen={Boolean(selectedMappingBiomarker)}
        onClose={() => setSelectedMappingBiomarker(null)}
      >
        <MappingsModal
          data={selectedMappingBiomarker}
          allBiomarkers={biomarkers}
          unitMappings={unitMappings}
          biomarkerMappings={biomarkerMappings}
          formatBiomarkerTypeLabel={formatBiomarkerTypeLabel}
          onClose={() => setSelectedMappingBiomarker(null)}
          onUnitMappingsChange={handleUnitMappingsChange}
          onBiomarkerMappingsChange={handleBiomarkerMappingsChange}
        />
      </MainModal>
    </>
  );
};

export default CustomBiomarkers;
