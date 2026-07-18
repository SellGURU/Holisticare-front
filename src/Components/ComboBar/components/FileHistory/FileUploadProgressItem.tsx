/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import TooltipTextAuto from '../../../TooltipText/TooltipTextAuto';
import { formatDate } from './help';
import ActionSection from './FileBoxItem/ActionSection';
import { useParams } from 'react-router-dom';
import {
  formatExcludedBadge,
  formatReadyBadge,
  formatReviewBadge,
} from '../../../RepoerAnalyse/UploadTestV2/biomarkerCountCopy';
import { LabUploadWarningBanner } from '../../../RepoerAnalyse/UploadTestV2/LabUploadWarningBanner';
// import { ButtonSecondary } from '../../../Button/ButtosSecondary';
import { publish } from '../../../../utils/event';
import { isManualLabEntry } from '../../../../utils/manualEntry';

interface FileUploadProgressItemProps {
  file: any;
}

type FileReviewBadgesProps = {
  readyCount?: number;
  reviewCount?: number;
  excludedCount?: number;
  reviewCountsReady?: boolean;
  className?: string;
};

const FileReviewBadges: FC<FileReviewBadgesProps> = ({
  readyCount,
  reviewCount,
  excludedCount,
  reviewCountsReady = false,
  className = '',
}) => {
  const hasCounts = readyCount != null || reviewCountsReady;
  if (!hasCounts) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {readyCount != null ? (
        <span className="rounded-full bg-[#DEF7EC] px-2 py-0.5 text-[9px] font-medium text-[#027A48]">
          {formatReadyBadge(readyCount)}
        </span>
      ) : null}
      {reviewCountsReady && reviewCount != null && reviewCount > 0 ? (
        <span className="rounded-full bg-[#FFF8E8] px-2 py-0.5 text-[9px] font-medium text-[#B54708]">
          {formatReviewBadge(reviewCount)}
        </span>
      ) : null}
      {reviewCountsReady ? (
        <span className="rounded-full bg-Gray-50 px-2 py-0.5 text-[9px] font-medium text-Text-Secondary">
          {formatExcludedBadge(excludedCount ?? 0)}
        </span>
      ) : null}
    </div>
  );
};

