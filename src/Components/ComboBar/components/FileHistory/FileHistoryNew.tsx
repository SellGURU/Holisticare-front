/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Circleloader from '../../../CircleLoader';
import Application from '../../../../api/app';
import { useParams } from 'react-router-dom';
import { publish, subscribe, unsubscribe } from '../../../../utils/event';
import FileUploadProgressList from './FileUploadProgressList';
import useIsDemo from '../../../../hooks/useIsDemo';

const FILE_LIST_REQUEST_TIMEOUT_MS = 30000;

interface FileHistoryNewProps {
  handleCloseSlideOutPanel: () => void;
  isOpen: boolean;
  setUnsyncedIdes: (ids: string[]) => void;
  unsyncedIdes: string[];
}
const FileHistoryNew: FC<FileHistoryNewProps> = ({
  isOpen,
  handleCloseSlideOutPanel,
}) => {
  const isDemo = useIsDemo();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const requestSeqRef = useRef(0);

  const getFileList = useCallback((memberId: string) => {
    const requestSeq = ++requestSeqRef.current;
    setIsLoading(true);

    const timeoutId = window.setTimeout(() => {
      if (requestSeq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }, FILE_LIST_REQUEST_TIMEOUT_MS);

    Application.getFilleList({ member_id: memberId })
      .then((res) => {
        if (requestSeq !== requestSeqRef.current) return;
        if (res.data) {
          setUploadedFiles(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        if (requestSeq !== requestSeqRef.current) return;
        console.error(err);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (requestSeq === requestSeqRef.current) {
          setIsLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    if (id) {
      getFileList(id);
    }
  }, [id, isOpen, getFileList]);

  useEffect(() => {
    const handleSyncReport = () => {
      if (id) {
        getFileList(id);
      }
    };

    subscribe('syncReport', handleSyncReport);
    return () => {
      unsubscribe('syncReport', handleSyncReport);
    };
  }, [id, getFileList]);

  useEffect(() => {
    const handleCompletedProgress = (data: any) => {
      if (data?.detail?.type === 'uploaded' && id) {
        getFileList(id);
      }
    };

    subscribe('completedProgress', handleCompletedProgress);
    return () => {
      unsubscribe('completedProgress', handleCompletedProgress);
    };
  }, [id, getFileList]);

  return (
    <div className="w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-10 rounded-[12px] min-h-[120px]">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full">
        <div
          onClick={() => {
            if (isDemo) return;
            publish('uploadTestShow', {
              isShow: true,
            });
            handleCloseSlideOutPanel();
          }}
          title={
            isDemo
              ? 'Demo version cannot add or edit data. Upgrade for full access.'
              : undefined
          }
          className={`mb-3 text-[14px] flex justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-[20px] border-dashed px-8 h-8 w-full text-Primary-DeepTeal ${isDemo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <img className="w-5 h-5" src="/icons/add-blue.svg" alt="" />
          Add File or Biomarker
        </div>
        <input
          type="file"
          accept=".pdf, .xls, .xlsx"
          multiple
          disabled={isDemo}
          id="uploadFileBoxes"
          className="w-full absolute invisible h-full left-0 top-0"
        />
        <div className="w-full text-[12px] px-2 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div className="w-[70px] text-center text-nowrap">File Name</div>
          <div className="w-[80px]  text-nowrap">Upload Date</div>
          <div className="w-[80px]  text-nowrap">Test Date</div>
          <div className="w-[80px] text-center">Action</div>
        </div>
        <FileUploadProgressList uploadedFiles={uploadedFiles} />
      </div>
    </div>
  );
};

export default FileHistoryNew;
