/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import Select from '../../Select';
import SimpleDatePicker from '../../SimpleDatePicker';
import { publish, subscribe, unsubscribe } from '../../../utils/event';
import Toggle from '../Boxs/Toggle';
import BiomarkerRow from './BiomarkerRow';
import ProgressLoading from './ProgressLoading';
import Joyride, { CallBackProps, Step } from 'react-joyride';
import { TutorialReminderToast } from './showTutorialReminderToast';
import CreateBiomarkerModal from './CreateBiomarkerModal';
import CreateUnitModal from './CreateUnitModal';
import BiomarkersApi from '../../../api/Biomarkers';
import type {
  BiomarkerOption,
  BiomarkerSuggestion,
} from '../../searchableSelect/SearchSelectWithSuggestions';

const biomarkersSteps: Step[] = [
  {
    target: '[data-tour="biomarker-table"]',
    content:
      'This table shows all biomarkers automatically extracted from the uploaded lab report.',
    placement: 'left-start',
  },
  {
    target: '[data-tour="extracted-biomarker"]',
    content:
      'This column displays the biomarker name detected from the uploaded document.',
  },
  {
    target: '[data-tour="system-biomarker"]',
    content:
      'Select the correct system biomarker. Its default system unit is shown there too so you can compare it against the extracted lab unit.',
  },
  {
    target: '[data-tour="extracted-value"]',
    content:
      'This is the value extracted from the lab report. Please verify its accuracy.',
  },
  {
    target: '[data-tour="extracted-unit"]',
    content:
      'Ensure the unit matches the original lab report before proceeding.',
  },
  {
    target: '[data-tour="delete-biomarker"]',
    content: 'Use this action to remove an incorrect or unnecessary biomarker.',
  },
];

interface BiomarkersSectionProps {
  biomarkers: any[];
  onChange: (updated: any[]) => void; // callback to update parent state
  uploadedFile: any;
  dateOfTest: Date | null;
  setDateOfTest: (date: Date | null) => void;
  fileType: string;
  loading: boolean;
  rowErrors?: any;
  setrowErrors: any;
  showOnlyErrors: boolean;
  setShowOnlyErrors: (showOnlyErrors: boolean) => void;
  progressBiomarkerUpload: number;
}

