/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef, useState, useEffect } from 'react';
import { ButtonSecondary } from '../../Button/ButtosSecondary';
import Application from '../../../api/app';
import { uploadToAzure } from '../../../help';
import { publish, subscribe } from '../../../utils/event';
import Circleloader from '../../CircleLoader';
import UploadPModal from './UploadPModal';

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
  questionnaires: any[];
}

export const UploadTestV2: React.FC<UploadTestProps> = ({
  memberId,
  onGenderate,
  isShare,
  showReport,
  questionnaires,
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
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [isSaveClicked, setisSaveClicked] = useState(false);
  // console.log(extractedBiomarkers);
  const [isUploadFromComboBar, setIsUploadFromComboBar] = useState(false);
  useEffect(() => {
    subscribe('uploadTestShow-stepTwo', () => {
      setstep(1);
      setIsUploadFromComboBar(true);
    });
  }, []);
  useEffect(() => {
    if (!uploadedFile?.file_id) return;

    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const res = await Application.checkLabStepOne({
          file_id: uploadedFile.file_id,
        });

        setfileType(res.data.lab_type);
        setExtractedBiomarkers(res.data.extracted_biomarkers);

        // ✅ stop polling if biomarkers found
        if (
          res.data.extracted_biomarkers &&
          res.data.extracted_biomarkers.length > 0
        ) {
          setPolling(false);
        }
      } catch (err) {
        console.error('Error checking lab step one:', err);
      }
    };

    if (polling) {
      fetchData(); // run immediately first
      intervalId = setInterval(fetchData, 15000); // then every 15s
    }

    return () => {
      if (intervalId) clearInterval(intervalId); // cleanup
    };
  }, [uploadedFile?.file_id, polling]);
  useEffect(() => {
    subscribe('questionaryLength', (value: any) => {
      setQuestionaryLength(value.detail.questionaryLength);
    });
  }, []);

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const handleDeleteFile = () => {
    setdeleteLoading(true);
    Application.deleteLapReport({
      file_id: uploadedFile?.file_id,
      member_id: memberId,
    }) // adjust if backend expects id
      .then(() => {
        setUploadedFile(null);
        setdeleteLoading(false);
      })
      .catch((err) => {
        console.error('Error deleting the file:', err);
      });
  };

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

      const supportedFormats = ['pdf', 'docx'];

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

  const handleConfirm = (index: number) => {
    setAddedBiomarkers(addedBiomarkers.filter((_, i) => i !== index));
    setDeleteIndex(null); // reset after delete
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
      ? modifiedDateOfTest.getTime().toString()
      : null;
    const addedTimestamp = addedDateOfTest
      ? addedDateOfTest.getTime().toString()
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
        file_id: uploadedFile?.file_id,
      },
      added_biomarkers: {
        biomarkers_list: addedBiomarkers,
        date_of_test: addedTimestamp,
        lab_type: 'more_info',
        file_id: uploadedFile?.file_id,
      },
    });
  };
  const onSave = () => {
    setisSaveClicked(true);
    setstep(0);
  };
  console.log(showReport);
  const resolveActiveButtonReportAnalyse = () => {
    if (showReport) {
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
                  style={{ height: window.innerHeight - 60 + 'px' }}
                  className="z-10 relative px-2 flex flex-col items-center justify-center"
                >
                  <div className="text-base font-medium text-Text-Primary">
                    Biomarker Input Complete!
                  </div>
                  {extractedBiomarkers.length + addedBiomarkers.length > 0 && (
                    <div className="w-[144px] mt-2 py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                      <img
                        className="size-4"
                        src="/icons/tick-circle-upload.svg"
                        alt=""
                      />
                      {extractedBiomarkers.length + addedBiomarkers.length}{' '}
                      Biomarker added!
                    </div>
                  )}
                  <div className="text-xs text-Text-Primary w-[570px] text-center mt-2">
                    You’ve completed entering your biomarkers. To save your
                    changes and update your health plan with the new data, click
                    ‘Save Changes’ or ‘Discard Changes’ to cancel.
                  </div>
                  <div className="w-full gap-2 flex justify-center mt-4">
                    <ButtonSecondary
                      onClick={() => {
                        onGenderate('discard');
                      }}
                      style={{ borderRadius: '20px' }}
                      outline
                    >
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
                                res.data.modified_biomarkers_file_id != null
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
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
                          onGenderate(uploadedFile?.file_id);
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
            <div className="w-full rounded-[16px] h-full md:h-[89vh] top-4 flex justify-center absolute left-0 text-Text-Primary">
              <div className="w-full h-full opacity-85 rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
              <div
                style={{ height: window.innerHeight - 60 + 'px' }}
                className="z-10 relative px-2 flex flex-col items-center justify-center"
              >
                <div className="flex flex-col gap-6 w-full">
                  <div className="flex items-center flex-col gap-4">
                    <div className="text-base font-medium text-Text-Primary">
                      Provide Data to Generate Health Plan
                    </div>
                    <div className="text-xs text-Text-Primary text-center">
                      Choose one or both methods below to provide a personalized
                      plan.
                    </div>
                  </div>
                  <div className="flex w-full items-center gap-6">
                    <div
                      onClick={() => {
                        setstep(1);
                      }}
                      className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50"
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

                      <div className="text-[#000000] text-xs font-medium mt-3">
                        Upload Lab Report or Add Biomarkers
                      </div>
                      <img
                        className="mt-3"
                        src="/icons/document-upload-new.svg"
                        alt=""
                      />
                      <div className="text-xs mt-3">
                        Upload your client's lab test file and edit or add
                        biomarkers manually.
                      </div>
                      <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
                        Enter or Upload Biomarkers
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        publish('QuestionaryTrackingCall', {});
                      }}
                      className="w-[477px] cursor-pointer h-[269px] rounded-2xl border p-6 flex flex-col items-center gap-[12px] relative bg-white shadow-100 border-Gray-50"
                    >
                      {questionnaires.length > 0 && (
                        <div className="w-[167px] py-1 h-[20px] text-[10px] text-Primary-DeepTeal px-2.5 rounded-full bg-[#E5E5E5] flex items-center gap-1">
                          <img
                            className="size-4"
                            src="/icons/tick-circle-upload.svg"
                            alt=""
                          />
                          <span className=""> {questionnaires.length}</span>
                          Questionnaire filled out!
                        </div>
                      )}                      
                      <div className="text-[#000000] text-xs font-medium mt-3">
                        Fill Health Questionnaire
                      </div>
                      <img
                        className="mt-5"
                        src="/icons/task-square-new.svg"
                        alt=""
                      />
                      <div className="text-xs mt-3">
                        Provide data (lifestyle, medical history, ...) for a
                        more accurate plan.
                      </div>
                      <div className="text-xs font-medium underline text-Primary-DeepTeal cursor-pointer absolute bottom-6">
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
                                res.data.modified_biomarkers_file_id != null
                              ) {
                                onGenderate(
                                  res.data.modified_biomarkers_file_id,
                                );
                              } else if (
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
                          onGenderate(uploadedFile?.file_id);
                        } else {
                          onGenderate(undefined);
                        }
                      }}
                    >
                      <img src="/icons/tick-square.svg" alt="" />
                      Develop Health Plan
                    </ButtonSecondary>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <UploadPModal
          OnBack={() => setstep(0)}
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
        />
      )}
    </>
  );
};

export default UploadTestV2;
