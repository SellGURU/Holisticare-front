/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { ButtonPrimary } from '../../Button/ButtonPrimary';
import SpinnerLoader from '../../SpinnerLoader';
import { AddBiomarker } from './AddBiomarker';
import BiomarkersSection from './BiomarkersSection';
import FileUploaderSection from './FileUploaderSection';
import { removeRowErrorKey, reviewRowErrorKey } from './biomarkerReviewCompat';
import ReviewFindingsPanel, { ReviewFinding } from './ReviewFindingsPanel';

interface UploadPModalProps {
  initialMode?: string;
  isEditMode?: boolean;
  OnBack: () => void;
  uploadedFile: FileUpload | null;
  onSave: () => void;
  isShare: boolean;
  errorMessage: string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteFile: (file: any) => void;
  formatFileSize: (bytes: number) => string;
  fileInputRef: any;
  modifiedDateOfTest: Date;
  handleModifiedDateOfTestChange: (date: Date | null) => void;
  extractedBiomarkers: Array<any>;
  setExtractedBiomarkers: (updated: any) => void;
  addedBiomarkers: Array<any>;
  handleAddBiomarker: (newBiomarker: any) => void;
  handleTrashClick: (index: number) => void;
  handleConfirm: (index: number) => void;
  handleCancel: () => void;
  deleteIndex: number | null;
  addedDateOfTest: Date | null;
  handleAddedDateOfTestChange: (date: Date | null) => void;
  onClose: () => void;
  onDownload?: () => void;
  fileType: string;
  loading: boolean;
  uploadPhase?: string;
  reviewSummary?: any;
  rowErrors?: any;
  AddedRowErrors?: any;
  btnLoading: boolean;
  setrowErrors: any;
  progressBiomarkerUpload: number;
  fileId?: string;
  onRecheck?: () => void;
  recheckLoading?: boolean;
  reviewCounts?: { ready: number; review: number; excluded: number };
  extractedCount?: number;
  onSuppressedSetChange?: (keys: Set<string>) => void;
  reopeningExistingFile?: boolean;
  reviewCatalog?: any[];
  onReviewCatalogRefresh?: () => void;
  reviewFindings?: ReviewFinding[];
  reviewFindingsLoading?: boolean;
  onReloadReviewFindings?: () => void;
}

