/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useRef, useState } from 'react';
import { MainModal } from '../../Components';
import Application from '../../api/app';
import { toast } from 'react-toastify';
import SpinnerLoader from '../../Components/SpinnerLoader';
import { uploadToAzure } from '../../help';
import TextField from '../../Components/TextField';

interface AddNewDocumentProps {
  AddFileModal: boolean;
  handleGraphData: (value: any) => void;
  handleActiveFilters: (value: string[]) => void;
  handleAddFileModal: (value: boolean) => void;
}

const AddNewDocument: FC<AddNewDocumentProps> = ({
  AddFileModal,
  handleGraphData,
  handleActiveFilters,
  handleAddFileModal,
}) => {
  const formatFileSize = (size: number): string => {
    if (size === 0) return '0 B';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizeInUnits = (size / Math.pow(1024, i)).toFixed(2);
    return `${sizeInUnits} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
  };
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [stepAddDocument, setStepAddDocument] = useState(1);
  const [loadingButton, setLoadingButton] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<null | string>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadComplete, setUploadComplete] = useState<{
    [key: string]: boolean;
  }>({});
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentIndexEditSelect, setCurrentIndexEditSelect] = useState<
    null | number
  >(null);
  const [currentIndexDeleteSelect, setCurrentIndexDeleteSelect] = useState<
    null | number
  >(null);
  const [fileTitles, setFileTitles] = useState<{ [fileName: string]: string }>(
    {},
  );
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);

      const newTitles: { [key: string]: string } = {};
      newFiles.forEach((file) => {
        newTitles[file.name] = file.name;
      });

      setFileTitles((prev) => ({ ...prev, ...newTitles }));

      // Initialize progress and complete state for new files
      // newFiles.forEach((file) => {
      //   setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      //   setUploadComplete((prev) => ({ ...prev, [file.name]: false }));
      //   simulateUploadProgress(file.name);
      // });
    }
  };
  const handleDelete = (fileId: string, entity: string) => {
    setDocumentsData((prev) =>
      prev.map((doc) =>
        doc.file_id === fileId
          ? {
              ...doc,
              modal_data: doc.modal_data.filter(
                (item: any) => item.entity !== entity,
              ),
            }
          : doc,
      ),
    );
  };
  const [loadingCancelUpload, setLoadingCancelUpload] = useState(false);
  const handleCancelUpload = (fileName: string) => {
    setLoadingCancelUpload(true);
    setCurrentIndexDeleteSelect(null);
    setTimeout(() => {
      setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileName];
        return newProgress;
      });
      setUploadComplete((prev) => {
        const newComplete = { ...prev };
        delete newComplete[fileName];
        return newComplete;
      });
      setLoadingCancelUpload(false);
      setLoadingButton(false);
    }, 2000);
  };
  const [loadingRename, setLoadingRename] = useState(false);
  const confirmRename = (originalName: string, newName: string) => {
    setLoadingRename(true);
    setFileTitles((prev) => {
      const updated = { ...prev };
      updated[newName] = newName;
      delete updated[originalName];
      return updated;
    });

    setSelectedFiles((prev) =>
      prev.map((file) => {
        if (file.name === originalName) {
          const renamedFile = new File([file], newName, { type: file.type });
          return renamedFile;
        }
        return file;
      }),
    );
    setCurrentIndexEditSelect(null);
    setTimeout(() => {
      setLoadingRename(false);
    }, 2000);
  };
  const handleAddFile = async () => {
    if (selectedFiles.length === 0) return;
    setLoadingButton(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        setUploadComplete((prev) => ({ ...prev, [file.name]: false }));

        const url = await uploadToAzure(file, (progress) => {
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        });

        uploadedUrls.push(url);
        setUploadComplete((prev) => ({ ...prev, [file.name]: true }));
      }

      await Application.getDocumentKnowledge({
        files: uploadedUrls.map((url, index) => ({
          content: url,
          filename: fileTitle || selectedFiles[index].name,
          fast_mode: true,
        })),
      })
        .then((res) => {
          setDocumentsData(res.data.results);
          setOptions(
            res.data.results.map((item: any) => ({
              label: item.filename,
              value: item.file_id,
            })),
          );
          setSelected(
            res.data.results.length ? res.data.results[0].file_id : null,
          );
          setStepAddDocument(2);
          setSelectedFiles([]);
          setUploadProgress({});
          setUploadComplete({});
        })
        .catch((err) => {
          setLoadingButton(false);
          toast.error(err.detail);
        });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoadingButton(false);
    }
  };
  const handleAddToDatabase = async () => {
    if (documentsData.length === 0) return;
    setLoadingButton(true);
    try {
      await Application.addToDatabaseDocumentKnowledge({
        items: documentsData,
      }).then((res) => {
        if (res.data.nodes) {
          handleGraphData(res.data);
          handleActiveFilters([
            ...new Set(res.data?.nodes.map((e: any) => e.category2)),
          ] as Array<string>);
        }
        closeModal();
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoadingButton(false);
    }
  };

  const closeModal = () => {
    handleAddFileModal(false);
    setSelectedFiles([]);
    setLoadingButton(false);
    setUploadProgress({});
    setUploadComplete({});
    setStepAddDocument(1);
    setFileTitle('');
    setLoadingButton(false);
  };
  return (
    <MainModal isOpen={AddFileModal} onClose={closeModal}>
      <div
        className={`${stepAddDocument === 1 ? 'w-[500px]' : 'w-[932px]'} bg-white min-h-[316px] rounded-2xl shadow-800 p-4 text-xs text-Text-Primary`}
      >
        <div className="border-b border-Gray-50 pb-2 text-sm font-medium">
          {stepAddDocument === 1
            ? 'Add New Document'
            : 'Review Extracted Nodes'}
        </div>
        {stepAddDocument === 1 ? (
          <>
            <div className="text-Text-Primary font-medium text-xs mt-6 mb-2">
              Upload Document
            </div>
            <label className="w-full h-[154px] rounded-2xl border border-Gray-50 bg-white shadow-100 flex flex-col items-center justify-center gap-2 p-6 cursor-pointer">
              <input
                multiple
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                id="file-upload"
                onChange={handleFileUpload}
              />
              <img src="/icons/upload-test.svg" alt="" />
              <div className="text-xs text-Text-Primary text-center mt-1">
                Drag and drop or click to upload.
              </div>
              <div className="text-Text-Quadruple text-xs">
                Accepted formats:{' '}
                <span className="font-medium">.pdf, .docx.</span>
              </div>
            </label>
            <div className="overflow-auto max-h-[210px] mt-2 mb-4">
              {selectedFiles.map((file, index) => {
                return (
                  <div key={index}>
                    {uploadProgress[file.name] > 0 &&
                    uploadProgress[file.name] < 100 ? (
                      <div className="w-full relative px-4 py-2 h-[68px] bg-white shadow-200 rounded-[16px] mb-2">
                        <div className="w-full flex justify-between">
                          <div>
                            <div className="text-[10px] md:text-[12px] text-Text-Primary font-[600]">
                              Uploading {file.name}...
                            </div>
                            <div className="text-Text-Secondary text-[10px] md:text-[12px] mt-1">
                              {uploadProgress[file.name]}% • 30 seconds
                              remaining
                            </div>
                          </div>
                          <img
                            onClick={() => handleCancelUpload(file.name)}
                            className="cursor-pointer"
                            src="/icons/close.svg"
                            alt=""
                          />
                        </div>
                        <div className="w-full h-[8px] rounded-[12px] bg-gray-200 mt-1 flex justify-start items-center">
                          <div
                            className="bg-Primary-DeepTeal h-[5px] rounded-[12px]"
                            style={{
                              width: uploadProgress[file.name] + '%',
                            }}
                          ></div>
                        </div>
                      </div>
                    ) : uploadComplete[file.name] ? (
                      <div className="flex items-center justify-between bg-white drop-shadow-sm rounded-[12px] px-4 py-2 border border-Gray-50 mb-2">
                        <div className="flex items-center gap-4">
                          <img
                            src="/icons/PDF_file_icon.svg 1.svg"
                            alt="PDF Icon"
                          />
                          <div className="flex flex-col">
                            <span className="text-xs">{file.name}</span>
                            <span className="text-xs text-[#888888]">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                        <img
                          onClick={() => handleCancelUpload(file.name)}
                          className="cursor-pointer w-6 h-6"
                          src="/icons/trash-blue.svg"
                          alt="Delete Icon"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between bg-white drop-shadow-sm rounded-[12px] px-4 py-2 border border-Gray-50 mb-2">
                          <div className="flex items-center gap-4">
                            <img
                              src="/icons/PDF_file_icon.svg 1.svg"
                              alt="PDF Icon"
                            />
                            <div className="flex flex-col gap-1">
                              {currentIndexEditSelect === index ? (
                                <TextField  newStyle  type="text"
                                value={fileTitles[file.name] || file.name}
                                onChange={(e) => {
                                  setFileTitles((prev) => ({
                                    ...prev,
                                    [file.name]: e.target.value,
                                  }));
                                }} />
                                // <input
                                //   type="text"
                                //   value={fileTitles[file.name] || file.name}
                                //   onChange={(e) => {
                                //     setFileTitles((prev) => ({
                                //       ...prev,
                                //       [file.name]: e.target.value,
                                //     }));
                                //   }}
                                //   className="text-xs"
                                // />
                              ) : (
                                <span className="text-xs">
                                  {fileTitles[file.name] || file.name}
                                </span>
                              )}
                              <span className="text-xs text-[#888888]">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentIndexEditSelect === index ||
                            currentIndexDeleteSelect === index ? (
                              <>
                                <img
                                  onClick={() => {
                                    setCurrentIndexEditSelect(null);
                                    setCurrentIndexDeleteSelect(null);
                                  }}
                                  className="cursor-pointer w-6 h-6"
                                  src="/icons/close-square.svg"
                                />
                                <img
                                  onClick={() => {
                                    if (currentIndexEditSelect === index) {
                                      confirmRename(
                                        file.name,
                                        fileTitles[file.name] || file.name,
                                      );
                                    }
                                    if (currentIndexDeleteSelect === index) {
                                      handleCancelUpload(file.name);
                                    }
                                  }}
                                  className="cursor-pointer w-6 h-6"
                                  src="/icons/tick-square-background-green.svg"
                                />
                              </>
                            ) : (
                              <>
                                {loadingRename || loadingCancelUpload  ? (
                                  <SpinnerLoader color="#005F73" />
                                ) : (
                                  <><img
                                  onClick={() => {
                                    setCurrentIndexEditSelect(index);
                                  }}
                                  className="cursor-pointer w-6 h-6"
                                  src="/icons/edit-blue.svg"
                                  alt="Edit Icon"
                                />
                                <img
                                    onClick={() => {
                                      setCurrentIndexDeleteSelect(index);
                                    }}
                                    className="cursor-pointer w-6 h-6"
                                    src="/icons/trash-blue.svg"
                                    alt="Delete Icon"
                                  />
                                </>
                                  
                                )}
                               
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full flex items-center justify-end gap-3 text-sm font-medium">
              <div
                onClick={closeModal}
                className="text-[#909090] cursor-pointer"
              >
                Cancel
              </div>
              <div
                onClick={loadingButton ? () => {} : handleAddFile}
                className="text-Primary-DeepTeal cursor-pointer"
              >
                {loadingButton ? <SpinnerLoader color="#005F73" /> : 'Next'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 text-xs text-Text-Primary">
              Here are the nodes extracted from your documents. You can remove
              any nodes you don't want to include in your knowledge graph.
            </div>
            <div className="text-Text-Primary text-xs font-medium mt-4">
              Select Document
            </div>
            <div
              className="relative inline-block w-[292px] font-normal mt-2"
              ref={wrapperRef}
            >
              <div
                className="cursor-pointer bg-backgroundColor-Card border py-2 px-4 pr-3 rounded-2xl leading-tight text-[10px] text-Text-Primary flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
              >
                {options.find((opt) => opt.value === selected)?.label}
                <img
                  className={`w-3 h-3 object-contain opacity-80 ml-2 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  src="/icons/arow-down-drop.svg"
                  alt=""
                />
              </div>

              {isOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-100 rounded-2xl shadow-sm text-[10px] text-Text-Primary">
                  {options.map((opt) => (
                    <li
                      key={opt.value}
                      className={`cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-2xl ${
                        selected === opt.value ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setSelected(opt.value);
                        setIsOpen(false);
                      }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto mt-4">
              <table className="w-full rounded-xl">
                <thead>
                  <tr className="text-[10px] text-Text-Primary bg-bg-color rounded-t-xl">
                    <th className="rounded-tl-xl py-2 pl-2 text-nowrap">No</th>
                    <th className="text-nowrap">Node Title</th>
                    <th className="text-nowrap">Sentence</th>
                    <th className="text-nowrap">File Name</th>
                    <th className="text-nowrap">Date of Upload</th>
                    <th className="rounded-tr-xl py-2 pr-2 text-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="border border-bg-color rounded-b-xl">
                  {documentsData
                    .find((item) => item.file_id === selected)
                    ?.modal_data.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className={`leading-5 ${
                          index % 2 === 0
                            ? 'bg-white'
                            : 'bg-backgroundColor-Main'
                        }`}
                      >
                        <td className="py-6 max-w-6 text-center text-[10px] text-Text-Primary">
                          {index + 1}
                        </td>
                        <td className="max-w-8 text-center text-[10px] text-Text-Quadruple">
                          {item.entity}
                        </td>
                        <td className="max-w-48 text-center text-[10px] text-Text-Quadruple">
                          {item.sentence}
                        </td>
                        <td className="max-w-24 text-center text-[10px] text-Text-Quadruple">
                          {item.filename}
                        </td>
                        <td className="max-w-10 text-center text-[10px] text-Text-Quadruple">
                          {item.upload_date}
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center w-full">
                            <img
                              onClick={() => {
                                if (selected) {
                                  handleDelete(selected, item.entity);
                                }
                              }}
                              src="/icons/trash-blue.svg"
                              className="cursor-pointer"
                              alt=""
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="w-full flex items-center justify-end gap-3 text-sm font-medium mt-5 mb-3">
              <div
                onClick={() => {
                  setStepAddDocument(1);
                  setDocumentsData([]);
                }}
                className="text-[#909090] cursor-pointer"
              >
                Back
              </div>
              <div
                onClick={loadingButton ? () => {} : handleAddToDatabase}
                className="text-Primary-DeepTeal cursor-pointer"
              >
                {loadingButton ? <SpinnerLoader color="#005F73" /> : 'Save'}
              </div>
            </div>
          </>
        )}
      </div>
    </MainModal>
  );
};

export default AddNewDocument;
