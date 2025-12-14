/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from 'react';
import Application from '../../../api/app';
import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Circleloader from '../../CircleLoader';
import UploadPModal from './UploadPModal';
// import SpinnerLoader from '../../SpinnerLoader';

// interface FileUpload {
//   file: File;
//   file_id: string;
//   progress: number;
//   status: 'uploading' | 'completed' | 'error';
//   azureUrl?: string;
//   uploadedSize?: number;
//   errorMessage?: string;
//   warning?: boolean;
//   showReport?: boolean;
// }

interface UploadTestProps {
  memberId: any;
  onGenderate: (file_id: string | undefined) => void;
  isShare?: boolean;
  showReport: boolean;
  onDiscard: () => void;
  questionnaires: any[];
  has_wearable_data: boolean;
  isLoadingQuestionnaires: boolean;
}

export const UploadTestV2: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
  showReport,
  onDiscard,
  questionnaires,
  has_wearable_data,
  isLoadingQuestionnaires,
}) => {
  const fileInputRef = useRef<any>(null);
  const [step, setstep] = useState(0);
  // const [activeMenu, setactiveMenu] = useState('Upload File');
  const [uploadedFile, setUploadedFile] = useState<FileUpload | null>(null); // ✅ single file
  const [errorMessage] = useState<string>('');
  const [, setQuestionaryLength] = useState(false);

  const [extractedBiomarkers, setExtractedBiomarkers] = useState<any[]>([]);
  const [fileType, setfileType] = useState('more_info');
  const [polling, setPolling] = useState(true); // ✅ control polling
  const [deleteLoading] = useState(false);
  const [isSaveClicked, setisSaveClicked] = useState(false);
  console.log(uploadedFile);
  // console.log(extractedBiomarkers);
  const [isUploadFromComboBar, setIsUploadFromComboBar] = useState(false);
  useEffect(() => {
    subscribe('uploadTestShow-stepTwo', () => {
      setstep(1);
      setIsUploadFromComboBar(true);
    });
  }, []);
  const [biomarkerLoading, setbiomarkerLoading] = useState(false);
  useEffect(() => {
    if (!uploadedFile?.file_id) return;

    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      setbiomarkerLoading(true);
      try {
        const res = await Application.checkLabStepOne({
          file_id: uploadedFile.file_id,
        });

        setfileType(res.data.lab_type);
        const sorted = (res.data.extracted_biomarkers || [])
          .slice()
          .sort((a: any, b: any) => {
            const nameA = (
              a.original_biomarker_name ||
              a.biomarker ||
              ''
            ).toString();
            const nameB = (
              b.original_biomarker_name ||
              b.biomarker ||
              ''
            ).toString();
            return nameA.localeCompare(nameB, undefined, {
              sensitivity: 'base',
            });
          });

        setExtractedBiomarkers(sorted);

        // ✅ stop polling if biomarkers found
        if (
          res.data.extracted_biomarkers &&
          res.data.extracted_biomarkers.length > 0
        ) {
          setPolling(false);
          setbiomarkerLoading(false);
        }
      } catch (err) {
        console.error('Error checking lab step one:', err);
      }
    };

    if (polling) {
      fetchData(); // run immediately first
      intervalId = setInterval(fetchData, 5000); // then every 15s
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // cleanup
    };
  }, [uploadedFile, polling]);
  useEffect(() => {
    subscribe('questionaryLength', (value: any) => {
      setQuestionaryLength(value.detail.questionaryLength);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const [, forceReRender] = useState(0);

  const handleDeleteFile = (fileId?: string) => {
    setExtractedBiomarkers([]);
    console.log(fileId);
    setfileType('more_info');
    setPolling(true);
    setUploadedFile(null);
    setRowErrors({});
    setAddedRowErrors({});
    publish('RESET_MAPPING_ROWS', {});
    setbiomarkerLoading(false);
    setModifiedDateOfTest(new Date());
    forceReRender((x) => x + 1);
    Application.deleteFileHistory({
      file_id: fileId,
      member_id: memberId,
    }).catch(() => {});
  };
  useEffect(() => {
    subscribe('DELETE_FILE_TRIGGER', () => {
      // alert('delete file trigger');
      handleDeleteFile();
    });
  }, []);

  console.log(uploadedFile);

  const sendToBackend = async (file: File, azureUrl: string) => {
    await Application.addLabReport(
      {
        member_id: memberId,
        report: {
          'file name': file.name,
          blob_url: azureUrl,
        },
      },
      (progressEvent: any) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        const backendProgress = 50 + percentCompleted / 2;

        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                progress: backendProgress,
                uploadedSize: progressEvent.loaded,
              }
            : prev,
        );
      },
    )
      .then((res) => {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'completed',
                file_id: res.data.file_id,
                azureUrl,
                warning: res.status == 206,
              }
            : prev,
        );
      })
      .catch((err) => {
        if (err == 'Network Error') {
          setUploadedFile((prev) =>
            prev ? { ...prev, status: 'completed' } : prev,
          );
        } else {
          setUploadedFile((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'error',
                  errorMessage:
                    err?.response?.data?.message ||
                    err?.detail ||
                    'Failed to upload file. Please try again.',
                }
              : prev,
          );
        }
      });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      const supportedFormats = ['pdf', 'docx', 'doc'];

      if (!fileExtension || !supportedFormats.includes(fileExtension)) {
        // Validation failed: set error state without calling API
        const newFile: FileUpload = {
          file_id: '',
          file,
          progress: 0,
          status: 'error',
          errorMessage: 'File has an unsupported format.',
        };
        setUploadedFile(newFile);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return; // Stop execution here
      }

      // Validation passed: proceed with upload
      const newFile: FileUpload = {
        file_id: '',
        file,
        progress: 0.5,
        status: 'uploading',
        uploadedSize: 0,
      };

      setUploadedFile(newFile);

      try {
        // Step 1: Upload to Azure
        const azureUrl = await uploadToAzure(file, (progress) => {
          const uploadedBytes = Math.floor((progress / 100) * file.size);
          setUploadedFile((prev) =>
            prev
              ? { ...prev, progress: progress / 2, uploadedSize: uploadedBytes }
              : prev,
          );
        });

        // Step 2: Send to backend
        await sendToBackend(file, azureUrl);
      } catch (error: any) {
        setUploadedFile((prev) =>
          prev
            ? {
                ...prev,
                status: 'error',
                errorMessage:
                  error?.response?.data?.message ||
                  error?.message ||
                  'Failed to upload file. Please try again.',
              }
            : prev,
        );
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [addedBiomarkers, setAddedBiomarkers] = useState<
    { biomarker: string; value: string; unit: string }[]
  >([]);

  // State and handlers for adding/deleting biomarkers
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleAddBiomarker = (newBiomarker: {
    biomarker: string;
    value: string;
    unit: string;
  }) => {
    setAddedBiomarkers([...addedBiomarkers, newBiomarker]);
  };

  const handleTrashClick = (index: number) => {
    setDeleteIndex(index);
  };

  const handleConfirm = (indexToDelete: number) => {
    // 1. Update added biomarkers
    setAddedBiomarkers((prev) => prev.filter((_, i) => i !== indexToDelete));

    // 2. Update added row errors (delete + shift)
    setAddedRowErrors((prev) => {
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

    // 3. Reset delete index
    setDeleteIndex(null);
  };

  const handleCancel = () => {
    setDeleteIndex(null);
  };

  const [modifiedDateOfTest, setModifiedDateOfTest] = useState<Date | null>(
    new Date(),
  );
  const handleModifiedDateOfTestChange = (date: Date | null) => {
    setModifiedDateOfTest(date);
  };

  // Date for the manually added biomarkers
  const [addedDateOfTest, setAddedDateOfTest] = useState<Date | null>(
    new Date(),
  );
  const handleAddedDateOfTestChange = (date: Date | null) => {
    setAddedDateOfTest(date);
  };

  const handleSaveLabReport = () => {
    const modifiedTimestamp = modifiedDateOfTest
      ? Date.UTC(
          modifiedDateOfTest.getFullYear(),
          modifiedDateOfTest.getMonth(),
          modifiedDateOfTest.getDate(),
        ).toString()
      : null;
    const addedTimestamp = addedDateOfTest
      ? Date.UTC(
          addedDateOfTest.getFullYear(),
          addedDateOfTest.getMonth(),
          addedDateOfTest.getDate(),
        ).toString()
      : null;

    // Map over all extractedBiomarkers to create the required API structure
    const mappedExtractedBiomarkers = extractedBiomarkers.map((b) => ({
      biomarker_id: b.biomarker_id,
      biomarker: b.biomarker,
      value: b.original_value,
      unit: b.original_unit,
    }));

    return Application.SaveLabReport({
      member_id: memberId,
      modified_biomarkers: {
        biomarkers_list: mappedExtractedBiomarkers, // Send the full, mapped list
        date_of_test: modifiedTimestamp,
        lab_type: fileType,
        file_id: uploadedFile?.file_id || '',
      },
      added_biomarkers: {
        biomarkers_list: addedBiomarkers,
        date_of_test: addedTimestamp,
        lab_type: 'more_info',
        // file_id: uploadedFile?.file_id || '',
      },
    });
  };
  const [rowErrors, setRowErrors] = React.useState<Record<number, string>>({});
  const [addedrowErrors, setAddedRowErrors] = React.useState<
    Record<number, string>
  >({});
  const [btnLoading, setBtnLoading] = useState(false);
  const onSave = () => {
    setBtnLoading(true);
    const modifiedTimestamp = modifiedDateOfTest
      ? Date.UTC(
          modifiedDateOfTest.getFullYear(),
          modifiedDateOfTest.getMonth(),
          modifiedDateOfTest.getDate(),
        ).toString()
      : null;
    const addedTimestamp = addedDateOfTest
      ? Date.UTC(
          addedDateOfTest.getFullYear(),
          addedDateOfTest.getMonth(),
          addedDateOfTest.getDate(),
        ).toString()
      : null;
    const mappedExtractedBiomarkers = extractedBiomarkers.map((b) => ({
      biomarker_id: b.biomarker_id,
      biomarker: b.biomarker,
      value: b.original_value,
      unit: b.original_unit,
    }));

    Application.validateBiomarkers({
      modified_biomarkers_list: mappedExtractedBiomarkers,
      added_biomarkers_list: addedBiomarkers,
      modified_biomarkers_date_of_test: modifiedTimestamp,
      added_biomarkers_date_of_test: addedTimestamp,
      modified_lab_type: fileType,
      modified_file_id: uploadedFile?.file_id ?? '',
      member_id: memberId,
    })
      .then(() => {
        // 200 response
        setisSaveClicked(true);
        setstep(0);
        setRowErrors({});
        setAddedRowErrors({});
      })
      .catch((err: any) => {
        console.log(err);

        const detail = err.detail;

        if (detail) {
          let parsedDetail: any = {};

          if (typeof detail === 'string') {
            try {
              parsedDetail = JSON.parse(detail);
            } catch (e) {
              console.error('Failed to parse error detail:', detail, e);
              parsedDetail = {};
            }
          } else {
            parsedDetail = detail; // already an object
          }

          const modifiedErrors: Record<number, string> = {};
          const addedErrors: Record<number, string> = {};

          parsedDetail.modified_biomarkers_list?.forEach((item: any) => {
            modifiedErrors[item.index] = item.detail;
          });

          parsedDetail.added_biomarkers_list?.forEach((item: any) => {
            addedErrors[item.index] = item.detail;
          });

          setRowErrors(modifiedErrors);
          setAddedRowErrors(addedErrors);

          console.log('🔎 modifiedErrors:', modifiedErrors);
          console.log('🔎 addedErrors:', addedErrors);
        } else {
          console.error('API error:', err);
        }
      })
      .finally(() => {
        setBtnLoading(false);
      });
  };

  console.log(rowErrors);

  const resolveActiveButtonReportAnalyse = () => {
    if (showReport) {
      return true;
    }
    if (has_wearable_data) {
      return true;
    }
    if (uploadedFile != null) {
      return true;
    }
    if (
      extractedBiomarkers.length + addedBiomarkers.length > 0 &&
      isSaveClicked
    ) {
      return true;
    }
    if (questionnaires.length > 0) {
      return true;
    }
    return false;
  };

  return (
    <>
      {deleteLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      {step === 0 ? (
        <>
          {isUploadFromComboBar ? (
            <>
              <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
                <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
                <div
                  // style={{ height: window.innerHeight - 60 + 'px' }}
                  className="z-10 relative px-2 h-[65vh] flex flex-col items-center justify-center"
                >
                  <div className="text-base font-medium text-Text-Primary">
                    Biomarker Input Complete!
                  </div>
                  {extractedBiomarkers.length + addedBiomarkers.length > 0 && (
                    <div className="w-[144px] mt-4  py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                      <img
                        className="size-4"
                        src="/icons/tick-circle-upload.svg"
                        alt=""
                      />
                      {extractedBiomarkers.length + addedBiomarkers.length}{' '}
                      Biomarker added!
                    </div>
                  )}
                  <div className="text-xs mt-4 text-Text-Primary w-[570px] text-center ">
                    You’ve completed entering your biomarkers. To save your
                    changes and update your health plan with the new data, click
                    ‘Save Changes’ or ‘Discard Changes’ to cancel.
                  </div>
                  <div className="w-full gap-2 flex justify-center mt-[46px] ">
                    <ButtonSecondary
                      onClick={() => {
                        onGenderate('discard');
                      }}
                      style={{ borderRadius: '20px' }}
                      outline
                    >
                      <img src="/icons/close-square-green.svg" alt="" />
                      Discard Changes
                    </ButtonSecondary>
                    <ButtonSecondary
                      style={{
                        // width: '150px',
                        borderRadius: '20px',
                      }}
                      disabled={!resolveActiveButtonReportAnalyse()}
                      onClick={() => {
                        if (
                          uploadedFile != null ||
                          addedBiomarkers.length != 0
                        ) {
                          handleSaveLabReport()
                            .then((res) => {
                              if (
                                res.data.modified_biomarkers_file_id != null &&
                                res.data.modified_biomarkers_file_id != ''
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
                                res.data.added_biomarkers_file_id != null &&
                                res.data.added_biomarkers_file_id != ''
                              ) {
                                onGenderate(res.data.added_biomarkers_file_id);
                              } else {
                                onGenderate(undefined);
                              }
                              console.log(res);
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                          onGenderate('customBiomarker');
                        } else {
                          onGenderate(undefined);
                        }
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Save Changes
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full rounded-[16px]  md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
              <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
              <div
                style={{ height: window.innerHeight - 60 + 'px' }}
                className="z-10 relative px-2 flex flex-col items-center justify-center"
              >
                <div className="flex flex-col gap-6 w-full">
                  <div className="flex items-center flex-col gap-4">
                    <div
                      style={{ textAlignLast: 'center' }}
                      className=" text-center text-base font-medium text-Text-Primary"
                    >
                      Provide Data to Generate Health Plan
                    </div>
                    <div className="text-xs text-Text-Primary text-center">
                      Choose one methods below to provide a personalized plan.
                    </div>
                  </div>
                  <div className="flex  w-full items-center gap-2 xs:gap-6">
                    <div
                      onClick={() => {
                        setstep(1);
                      }}
                      className={`cursor-pointer w-full md:w-[477px]  h-[269px] rounded-2xl border p-3 md:p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50`}
                    >
                      {isSaveClicked &&
                        extractedBiomarkers.length + addedBiomarkers.length >
                          0 && (
                          <div className="w-[144px] py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                            <img
                              className="size-4"
                              src="/icons/tick-circle-upload.svg"
                              alt=""
                            />
                            {extractedBiomarkers.length +
                              addedBiomarkers.length}{' '}
                            Biomarker added!
                          </div>
                        )}

                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[#000000] text-[10px] md:text-xs font-medium mt-3"
                      >
                        Upload Lab Report or Add Biomarkers
                      </div>
                      <img
                        className="mt-3 size-10 xs:size-[57px]"
                        src="/icons/document-upload-new.svg"
                        alt=""
                      />
                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[10px] md:text-xs mt-3 text-justify"
                      >
                        Upload your client's lab test file and edit or add
                        biomarkers manually.
                      </div>
                      <div className=" text-[8px]  xs:text-[10px]  md:text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                        Enter or Upload Biomarkers
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        // if (
                        //   extractedBiomarkers.length + addedBiomarkers.length >
                        //   0
                        // ) {
                        //   return;
                        // } else {
                        publish('QuestionaryTrackingCall', {});
                        // }
                      }}
                      className={`cursor-pointer w-full md:w-[477px]  h-[269px] rounded-2xl border p-3 md:p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50`}
                    >
                      {questionnaires.length > 0 && (
                        <div className="w-[167px] py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                          <img
                            className="size-4"
                            src="/icons/tick-circle-upload.svg"
                            alt=""
                          />
                          <span className="">
                            {' '}
                            {isLoadingQuestionnaires
                              ? '...'
                              : questionnaires.length}
                          </span>
                          Questionnaire filled out!
                        </div>
                      )}
                      <div className="text-[#000000] text-center text-[10px] md:text-xs font-medium mt-3">
                        Fill Health Questionnaire
                      </div>
                      <img
                        className=" mt-3 xs:mt-5 size-[37px] xs:size-[49px]"
                        src="/icons/task-square-new.svg"
                        alt=""
                      />
                      <div
                        style={{ textAlignLast: 'center' }}
                        className="text-[10px] md:text-xs mt-3 text-justify"
                      >
                        Provide data (lifestyle, medical history, ...) for a
                        more accurate plan.
                      </div>
                      <div className="text-[8px]  xs:text-[10px]  md:text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                        Fill Questionnaire
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-center mt-4">
                    <ButtonSecondary
                      style={{
                        width: '250px',
                        borderRadius: '20px',
                      }}
                      disabled={!resolveActiveButtonReportAnalyse()}
                      onClick={() => {
                        if (
                          uploadedFile != null ||
                          addedBiomarkers.length != 0
                        ) {
                          handleSaveLabReport()
                            .then((res) => {
                              if (
                                res.data.modified_biomarkers_file_id != null &&
                                res.data.modified_biomarkers_file_id != ''
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
                                res.data.added_biomarkers_file_id != null &&
                                res.data.added_biomarkers_file_id != null
                              ) {
                                onGenderate(res.data.added_biomarkers_file_id);
                              } else {
                                onGenderate(undefined);
                              }
                              console.log(res);
                            })
                            .catch((err) => {
                              console.log(err);
                            });
                          onGenderate('customBiomarker');
                        } else {
                          onGenderate(undefined);
                        }
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Save & Continue to Health Plan
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <UploadPModal
          rowErrors={rowErrors}
          setrowErrors={setRowErrors}
          AddedRowErrors={addedrowErrors}
          OnBack={() => {
            if (isUploadFromComboBar) {
              onDiscard();
            }
            setstep(0);
            setUploadedFile(null);
            setModifiedDateOfTest(new Date());
            setAddedDateOfTest(new Date());
            setPolling(true);
            setbiomarkerLoading(false);
            setExtractedBiomarkers([]);
            setAddedBiomarkers([]);
            setRowErrors([]);
          }}
          loading={biomarkerLoading}
          btnLoading={btnLoading}
          fileType={fileType}
          uploadedFile={uploadedFile}
          onSave={onSave}
          isShare={isShare || false}
          errorMessage={errorMessage}
          handleFileChange={handleFileChange}
          handleDeleteFile={handleDeleteFile}
          formatFileSize={formatFileSize}
          fileInputRef={fileInputRef}
          modifiedDateOfTest={modifiedDateOfTest || new Date()}
          handleModifiedDateOfTestChange={handleModifiedDateOfTestChange}
          extractedBiomarkers={extractedBiomarkers}
          setExtractedBiomarkers={setExtractedBiomarkers}
          addedBiomarkers={addedBiomarkers}
          handleAddBiomarker={handleAddBiomarker}
          handleTrashClick={handleTrashClick}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
          deleteIndex={deleteIndex}
          addedDateOfTest={addedDateOfTest}
          handleAddedDateOfTestChange={handleAddedDateOfTestChange}
          onClose={() => {
            setUploadedFile(null);
          }}
        />
      )}
    </>
  );
};

export default UploadTestV2;
