/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Circleloader from '../../../CircleLoader';
import Application from '../../../../api/app';
import { useParams } from 'react-router-dom';
import { publish, subscribe, unsubscribe } from '../../../../utils/event';
import FileUploadProgressList from './FileUploadProgressList';
import useIsDemo from '../../../../hooks/useIsDemo';

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
  const getFileList = (id: string) => {
    setIsLoading(true);
    Application.getFilleList({ member_id: id })
      .then((res) => {
        if (res.data) {
          setUploadedFiles(res.data);
        } else {
          throw new Error('Unexpected data format');
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    if (id) {
      // alert('getFileList');
      getFileList(id);
    }
  }, [id, isOpen]);

  // const handleCompletedProgress = (data: any) => {
  //   if (data.detail.file_id && data.detail.type == 'uploaded') {
  //     // alert('handleCompletedProgress');
  //     setUnsyncedIdes([...unsyncedIdes, data.detail.file_id]);
  //     setUploadedFiles((prev: any) =>
  //       prev.map((el: any) =>
  //         el.file_id === data.detail.file_id ? { ...el, isNeedSync: true } : el,
  //       ),
  //     );
  //   }
  // };
  useEffect(() => {
    // subscribe('completedProgress', handleCompletedProgress);
    subscribe('syncReport', () => {
      if (id) {
        getFileList(id);
      }
    });
    return () => {
      unsubscribe('syncReport', () => {
        if (id) {
          getFileList(id);
        }
      });
    };
  }, []);
  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="w-full">
        <div
          onClick={() => {
            if (isDemo) return;
            // fileInputRef.current?.click();
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
    </>
  );
};

export default FileHistoryNew;