const BiomarkersSection: React.FC<BiomarkersSectionProps> = ({
  biomarkers,
  fileType,
  onChange,
  uploadedFile,
  dateOfTest,
  setDateOfTest,
  loading,
  rowErrors,
  setrowErrors,
  showOnlyErrors,
  setShowOnlyErrors,
  progressBiomarkerUpload,
}) => {
  // const [changedRows, setChangedRows] = useState<string[]>([]);
  // const [mappedRows, setMappedRows] = useState<string[]>([]);
  // const [mappingStatus, setMappingStatus] = useState<
  //   Record<string, 'added' | 'removed' | null>
  // >({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleValueChange = (id: string, newValue: string) => {
    // update local state immediately so UI feels responsive
    const updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, original_value: newValue } : b,
    );
    onChange(updated);

    // clear previous timer if user is still typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timer (3s)
    typingTimeoutRef.current = setTimeout(() => {
      updateAndStandardize(id, { original_value: newValue });
    }, 3000);
  };
  // const handleValueChange = (index: number, newValue: number | string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_value: newValue } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleNameChange = (index: number, newName: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, biomarker: newName } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleUnitChange = (index: number, newUnit: string) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === index ? { ...b, original_unit: newUnit } : b,
  //   );
  //   onChange(updated);
  // };

  // const handleTrashClick = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'confirm' } : b,
  //   );
  //   onChange(updated);
  // };
  const deletedIndexRef = useRef<number | null>(null);

  const handleConfirm = (indexToDelete: number) => {
    // Remember which index was deleted
    deletedIndexRef.current = indexToDelete;

    // update biomarkers
    const updated = biomarkers.filter((_, i) => i !== indexToDelete);
    if (updated.length === 0) {
      // alert('delete file trigger1');
      publish('DELETE_FILE_TRIGGER', {});
    }
    onChange(updated);

    // update rowErrors
    setrowErrors((prev: any) => {
      if (!prev) return prev;

      const newErrors: Record<number, string> = {};
      Object.keys(prev).forEach((key) => {
        const idx = Number(key);
        if (idx < indexToDelete) {
          newErrors[idx] = prev[idx]; // keep errors before deleted row
        } else if (idx > indexToDelete) {
          newErrors[idx - 1] = prev[idx]; // shift errors after deleted row
        }
      });
      return newErrors;
    });
  };

  // const handleCancel = (indexToUpdate: number) => {
  //   const updated = biomarkers.map((b, i) =>
  //     i === indexToUpdate ? { ...b, status: 'default' } : b,
  //   );
  //   onChange(updated);
  // };
  const dnaOptions = [
    'Moderately Compromised Outcome',
    'Enhanced Outcome',
    'Compromised Outcome',
    'Moderately Enhanced Outcome',
  ];
  const [avalibaleBiomarkers, setAvalibaleBiomarkers] = useState<BiomarkerOption[]>([]);

  useEffect(() => {
    BiomarkersApi.getBiomarkersList()
      .then((res) => {
        const sorted = (Array.isArray(res?.data) ? res.data : [])
          .map((item: any) => ({
            biomarker: String(item?.Biomarker || '').trim(),
            benchmark_area: String(item?.['Benchmark areas'] || '').trim(),
            unit: String(item?.unit || '').trim(),
          }))
          .filter((item: BiomarkerOption) => item.biomarker)
          .sort((a: BiomarkerOption, b: BiomarkerOption) => {
            const areaCompare = (a.benchmark_area || '').localeCompare(
              b.benchmark_area || '',
            );
            return areaCompare !== 0
              ? areaCompare
              : a.biomarker.localeCompare(b.biomarker);
          });
        setAvalibaleBiomarkers(sorted);
      })
      .catch(() => {});
  }, []);

  // ── Suggestions state (keyed by extracted biomarker name) ──────────────────
  const [suggestions, setSuggestions] = useState<
    Record<string, { matches: BiomarkerSuggestion[]; no_match_reason?: string | null }>
  >({});
  const [suggestionsLoading, setSuggestionsLoading] = useState<Record<string, boolean>>(
    {},
  );

  const fetchBiomarkerSuggestions = async (rows: any[]) => {
    const unresolvedRows = rows
      .map((row: any) => ({
        extracted_name: row.original_biomarker_name || row.biomarker || '',
        extracted_value: String(row.original_value || row.value || ''),
        extracted_unit: row.original_unit || row.unit || '',
      }))
      .filter((row: any) => row.extracted_name);

    const uncachedRows = unresolvedRows.filter(
      (row: any) =>
        !suggestions[row.extracted_name] &&
        !suggestionsLoading[row.extracted_name],
    );

    if (uncachedRows.length === 0) return;

    setSuggestionsLoading((prev) => {
      const next = { ...prev };
      uncachedRows.forEach((row: any) => {
        next[row.extracted_name] = true;
      });
      return next;
    });

    try {
      const res = await Application.suggestBiomarkerMappings({
        biomarkers: uncachedRows,
      });
      if (res?.data?.suggestions) {
        setSuggestions((prev) => ({
          ...prev,
          ...res.data.suggestions,
        }));
      }
    } catch {
      // Suggestions are non-critical; silently ignore failures
    } finally {
      setSuggestionsLoading((prev) => {
        const next = { ...prev };
        uncachedRows.forEach((row: any) => {
          delete next[row.extracted_name];
        });
        return next;
      });
    }
  };

  // Reset suggestion cache whenever biomarkers change (new upload)
  useEffect(() => {
    setSuggestions({});
    setSuggestionsLoading({});
  }, [biomarkers.length]);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [createBiomarkerFor, setCreateBiomarkerFor] = useState<{
    biomarkerId: string;
    extractedName: string;
    extractedValue: string;
    extractedUnit: string;
    uploadedReferenceRange: string;
    suggestionMatches: BiomarkerSuggestion[];
  } | null>(null);

  const [createUnitFor, setCreateUnitFor] = useState<{
    biomarkerId: string;
    biomarkerName: string;
    extractedUnit: string;
    extractedValue: string;
    systemUnit: string;
    suggestionMatches: BiomarkerSuggestion[];
  } | null>(null);
  const gutOptions = ['Good for GUT', 'Bad for GUT'];
  const renderValueField = (b: any) => {
    if (fileType.toLowerCase() === 'dna') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={dnaOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else if (fileType.toLowerCase() === 'gut') {
      return (
        <Select
          isSmall
          isSetting
          value={b.original_value}
          options={gutOptions}
          onChange={(val: string) =>
            updateAndStandardize(b.biomarker_id, { original_value: val })
          }
        />
      );
    } else {
      return (
        <input
          type="text"
          value={b.original_value}
          className="text-center border border-Gray-50 w-[70px] md:w-[95px] outline-none rounded-md text-[8px] md:text-[12px] text-Text-Primary px-2 md:py-1"
          onChange={(e) => handleValueChange(b.biomarker_id, e.target.value)}
        />
      );
    }
  };
  React.useEffect(() => {
    const updated = biomarkers.map((b) => {
      if (
        (!b.original_unit || b.original_unit === '') &&
        b.possible_values?.units?.length > 0
      ) {
        return { ...b, original_unit: b.possible_values.units[0] };
      }
      return b;
    });

    // only update if something actually changed
    if (JSON.stringify(updated) !== JSON.stringify(biomarkers)) {
      onChange(updated);
    }
  }, [biomarkers, onChange]);
  const standardizeBiomarkers = async (payload: {
    biomarker: string;
    value: string;
    unit: string;
    bio_type: string;
  }): Promise<
    { success: true; data: any } | { success: false; error: string }
  > => {
    try {
      const res = await Application.standardizeBiomarkers(payload);
      return { success: true, data: res.data };
    } catch (err: any) {
      // Axios interceptor rejects with error.response.data directly, so err is {detail: "..."}
      // Handle multiple possible error structures
      let errorMessage = 'Standardization failed';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      console.error('standardizeBiomarkers error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAndStandardize = async (
    id: string,
    updatedField: Partial<any>,
  ) => {
    // update local state immediately
    let updated = biomarkers.map((b) =>
      b.biomarker_id === id ? { ...b, ...updatedField } : b,
    );

    // Find the index for this biomarker (needed for rowErrors)
    const index = updated.findIndex((b) => b.biomarker_id === id);

    const current = updated.find((b) => b.biomarker_id === id);
    const payload = {
      biomarker: current.biomarker,
      value: current.original_value?.toString() || '',
      unit: current.original_unit || '',
      bio_type: 'more_info',
    };

    const result = await standardizeBiomarkers(payload);

    if (result.success) {
      updated = updated.map((b) =>
        b.biomarker_id === id ? { ...b, ...result.data } : b,
      );
      // Clear error for this specific row only
      if (index !== -1) {
        setrowErrors((prev: any) => {
          if (!prev || !prev[index]) return prev;
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    } else {
      // Set error for this specific row only
      if (index !== -1) {
        setrowErrors((prev: any) => ({
          ...prev,
          [index]: result.error,
        }));
      }
    }

    onChange(updated);
  };
  // const [unitOptions, setUnitOptions] = React.useState<
  //   Record<number, string[]>
  // >({});

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (rowErrors && Object.keys(rowErrors).length > 0) {
      const firstErrorIndex = Math.min(...Object.keys(rowErrors).map(Number));
      const el = rowRefs.current[firstErrorIndex];
      const container = tableRef.current;

      if (el && container) {
        const elTop = el.offsetTop;
        container.scrollTo({
          top: elTop - container.clientHeight / 2, // center it
          behavior: 'smooth',
        });
      }
    }
  }, [rowErrors]);
  useEffect(() => {
    if (deletedIndexRef.current !== null) {
      const index = deletedIndexRef.current;
      deletedIndexRef.current = null; // reset

      // Scroll to the same index or the closest one that still exists
      const targetIndex =
        index < biomarkers.length ? index : biomarkers.length - 1;

      const el = rowRefs.current[targetIndex];
      const container = tableRef.current;

      if (el && container) {
        container.scrollTo({
          top: el.offsetTop - container.clientHeight / 2, // scroll to center that row
          behavior: 'smooth',
        });
      }
    }
  }, [biomarkers]);
  console.log(biomarkers);
  // const handleMappingToggle = async (id: string) => {
  //   const row = biomarkers.filter((b) => b.biomarker_id === id)[0];
  //   const extracted = row.original_biomarker_name;
  //   const system = row.biomarker;

  //   if (!extracted || !system) {
  //     console.warn('Missing biomarker names for mapping');
  //     return;
  //   }

  //   try {
  //     if (mappedRows.includes(id)) {
  //       // 🔴 Remove mapping
  //       await Application.remove_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => prev.filter((i) => i !== id));

  //       // Show red div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'removed' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     } else {
  //       // 🟢 Add mapping
  //       await Application.add_mapping({
  //         extracted_biomarker: extracted,
  //         system_biomarker: system,
  //       });
  //       setMappedRows((prev) => [...prev, id]);

  //       // Show green div for 5 seconds
  //       setMappingStatus((prev) => ({ ...prev, [id]: 'added' }));
  //       setTimeout(() => {
  //         setMappingStatus((prev) => ({ ...prev, [id]: null }));
  //       }, 5000);
  //     }
  //   } catch (err) {
  //     console.error('Mapping toggle failed:', err);
  //   }
  // };
  useEffect(() => {
    const listener = () => {
      // setMappedRows([]);
      // setChangedRows([]);
      // setMappingStatus({});
    };

    subscribe('RESET_MAPPING_ROWS', listener);

    return () => unsubscribe('RESET_MAPPING_ROWS', listener);
  }, []);
  const [run, setRun] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  useEffect(() => {
    if (biomarkers.length > 0) {
      const tutorialSeen = localStorage.getItem('tutorialSeen');
      if (tutorialSeen === 'true') {
        return;
      }
      const hasSeenTour = localStorage.getItem('biomarkersTourSeen');

      if (hasSeenTour === 'true') {
        setShowReminder(true);
      }
    }
  }, [biomarkers.length]);
  useEffect(() => {
    if (biomarkers.length > 0) {
      const showTutorialAgain = localStorage.getItem('showTutorialAgain');
      if (showTutorialAgain === 'true') {
        setTimeout(() => {
          setRun(true);
        }, 3000);
        return;
      }
      const seen = localStorage.getItem('biomarkersTourSeen');
      if (!seen) {
        setTimeout(() => {
          setRun(true);
        }, 3000);
        localStorage.setItem('biomarkersTourSeen', 'true');
      }
    }
  }, [biomarkers.length]);
  const handleViewTutorial = (value: boolean) => {
    if (value) {
      localStorage.setItem('showTutorialAgain', 'true');
    } else {
      localStorage.setItem('showTutorialAgain', 'false');
    }
  };
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('biomarkersTourSeen', 'true');
      setRun(false);
    }
  };
  return (
    <>
      {run && (
        <Joyride
          steps={biomarkersSteps}
          run={run}
          continuous
          scrollToFirstStep
          showSkipButton
          disableOverlayClose
          styles={{
            options: {
              arrowColor: '#fff',
              backgroundColor: '#fff',
              primaryColor: '#0f766e',
              textColor: '#1f2937',
              zIndex: 10000,
            },
            tooltip: {
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            },
          }}
          callback={handleJoyrideCallback}
          locale={{
            last: 'Done',
          }}
        />
      )}
      <TutorialReminderToast
        visible={showReminder}
        onViewTutorial={(value) => {
          handleViewTutorial(value);
          setRun(value);
        }}
        setRun={setRun}
        onClose={() => {
          setShowReminder(false);
          localStorage.setItem('tutorialSeen', 'true');
        }}
      />
      <div
        // style={{ height: window.innerHeight - 400 + 'px' }}
        className={`w-full flex-1 min-h-0 ${uploadedFile ? 'biomarkerTableShowAnimation' : 'biomarkerTableHideAnimation'} rounded-2xl border border-Gray-50 p-2 md:p-4 shadow-300 text-xs text-Text-Primary overflow-hidden`}
        data-tour="biomarkers-section"
      >
        {loading ? (
          <div
            className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] items-center w-full justify-center flex-col text-xs font-medium text-Text-Primary gap-4"
          >
            {/* <Circleloader /> */}
            {/* Progress Bar */}
            <ProgressLoading
              maxProgress={progressBiomarkerUpload}
            ></ProgressLoading>
          </div>
        ) : uploadedFile?.status !== 'completed' || biomarkers.length == 0 ? (
          <div
            className="flex min-h-[240px] h-[clamp(240px,38vh,420px)] items-center justify-center flex-col text-xs font-medium text-Text-Primary"
          >
            <img src="/icons/EmptyState-biomarkers.svg" alt="" />
            <div className="-mt-5">No data provided yet.</div>
          </div>
        ) : (
          <div className="relative h-full min-h-0 flex flex-col">
            <div className="flex flex-wrap gap-2 md:gap-3 justify-between items-center mb-3 shrink-0">
              <div className="text-[10px] md:text-sm font-medium text-Text-Primary">
                Biomarkers{' '}
                <span className="text-[#B0B0B0] text-[10px] md:text-xs font-medium">
                  ({biomarkers.length})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={showOnlyErrors}
                    setChecked={setShowOnlyErrors}
                  />
                  <div className="text-[10px] md:text-xs font-normal text-Text-Primary whitespace-nowrap">
                    Errors only
                  </div>
                </div>
                <div className="flex items-center text-[10px] md:text-xs text-Text-Quadruple whitespace-nowrap">
                  Date of Test:
                  <SimpleDatePicker
                    key={'biomarkerUpload'}
                    textStyle
                    isUploadFile
                    date={dateOfTest}
                    setDate={setDateOfTest}
                    placeholder="Select Date"
                    ClassName="ml-2 border border-Gray-50 !rounded-2xl px-2 py-1 text-Text-Primary"
                  />
                </div>
              </div>
            </div>

            <div
              className="relative w-full text-xs flex-1 min-h-0 border border-Gray-50 rounded-[12px] overflow-hidden"
              data-tour="biomarker-table"
            >
              <div className="w-full h-full hidden-scrollbar overflow-x-auto md:overflow-x-visible">
                <div className="w-full min-w-[760px] h-full flex flex-col min-h-0">
                  {/* Single vertical scroll for header + rows so a scrollbar does not
                      shrink the body grid relative to the header (column misalignment). */}
                  <div
                    ref={tableRef}
                    className="flex-1 min-h-0 overflow-y-auto w-full pb-8 [scrollbar-gutter:stable]"
                  >
                    {/* Table Header */}
                    <div
                      className="grid w-full sticky top-0 z-20 py-2 px-4 font-medium text-Text-Primary text-[8px] md:text-xs bg-[#E9F0F2] border-b rounded-t-[12px] border-Gray-50"
                      style={{
                        gridTemplateColumns:
                          'minmax(220px,1.3fr) minmax(240px,1.4fr) minmax(110px,0.8fr) minmax(130px,0.9fr) 60px',
                      }}
                    >
                      <div className="text-left" data-tour="extracted-biomarker">
                        Extracted Biomarker
                      </div>
                      <div className="text-center" data-tour="system-biomarker">
                        System Biomarker
                      </div>
                      <div className="text-center" data-tour="extracted-value">
                        Extracted Value
                      </div>
                      <div className="text-center" data-tour="extracted-unit">
                        Extracted Unit
                      </div>
                      <div className="text-center" data-tour="delete-biomarker">
                        Action
                      </div>
                    </div>

                    {biomarkers.map((b, index) => {
                      const rowSuggestions =
                        suggestions[b.original_biomarker_name || b.biomarker || ''];
                      const suggestionKey =
                        b.original_biomarker_name || b.biomarker || '';
                      const selectedSystemMeta = avalibaleBiomarkers.find(
                        (option) =>
                          option.biomarker.toLowerCase() ===
                          (b.biomarker || '').toLowerCase(),
                      );
                      return (
                        <BiomarkerRow
                          key={b.biomarker_id}
                          refRenceEl={(el: any) => (rowRefs.current[index] = el)}
                          isHaveError={rowErrors[index]}
                          errorText={rowErrors[index]}
                          biomarker={b}
                          index={index}
                          showOnlyErrors={showOnlyErrors}
                          allAvilableBiomarkers={avalibaleBiomarkers}
                          handleConfirmDelete={() => {
                            handleConfirm(index);
                          }}
                          renderValueField={renderValueField}
                          updateAndStandardize={updateAndStandardize}
                          suggestionMatches={rowSuggestions?.matches || []}
                          isSuggestionsLoading={Boolean(
                            suggestionsLoading[suggestionKey],
                          )}
                          onBiomarkerMenuOpen={() => {
                            fetchBiomarkerSuggestions([b]);
                          }}
                          onCreateNewBiomarker={() => {
                            setCreateBiomarkerFor({
                              biomarkerId: b.biomarker_id,
                              extractedName: b.original_biomarker_name || b.biomarker || '',
                              extractedValue: String(b.original_value || b.value || ''),
                              extractedUnit: b.original_unit || b.unit || '',
                              uploadedReferenceRange:
                                b.uploaded_reference_range ||
                                b.reference_range ||
                                b.reference_interval ||
                                b.lab_ref_range ||
                                '',
                              suggestionMatches: rowSuggestions?.matches || [],
                            });
                          }}
                          onCreateNewUnit={() => {
                            setCreateUnitFor({
                              biomarkerId: b.biomarker_id,
                              biomarkerName: b.biomarker || '',
                              extractedUnit: b.original_unit || '',
                              extractedValue: String(b.original_value || b.value || ''),
                              systemUnit: selectedSystemMeta?.unit || b.unit || '',
                              suggestionMatches: rowSuggestions?.matches || [],
                            });
                          }}
                        />
                      );
                    })}
                    <div className="h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create New Biomarker Modal */}
      {createBiomarkerFor && (
        <CreateBiomarkerModal
          extractedName={createBiomarkerFor.extractedName}
          extractedValue={createBiomarkerFor.extractedValue}
          extractedUnit={createBiomarkerFor.extractedUnit}
          uploadedReferenceRange={createBiomarkerFor.uploadedReferenceRange}
          suggestions={createBiomarkerFor.suggestionMatches}
          onClose={() => setCreateBiomarkerFor(null)}
          onCreated={(newName) => {
            // Refresh the available biomarkers list
            BiomarkersApi.getBiomarkersList()
              .then((res: any) => {
                const sorted = (Array.isArray(res?.data) ? res.data : [])
                  .map((item: any) => ({
                    biomarker: String(item?.Biomarker || '').trim(),
                    benchmark_area: String(item?.['Benchmark areas'] || '').trim(),
                    unit: String(item?.unit || '').trim(),
                  }))
                  .filter((item: BiomarkerOption) => item.biomarker)
                  .sort((a: BiomarkerOption, b: BiomarkerOption) => {
                    const areaCompare = (a.benchmark_area || '').localeCompare(
                      b.benchmark_area || '',
                    );
                    return areaCompare !== 0
                      ? areaCompare
                      : a.biomarker.localeCompare(b.biomarker);
                  });
                setAvalibaleBiomarkers(sorted);
              })
              .catch(() => {});
            // Auto-select the new biomarker on the triggering row
            if (createBiomarkerFor.biomarkerId) {
              updateAndStandardize(createBiomarkerFor.biomarkerId, {
                biomarker: newName,
              });
            }
            setCreateBiomarkerFor(null);
          }}
        />
      )}

      {/* Create New Unit Modal */}
      {createUnitFor && (
        <CreateUnitModal
          biomarkerName={createUnitFor.biomarkerName}
          extractedUnit={createUnitFor.extractedUnit}
          extractedValue={createUnitFor.extractedValue}
          systemUnit={createUnitFor.systemUnit}
          suggestions={createUnitFor.suggestionMatches}
          onClose={() => setCreateUnitFor(null)}
          onCreated={(newUnit) => {
            // Auto-select the new unit on the triggering row
            if (createUnitFor.biomarkerId) {
              updateAndStandardize(createUnitFor.biomarkerId, {
                original_unit: newUnit,
              });
            }
            setCreateUnitFor(null);
          }}
        />
      )}
    </>
  );
};

export default BiomarkersSection;
