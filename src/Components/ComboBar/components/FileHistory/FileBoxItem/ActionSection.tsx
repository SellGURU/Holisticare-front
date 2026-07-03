/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useRef, useState } from 'react';
import Application from '../../../../../api/app';
import { BeatLoader } from 'react-spinners';
import { publish } from '../../../../../utils/event';
import { downloadManualEntryPdfFromApi } from '../../../../../utils/manualEntry';
import useIsDemo from '../../../../../hooks/useIsDemo';
interface ActionSectionProps {
  file: any;
  isDeleted: boolean;
  memberId: string;
  onDelete: () => void;
  onEdit?: () => void;
  date?: string;
}
const ActionSection: FC<ActionSectionProps> = ({
  file,
  isDeleted,
  memberId,
  onDelete,
  onEdit,
  date,
}) => {
  const isDemo = useIsDemo();
  const [isSureRemove, setIsSureRemove] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [loadingDelete] = useState<boolean>(false);
  const downloadFile = () => {
    // If file_id exists, we fetch from API (covers both normal + manual)
    if (file.file_id) {
      Application.downloadFille({
        file_id: file.file_id,
        member_id: memberId,
      })
        .then((res) => {
          try {
            // const blobUrl = res.data;

            // const blob = new Blob([res.data]);
            // const blobUrl = URL.createObjectURL(blob);
            // Your API response wrapper seems to be: res.data.data
            const payload = res?.data;
            console.log(payload);

            // ✅ Manual entry → build PDF from payload
            if (payload?.type === 'manual' && Array.isArray(payload?.data)) {
              downloadManualEntryPdfFromApi(
                payload,
                `${file.file_name || 'manual-entry'}.pdf`,
                date,
              );
              return;
            }

            // ✅ Normal → open the url
            if (typeof payload === 'string') {
              window.open(payload, '_blank');
              return;
            }

            // Fallback if backend sends { data: "url" }
            const maybeUrl = payload?.data;
            if (typeof maybeUrl === 'string') {
              window.open(maybeUrl, '_blank');
              return;
            }

            console.error('Unexpected download response shape:', payload);
          } catch (error: any) {
            console.error('Error downloading file:', error);
          }
        })
        .catch((error: any) => {
          console.error('Error downloading file:', error);
        });

      return;
    }

    // No file_id: local file blob download
    const blobUrl = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.file_name || file.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const deletePollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const pollDeleteCompletion = (fileId: string) => {
    const checkDelete = async () => {
      try {
        const res = await Application.checkDeleteLabReport({
          file_id: fileId,
          member_id: memberId,
        });
        if (res.status === 200 && res.data?.deleted === true) {
          publish('DeleteSuccess', { member_id: memberId, file_id: fileId });
        } else {
          deletePollTimeoutRef.current = setTimeout(checkDelete, 1000);
        }
      } catch (err) {
        console.error(err);
        deletePollTimeoutRef.current = setTimeout(checkDelete, 1000);
      }
    };
    checkDelete();
  };

  const handleDelete = () => {
    if (isDemo) return;
    setIsSureRemove(false);
    const fileId = file.file_id;

    onDelete();

    Application.deleteFileHistory({
      file_id: fileId,
      member_id: memberId,
    })
      .then(() => {
        publish('labReportDeleted', { member_id: memberId, file_id: fileId });
        pollDeleteCompletion(fileId);
      })
      .catch((err) => {
        console.error(err);
      });

    setTimeout(() => {
      publish('checkProgress', {});
    }, 400);
  };
  const handleEdit = () => {
    if (isDemo || isDeleted) return;
    if (onEdit) onEdit();
    publish('uploadTestShow', {
      isShow: true,
      file_id: file.file_id,
      file_name: file.file_name || file.name || 'Uploaded Document.pdf',
    });
    setIsOptionsOpen(false);
  };

  return (
    <div className="relative z-[60] flex justify-end">
      <div
        className={`flex items-center justify-end ${
          isDeleted ? 'opacity-50' : ''
        }`}
      >
        {isSureRemove ? (
          <>
            <div className="absolute right-0 top-9 z-[70] w-[150px] rounded-xl border border-Gray-50 bg-white p-2 shadow-100 confirm-animation">
              <div className="mb-2 text-[10px] font-medium text-Text-Primary">
                Delete this file?
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSureRemove(false)}
                  className="rounded-lg border border-Gray-50 bg-white px-2 py-1.5 text-[9px] font-medium text-Text-Secondary hover:bg-backgroundColor-Main"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete()}
                  className="rounded-lg bg-Primary-DeepTeal px-2 py-1.5 text-[9px] font-medium text-white hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {loadingDelete ? (
              <div className="flex items-center justify-start gap-2 confirm-animation">
                <BeatLoader color="#6CC24A" size={10} />
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isDeleted}
                  onClick={() => setIsOptionsOpen((prev) => !prev)}
                  className={`flex size-8 items-center justify-center rounded-full border border-Gray-50 bg-white text-lg leading-none text-Primary-DeepTeal shadow-100 transition-colors hover:bg-backgroundColor-Main ${
                    isDeleted
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer'
                  }`}
                  aria-label="File options"
                >
                  ⋯
                </button>
                {isOptionsOpen ? (
                  <div className="absolute right-0 top-9 z-[70] min-w-[132px] overflow-hidden rounded-xl border border-Gray-50 bg-white py-1 shadow-100 confirm-animation">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isDeleted) {
                          downloadFile();
                          setIsOptionsOpen(false);
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-Text-Primary hover:bg-backgroundColor-Main"
                    >
                      <img src="/icons/import.svg" alt="" className="size-4" />
                      Download
                    </button>
                    {file.file_id && file.process_done !== false ? (
                      <button
                        type="button"
                        onClick={handleEdit}
                        disabled={isDemo}
                        title={
                          isDemo
                            ? 'Demo version cannot add or edit data. Upgrade for full access.'
                            : 'Edit biomarkers'
                        }
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-Text-Primary hover:bg-backgroundColor-Main ${
                          isDemo ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <img
                          src="/icons/edit-2-green.svg"
                          alt=""
                          className="size-4"
                        />
                        Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        if (isDemo) return;
                        setIsOptionsOpen(false);
                        setIsSureRemove(true);
                      }}
                      disabled={isDemo}
                      title={
                        isDemo
                          ? 'Demo version cannot add or edit data. Upgrade for full access.'
                          : undefined
                      }
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[10px] text-Text-Primary hover:bg-backgroundColor-Main ${
                        isDemo ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <img
                        src="/icons/delete-green.svg"
                        alt=""
                        className="size-4"
                      />
                      Delete
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default ActionSection;
