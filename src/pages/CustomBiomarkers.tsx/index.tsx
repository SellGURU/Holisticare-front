/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import BiomarkersApi from '../../api/Biomarkers';
import Circleloader from '../../Components/CircleLoader';
import SearchBox from '../../Components/SearchBox';
import BioMarkerBox from './BiomarkerBox';

import { MainModal } from '../../Components';
import { ButtonSecondary } from '../../Components/Button/ButtosSecondary';
import AddModal from './AddModal';

import DefaultData from './default.json';

const normalizeSearchTerm = (value: any) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const CustomBiomarkers = () => {
  const [biomarkers, setBiomarkers] = useState<Array<any>>([]);
  const changeBiomarkersValue = (values: any) => {
    setBiomarkers(values);
  };
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [activeAdd, setActiveAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const openModalAdd = () => setActiveAdd(true);
  const closeModalAdd = () => {
    setActiveAdd(false);
    setErrorDetails('');
  };
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Mapping data loaded once at page level
  const [unitMappingData, setUnitMappingData] = useState<any>(null);
  const [unitMappings, setUnitMappings] = useState<any[]>([]);
  const [biomarkerMappings, setBiomarkerMappings] = useState<any[]>([]);

  const getBiomarkers = () => {
    setIsLoading(true);
    BiomarkersApi.getBiomarkersList()
      .then((res) => {
        setBiomarkers(res.data);
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

  // Warm the edit-modal chunk after biomarkers load so the first "Edit" click
  // does not wait on dynamic import.
  useEffect(() => {
    if (biomarkers.length > 0) {
      void import('./EditModal');
    }
  }, [biomarkers.length]);

  // Save unit mappings back to server
  const handleUnitMappingsChange = (entries: any[]) => {
    setUnitMappings(entries);
    const payload = { ...unitMappingData, biomarker_specific: entries };
    setUnitMappingData(payload);
    BiomarkersApi.updateUnitMapping(payload).catch(() => {});
  };

  // Save biomarker name mappings back to server
  const handleBiomarkerMappingsChange = (entries: any[]) => {
    setBiomarkerMappings(entries);
    BiomarkersApi.updateBiomarkerMapping({ mappings: entries }).catch(() => {});
  };

  const normalizedSearchValue = useMemo(
    () => normalizeSearchTerm(searchValue),
    [searchValue],
  );

  const getBiomarkerVariations = (biomarkerName: string) => {
    const normalizedBiomarkerName = normalizeSearchTerm(biomarkerName);
    const matchingMapping = biomarkerMappings.find((mapping) => {
      const standardName = normalizeSearchTerm(mapping?.standard_name);
      const variations = (mapping?.variations || []).map(normalizeSearchTerm);
      return (
        standardName === normalizedBiomarkerName ||
        variations.includes(normalizedBiomarkerName)
      );
    });

    return (matchingMapping?.variations || [])
      .map(normalizeSearchTerm)
      .filter(Boolean);
  };

  const getBiomarkerSearchScore = (item: any) => {
    if (!normalizedSearchValue) return 1;

    const biomarkerName = normalizeSearchTerm(item?.Biomarker);
    const benchmarkArea = normalizeSearchTerm(item?.['Benchmark areas']);
    const category = normalizeSearchTerm(item?.Category);
    const variations = getBiomarkerVariations(item?.Biomarker || '');
    const queryTokens = normalizedSearchValue.split(' ').filter(Boolean);

    const exactBiomarkerMatch =
      biomarkerName === normalizedSearchValue ||
      variations.includes(normalizedSearchValue);
    if (exactBiomarkerMatch) return 100;

    const startsWithBiomarkerMatch =
      biomarkerName.startsWith(normalizedSearchValue) ||
      variations.some((variation: string) =>
        variation.startsWith(normalizedSearchValue),
      );
    if (startsWithBiomarkerMatch) return 80;

    const allTokensMatchBiomarker = queryTokens.every(
      (token) =>
        biomarkerName.includes(token) ||
        variations.some((variation: string) => variation.includes(token)),
    );
    if (allTokensMatchBiomarker) return 60;

    const categoryFields = [benchmarkArea, category].filter(Boolean);
    const exactCategoryMatch = categoryFields.includes(normalizedSearchValue);
    if (exactCategoryMatch) return 40;

    const startsWithCategoryMatch = categoryFields.some((field) =>
      field.startsWith(normalizedSearchValue),
    );
    if (startsWithCategoryMatch) return 30;

    const allTokensMatchCategory =
      queryTokens.length > 1 &&
      queryTokens.every((token) =>
        categoryFields.some((field) => field.includes(token)),
      );
    if (allTokensMatchCategory) return 20;

    return 0;
  };

  const filteredBiomarkers = useMemo(() => {
    return biomarkers
      .map((item) => ({
        item,
        score: getBiomarkerSearchScore(item),
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return String(a.item?.Biomarker || '').localeCompare(
          String(b.item?.Biomarker || ''),
        );
      })
      .map((entry) => entry.item);
  }, [biomarkers, biomarkerMappings, normalizedSearchValue]);

  const benchmarkAreaOptions = useMemo(
    () =>
      Array.from(
        new Set(
          biomarkers
            .map((item) => String(item?.['Benchmark areas'] || '').trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [biomarkers],
  );

  const resolveAllBenchmarks = () => {
    return [...new Set(filteredBiomarkers.map((el) => el['Benchmark areas']))];
  };

  const getFilteredBiomarkersForCategory = (benchmark: string) => {
    return filteredBiomarkers.filter(
      (item) => item['Benchmark areas'] === benchmark,
    );
  };

  const onsave = (values: any) => {
    setLoading(true);
    BiomarkersApi.addBiomarkersList({ new_biomarker: values })
      .then(() => {
        closeModalAdd();
        setBiomarkers((pre) => [...pre, values]);
      })
      .catch((error) => {
        setErrorDetails(error.detail);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <div className="fixed w-full z-30 bg-bg-color px-2 md:px-6 pt-8 pb-2 md:pr-[200px]">
        <div className="w-full flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <div className="text-Text-Primary font-medium opacity-[87%] text-nowrap">
            Custom Biomarker
          </div>
          <div className="flex flex-col md:flex-row pr-4 md:pr-0 md:items-center gap-4">
            <SearchBox
              value={searchValue}
              ClassName="rounded-2xl !h-7 !py-[0px] !px-3 !shadow-[unset]"
              placeHolder="Search categories & biomarkers ..."
              onSearch={(val) => setSearchValue(val)}
            />
            <ButtonSecondary
              ClassName="rounded-[20px] text-xs border border-white"
              onClick={openModalAdd}
            >
              <img src="/icons/add-square.svg" alt="" />
              Add Biomarker
            </ButtonSecondary>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center items-center min-h-[550px] px-6 py-[80px]">
          <Circleloader />
        </div>
      ) : (
        <div className="w-full min-h-full px-2 md:px-6 py-[80px]">
          {resolveAllBenchmarks().map((benchmark) => {
            const filteredBiomarkersForCategory = getFilteredBiomarkersForCategory(benchmark);
            return (
              <BioMarkerBox
                key={benchmark}
                biomarkers={filteredBiomarkersForCategory}
                onSave={(values) => {
                  setBiomarkers((pre) => {
                    const resolved = pre.map((ol) => {
                      if (ol['Benchmark areas'] == values['Benchmark areas']) {
                        return values;
                      } else {
                        return ol;
                      }
                    });
                    return [...resolved];
                  });
                }}
                data={
                  biomarkers.filter(
                    (item) => item['Benchmark areas'] == benchmark,
                  )[0]
                }
                biomarkersData={biomarkers}
                changeBiomarkersValue={changeBiomarkersValue}
                searchTerm={searchValue}
                benchmarkAreaOptions={benchmarkAreaOptions}
                unitMappings={unitMappings}
                biomarkerMappings={biomarkerMappings}
                onUnitMappingsChange={handleUnitMappingsChange}
                onBiomarkerMappingsChange={handleBiomarkerMappingsChange}
              />
            );
          })}
          {filteredBiomarkers.length == 0 && (
            <div className="h-full">
              <div className="flex h-full justify-center items-center flex-col gap-2">
                <img className="w-[220px]" src="/icons/empty-messages-coach.svg" alt="" />
                <div className="text-Text-Primary -mt-10 text-center text-base font-medium">
                  No results found.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <MainModal isOpen={activeAdd} onClose={closeModalAdd}>
        <AddModal
          onCancel={closeModalAdd}
          onSave={(values: any) => onsave(values)}
          data={DefaultData}
          loading={loading}
          errorDetails={errorDetails}
          setErrorDetails={setErrorDetails}
        />
      </MainModal>
    </>
  );
};

export default CustomBiomarkers;