const FileUploadProgressItem: FC<FileUploadProgressItemProps> = ({ file }) => {
  const [fileStatus, setFileStatus] = useState<
    'uploading' | 'upload' | 'deleting' | 'processing'
  >('upload');
  const { id } = useParams<{ id: string }>();
  const isManual = isManualLabEntry(file);
  const readyCount = file.readyCount ?? file.ready_count;
  const reviewCount = file.reviewCount ?? file.review_count;
  const excludedCount = file.excludedCount ?? file.excluded_count;
  const reviewCountsReady =
    file.reviewCountsReady ??
    file.review_counts_ready ??
    (reviewCount != null || excludedCount != null);
  useEffect(() => {
    if (file.action_type === 'uploaded') {
      if (file.process_done === true) {
        setFileStatus('upload');
      } else if (isManual) {
        setFileStatus('processing');
      } else {
        setFileStatus('uploading');
      }
    }
    if (file.action_type == 'deleted') {
      if (file.process_done == false) {
        setFileStatus('deleting');
      }
    }
  }, [file.action_type, file.process_done, isManual]);
  const showBusyOverlay =
    fileStatus === 'deleting' ||
    fileStatus === 'uploading' ||
    fileStatus === 'processing';
  return (
    <>
      <div
        className={`relative mb-2 w-full overflow-visible rounded-2xl border border-Gray-50 bg-white p-3 text-[10px] text-Text-Primary shadow-100 ${
          showBusyOverlay ? 'bg-[#F6FAFB]' : ''
        }`}
        style={{ borderColor: file.status == 'error' ? '#ff0005' : '#e9edf5 ' }}
      >
        {showBusyOverlay ? (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
            <div className="h-full w-1/2 animate-[progressShimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-Primary-EmeraldGreen/20 to-transparent" />
          </div>
        ) : null}
        <div className="relative z-[40] flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 select-none">
            <div className="mb-1 text-[9px] font-medium uppercase tracking-wide text-Text-Quadruple">
              {isManual ? 'Manual Entry' : 'File'}
            </div>
            <div className="text-[11px] font-medium text-Text-Primary">
              <TooltipTextAuto
                tooltipClassName="!bg-white ml-8 !w-[220px] !bg-opacity-100 !opacity-100 !h-fit !break-words !leading-5 !text-justify !text-wrap !shadow-100 !text-[#888888] !text-[10px] !rounded-[6px] !border !border-Gray-50 flex flex-col !z-[99999]"
                maxWidth="180px"
              >
                {file.file_name}
              </TooltipTextAuto>
              {fileStatus === 'processing' ? (
                <div className="mt-0.5 text-[9px] font-medium text-Primary-DeepTeal">
                  Updating health plan…
                </div>
              ) : null}
            </div>
          </div>
          <ActionSection
            date={file.date_uploaded}
            memberId={id || ''}
            isDeleted={fileStatus != 'upload'}
            file={file}
            onDelete={() => {
              setFileStatus('deleting');
            }}
          />
        </div>

        <div
          className={`relative z-[1] mt-3 grid grid-cols-2 gap-2 ${fileStatus != 'upload' ? 'opacity-60' : ''}`}
        >
          <div className="rounded-xl bg-backgroundColor-Main px-3 py-2">
            <div className="text-[9px] text-Text-Quadruple">Upload date</div>
            <div className="mt-0.5 text-[10px] font-medium text-Text-Primary">
              {formatDate(
                file.date_uploaded
                  ? file.date_uploaded
                  : new Date().toDateString(),
              )}
            </div>
          </div>
          <div className="rounded-xl bg-backgroundColor-Main px-3 py-2">
            <div className="text-[9px] text-Text-Quadruple">Test date</div>
            <div className="mt-0.5 text-[10px] font-medium text-Text-Primary">
              {file.date_of_test ? formatDate(file.date_of_test) : '—'}
            </div>
          </div>
        </div>
        <FileReviewBadges
          readyCount={readyCount}
          reviewCount={reviewCount}
          excludedCount={excludedCount}
          reviewCountsReady={reviewCountsReady}
          className="relative z-[1] mt-3"
        />
        <LabUploadWarningBanner
          message={file.warningMessage}
          variant="compact"
          className="relative z-[1] mt-2"
        />
        {file.needsManualReview && (reviewCount ?? 0) > 0 && (
          <button
            className="relative z-[1] mt-2 w-full cursor-pointer rounded-lg border border-[#F79009] bg-[#FFF8E8] px-3 py-1.5 text-left text-[9px] font-medium text-[#B54708] transition-opacity hover:opacity-80"
            onClick={() => {
              publish('uploadTestShow', {
                isShow: true,
                mode: isManual ? 'edit_manual' : 'edit',
                file_id: file.file_id,
                file_name:
                  file.file_name ||
                  file.name ||
                  (isManual ? 'Manual Entry' : 'Uploaded Document.pdf'),
              });
            }}
          >
            {reviewCount} row{(reviewCount ?? 0) !== 1 ? 's' : ''} need review —
            click to fix them
          </button>
        )}
        {/* {fileStatus === 'deleted' && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
                <img
                  src="/icons/tick-circle-upload.svg"
                  alt=""
                  className="w-5 h-5"
                />
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  Deleting Completed.
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                If you would like to remove its related data from the report,
                please click the “Unsync Data” button.
              </div>
              <div className="w-full flex justify-end">
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-1"
                  size="small"
                  onClick={() => {
                    publish('syncReport', {});
                    publish('fileIsDeleting', {
                      isDeleting: false,
                    });
                  }}
                >
                  Unsync Data
                </ButtonSecondary>
              </div>
            </div>
          </>
        )}
        {fileStatus === 'uploaded' && (
          <>
            <div className="flex flex-col mt-3">
              <div className="flex items-center">
                <img
                  src="/icons/tick-circle-upload.svg"
                  alt=""
                  className="w-5 h-5"
                />
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  The file upload completed.
                </div>
              </div>
              <div className="text-[10px] text-Text-Quadruple mt-2 leading-5">
                Click “Sync Data” to save this update to the system.
              </div>
              <div className="w-full flex justify-end">
                <ButtonSecondary
                  ClassName="rounded-[20px] mt-1"
                  size="small"
                  onClick={() => {
                    publish('syncReport', {});
                    setFileStatus('upload');
                  }}
                >
                  Sync Data
                </ButtonSecondary>
              </div>
            </div>
          </>
        )} */}
        {fileStatus == 'deleting' && (
          <>
            <div className="relative mt-3 overflow-hidden rounded-xl border border-Primary-DeepTeal/15 bg-white/70 p-3 confirm-animation">
              <div className="relative z-[1] flex items-center">
                <div
                  style={{
                    background:
                      'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                  }}
                  className="flex size-5   rounded-full items-center justify-center gap-[3px]"
                >
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                  <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
                </div>
                <div className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#005F73] via-[#3C9C5B] to-[#6CC24A] ml-1">
                  Your file is being removed.
                </div>
              </div>
              <div className="relative z-[1] text-[10px] text-Text-Quadruple mt-2 leading-5">
                If you'd like, you may continue working while the system removes
                the file.
              </div>
            </div>
          </>
        )}
        {fileStatus == 'uploading' && (
          <>
            <div className="mt-3 rounded-xl border border-Primary-DeepTeal/15 bg-[#F6FAFB] p-3 confirm-animation">
              <div className="flex items-start gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-Primary-DeepTeal/10">
                  <div
                    style={{
                      background:
                        'linear-gradient(to right, rgba(0,95,115,0.4), rgba(108,194,74,0.4))',
                    }}
                    className="flex size-5 rounded-full items-center justify-center gap-[3px]"
                  >
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot1"></div>
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot2"></div>
                    <div className="size-[2px] rounded-full bg-Primary-DeepTeal animate-dot3"></div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-Primary-DeepTeal">
                    {file.uploadPhase === 'processing' || file.headerProcessing
                      ? 'Background processing'
                      : 'Uploading file'}
                  </div>
                  <div className="mt-1 text-[10px] text-Text-Quadruple leading-5">
                    You can continue working while this file is processed.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default FileUploadProgressItem;