const UploadPModal: React.FC<UploadPModalProps> = ({
  initialMode,
  isEditMode,
  fileType,
  OnBack,
  uploadedFile,
  onSave,
  isShare,
  errorMessage,
  handleFileChange,
  handleDeleteFile,
  formatFileSize,
  fileInputRef,
  modifiedDateOfTest,
  handleModifiedDateOfTestChange,
  extractedBiomarkers,
  setExtractedBiomarkers,
  addedBiomarkers,
  handleAddBiomarker,
  handleTrashClick,
  handleConfirm,
  handleCancel,
  deleteIndex,
  addedDateOfTest,
  handleAddedDateOfTestChange,
  onClose,
  onDownload,
  loading,
  uploadPhase,
  reviewSummary,
  btnLoading,
  rowErrors,
  AddedRowErrors,
  setrowErrors,
  progressBiomarkerUpload,
  fileId,
  onRecheck,
  recheckLoading,
  reviewCounts,
  extractedCount,
  onSuppressedSetChange,
  reopeningExistingFile = false,
  reviewCatalog = [],
  onReviewCatalogRefresh,
  reviewFindings = [],
  reviewFindingsLoading = false,
  onReloadReviewFindings,
}) => {
  const isReviewWithFile = Boolean(
    uploadedFile?.file_id || uploadedFile?.status === 'completed',
  );
  const [reviewCountsLocal, setReviewCountsLocal] = useState({
    ready: 0,
    review: 0,
    excluded: 0,
  });
  const effectiveReviewCounts = reviewCounts ?? reviewCountsLocal;
  const [activeMenu, setactiveMenu] = useState(
    isEditMode ? 'Upload File' : initialMode || 'Upload File',
  );
  const [showOnlyErrors, setShowOnlyErrors] = useState(false);
  const [shouldAutoSwitch, setShouldAutoSwitch] = useState(false);

  useEffect(() => {
    // Only switch the active tab once data has actually loaded (loading=false).
    // Without this guard, fileType is still 'more_info' (its default) while the
    // API request is in flight, incorrectly showing the manual-entry tab for PDF uploads.
    if (isEditMode && !loading) {
      const fileName = uploadedFile?.file?.name?.toLowerCase?.() || '';
      const isDocumentUpload =
        fileName.endsWith('.pdf') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx') ||
        fileName.endsWith('.png') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.jpeg') ||
        fileName.endsWith('.webp');

      // If edit was opened from an uploaded document, always keep the Upload File tab.
      // For true manual-entry edits, keep the legacy behavior based on lab type.
      if (isDocumentUpload) {
        setactiveMenu('Upload File');
      } else {
        setactiveMenu(
          fileType === 'more_info' ? 'Add Biomarker' : 'Upload File',
        );
      }
    }
  }, [isEditMode, fileType, loading, uploadedFile]);

  useEffect(() => {
    if (!shouldAutoSwitch || isReviewWithFile) return;

    const rowErrorCount = rowErrors ? Object.keys(rowErrors).length : 0;
    const addedErrorCount = AddedRowErrors
      ? Object.keys(AddedRowErrors).length
      : 0;

    if (rowErrorCount > 0 && addedErrorCount === 0) {
      setactiveMenu('Upload File');
    }
    if (addedErrorCount > 0 && rowErrorCount === 0) {
      setactiveMenu('Add Biomarker');
    }

    setShouldAutoSwitch(false);
  }, [rowErrors, AddedRowErrors, shouldAutoSwitch, isReviewWithFile]);

  useEffect(() => {
    if (isReviewWithFile) {
      setactiveMenu('Upload File');
    }
  }, [isReviewWithFile]);

  const [showReview, setshowReview] = useState(false);
  useEffect(() => {
    if (
      (rowErrors && Object.keys(rowErrors).length > 0) ||
      (AddedRowErrors && Object.keys(AddedRowErrors).length > 0)
    ) {
      setshowReview(true);
    } else {
      setshowReview(false);
    }
  }, [rowErrors, AddedRowErrors, uploadedFile]);
  // useEffect(() => {
  //   if (activeMenu !== 'Upload File') {
  //     setshowReview(false);
  //   }
  // }, [activeMenu]);
  const uploadErrorCount = rowErrors ? Object.keys(rowErrors).length : 0;
  const addBiomarkerErrorCount = AddedRowErrors
    ? Object.keys(AddedRowErrors).length
    : 0;

  // Total combined
  const activeErrorCount =
    activeMenu === 'Upload File' ? uploadErrorCount : addBiomarkerErrorCount;
  useEffect(() => {
    setShowOnlyErrors(false);
  }, [activeMenu]);
  return (
    <>
      <div
        // style={{ height: window.innerHeight - 40 + 'px' }}
        className="w-full  h-[calc(100vh-40px)] rounded-[16px] y md:h-[89vh] top-4 flex justify-center absolute  left-0 text-Text-Primary px-2 md:px-6 xl:px-0 xl:pr-[95px]"
      >
        <div className="w-full h-full opacity-85  rounded-[12px] bg-Gray-50 backdrop-blur-md absolute"></div>
        <div
          // style={{ height: window.innerHeight - 80 + 'px' }}
          className="bg-white p-2 md:p-6 h-[calc(100vh-80px)] rounded-md pb-[80px] sm:pb-0 w-full flex flex-col min-h-0 overflow-hidden z-[99]"
        >
          <div className="w-full flex items-center justify-between">
            <div
              className="flex gap-2 items-center text-[10px] xs:text-xs text-Text-Primary font-medium"
              data-tour="lab-title"
            >
              <div
                onClick={() => OnBack()}
                className="cursor-pointer size-6 md:size-8 rounded-md p-1 bg-white border border-Gray-50 shadow-100 flex items-center justify-center"
              >
                <img src="/icons/arrow-back.svg" alt="" />
              </div>
              Lab Data & Biomarkers
            </div>
            <div className="flex items-center gap-2">
              {isReviewWithFile &&
              (reviewFindingsLoading || reviewFindings.length > 0) ? (
                <ReviewFindingsPanel
                  layout="modal"
                  findings={reviewFindings}
                  loading={reviewFindingsLoading}
                  onFindingUpdated={onReloadReviewFindings}
                />
              ) : null}
              {onRecheck && fileId && isReviewWithFile ? (
                <ButtonPrimary
                  type="button"
                  outLine
                  disabled={recheckLoading || btnLoading}
                  onClick={() => onRecheck()}
                  ClassName="min-w-[100px] xs:min-w-[127px] disabled:!bg-transparent disabled:!text-Primary-DeepTeal disabled:!border-Primary-DeepTeal disabled:opacity-100"
                  title="Re-run validation for this file"
                  aria-busy={recheckLoading}
                >
                  {recheckLoading ? (
                    <>
                      <SpinnerLoader />
                      Re-check
                    </>
                  ) : (
                    <div className="flex gap-2 justify-center text-[10px] xs:text-xs">
                      <img className="size-4" src="/icons/refresh.svg" alt="" />
                      Re-check
                    </div>
                  )}
                </ButtonPrimary>
              ) : null}
              <ButtonPrimary
                disabled={
                  (extractedBiomarkers.length == 0 &&
                    addedBiomarkers.length == 0 &&
                    fileType !== 'ultrasound') ||
                  btnLoading
                }
                onClick={() => {
                  onSave();
                  if (!isReviewWithFile) {
                    setShouldAutoSwitch(true);
                  }
                }}
                ClassName=" w-[100px] xs:w-[127px] md:w-[167px]"
                title={
                  isReviewWithFile && (effectiveReviewCounts?.review ?? 0) > 0
                    ? `${effectiveReviewCounts.review} item(s) need review. You can continue now and fix them later in Edit.`
                    : undefined
                }
              >
                {btnLoading ? (
                  <>
                    {' '}
                    <SpinnerLoader></SpinnerLoader>
                    Continue
                  </>
                ) : (
                  <div
                    className="flex gap-2 justify-center text-[10px] xs:text-xs"
                    data-tour="continue-btn"
                  >
                    <img
                      className="size-4"
                      src="/icons/arrow-right-white.svg"
                      alt=""
                    />
                    Continue{' '}
                  </div>
                )}
              </ButtonPrimary>
            </div>
          </div>
          {!isReviewWithFile && showReview && activeErrorCount > 0 ? (
            <div className="flex w-full justify-end mt-3 md:mt-4 shrink-0">
              <div className="bg-[#FFD8E4] text-[10px] text-Text-Primary w-full max-w-[320px] rounded-[20px] min-h-[36px] py-2 px-4 flex justify-between items-center gap-3">
                <div className="flex items-center gap-1 min-w-0 flex-1 flex-wrap">
                  <img
                    className="shrink-0"
                    src="/icons/info-circle-red-2.svg"
                    alt=""
                  />
                  <span>
                    {activeErrorCount}{' '}
                    {activeErrorCount === 1 ? 'error' : 'errors'} found in
                    biomarkers.
                  </span>
                  <div
                    className="underline cursor-pointer text-[10px] text-Text-Primary shrink-0"
                    onClick={() => setShowOnlyErrors(true)}
                  >
                    View {activeErrorCount === 1 ? 'Error' : 'Errors'}
                  </div>
                </div>
                <img
                  onClick={() => setshowReview(false)}
                  className="cursor-pointer size-4 shrink-0"
                  src="/icons/close-black.svg"
                  alt=""
                />
              </div>
            </div>
          ) : null}
          {isReviewWithFile ? (
            <div className="w-full flex-1 min-h-0 flex flex-col mt-3 gap-2 overflow-hidden">
              <FileUploaderSection
                isEditMode={isEditMode}
                isShare={isShare}
                errorMessage={errorMessage}
                handleFileChange={handleFileChange}
                uploadedFile={uploadedFile}
                handleDeleteFile={handleDeleteFile}
                formatFileSize={formatFileSize}
                fileInputRef={fileInputRef}
                onClose={onClose}
                onDownload={onDownload}
              />
              {fileType === 'ultrasound' ? (
                <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4">
                  <img
                    src="/icons/document-upload-new.svg"
                    alt="Ultrasound Report"
                    className="size-16 mb-4 opacity-60"
                  />
                  <div className="text-lg font-medium text-Text-Primary mb-2">
                    Ultrasound Report Uploaded
                  </div>
                  <div className="text-sm text-gray-500 text-center max-w-md">
                    This is an ultrasound/imaging report. Biomarker extraction
                    is not applicable for this type of report. The report
                    content will be included in your health plan.
                  </div>
                  <div className="mt-4 px-4 py-2 bg-Primary-DeepTeal/10 rounded-full text-sm text-Primary-DeepTeal font-medium">
                    Click "Continue" to proceed to Health Plan
                  </div>
                </div>
              ) : (
                <BiomarkersSection
                  isEditMode={isEditMode}
                  rowErrors={rowErrors}
                  setrowErrors={setrowErrors}
                  loading={loading}
                  uploadPhase={uploadPhase}
                  reviewSummary={reviewSummary}
                  progressBiomarkerUpload={progressBiomarkerUpload}
                  fileType={fileType}
                  dateOfTest={modifiedDateOfTest}
                  setDateOfTest={handleModifiedDateOfTestChange}
                  uploadedFile={uploadedFile}
                  biomarkers={extractedBiomarkers}
                  onChange={(updated) => setExtractedBiomarkers(updated)}
                  useReviewUx
                  onReviewCountsChange={setReviewCountsLocal}
                  onSuppressedSetChange={onSuppressedSetChange}
                  extractedCount={extractedCount}
                  reopeningExistingFile={reopeningExistingFile}
                  reviewCatalog={reviewCatalog}
                  onReviewCatalogRefresh={onReviewCatalogRefresh}
                  recheckLoading={recheckLoading}
                />
              )}
            </div>
          ) : (
            <>
              <div
                className={`w-full flex-1 min-h-0 flex flex-col mt-3 gap-2 overflow-hidden ${activeMenu !== 'Upload File' ? 'hidden' : ''}`}
              >
                <FileUploaderSection
                  isEditMode={isEditMode}
                  isShare={isShare}
                  errorMessage={errorMessage}
                  handleFileChange={handleFileChange}
                  uploadedFile={uploadedFile}
                  handleDeleteFile={handleDeleteFile}
                  formatFileSize={formatFileSize}
                  fileInputRef={fileInputRef}
                  onClose={onClose}
                  onDownload={onDownload}
                />
                {fileType === 'ultrasound' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4">
                    <img
                      src="/icons/document-upload-new.svg"
                      alt="Ultrasound Report"
                      className="size-16 mb-4 opacity-60"
                    />
                    <div className="text-lg font-medium text-Text-Primary mb-2">
                      Ultrasound Report Uploaded
                    </div>
                    <div className="text-sm text-gray-500 text-center max-w-md">
                      This is an ultrasound/imaging report. Biomarker extraction
                      is not applicable for this type of report. The report
                      content will be included in your health plan.
                    </div>
                    <div className="mt-4 px-4 py-2 bg-Primary-DeepTeal/10 rounded-full text-sm text-Primary-DeepTeal font-medium">
                      Click "Continue" to proceed to Health Plan
                    </div>
                  </div>
                ) : uploadedFile || fileType !== 'more_info' ? (
                  <BiomarkersSection
                    isEditMode={isEditMode}
                    rowErrors={rowErrors}
                    setrowErrors={setrowErrors}
                    loading={loading}
                    uploadPhase={uploadPhase}
                    reviewSummary={reviewSummary}
                    progressBiomarkerUpload={progressBiomarkerUpload}
                    fileType={fileType}
                    dateOfTest={modifiedDateOfTest}
                    setDateOfTest={handleModifiedDateOfTestChange}
                    uploadedFile={uploadedFile}
                    biomarkers={extractedBiomarkers}
                    onChange={(updated) => setExtractedBiomarkers(updated)}
                    showOnlyErrors={showOnlyErrors}
                    setShowOnlyErrors={setShowOnlyErrors}
                    reviewCatalog={reviewCatalog}
                    onReviewCatalogRefresh={onReviewCatalogRefresh}
                    recheckLoading={recheckLoading}
                  />
                ) : null}
              </div>
              <div className={activeMenu !== 'Add Biomarker' ? 'hidden' : ''}>
                <AddBiomarker
                  biomarkers={
                    isEditMode && fileType === 'more_info'
                      ? extractedBiomarkers
                      : addedBiomarkers
                  }
                  rowErrors={
                    isEditMode && fileType === 'more_info'
                      ? rowErrors
                      : AddedRowErrors
                  }
                  onAddBiomarker={(newBio) => {
                    if (isEditMode && fileType === 'more_info') {
                      setExtractedBiomarkers([...extractedBiomarkers, newBio]);
                    } else {
                      handleAddBiomarker(newBio);
                    }
                  }}
                  onTrashClick={handleTrashClick}
                  onConfirm={(index) => {
                    if (isEditMode && fileType === 'more_info') {
                      const deletedRow = extractedBiomarkers[index];
                      const deletedRowKey = deletedRow
                        ? reviewRowErrorKey(deletedRow, index)
                        : '';
                      setExtractedBiomarkers(
                        extractedBiomarkers.filter((_, i) => i !== index),
                      );

                      if (deletedRowKey && rowErrors) {
                        setrowErrors((prev: Record<string, string>) =>
                          removeRowErrorKey(prev || {}, deletedRowKey),
                        );
                      }

                      handleCancel();
                    } else {
                      handleConfirm(index);
                    }
                  }}
                  onCancel={handleCancel}
                  deleteIndex={deleteIndex}
                  dateOfTest={
                    isEditMode && fileType === 'more_info'
                      ? modifiedDateOfTest
                      : addedDateOfTest
                  }
                  setDateOfTest={
                    isEditMode && fileType === 'more_info'
                      ? handleModifiedDateOfTestChange
                      : handleAddedDateOfTestChange
                  }
                  showOnlyErrors={showOnlyErrors}
                  setShowOnlyErrors={setShowOnlyErrors}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadPModal;
