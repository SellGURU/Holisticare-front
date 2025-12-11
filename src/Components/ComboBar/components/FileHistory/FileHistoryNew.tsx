/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Circleloader from '../../../CircleLoader';
import Application from '../../../../api/app';
import { useParams } from 'react-router-dom';
import { publish, subscribe, unsubscribe } from '../../../../utils/event';
import FileUploadProgressList from './FileUploadProgressList';

interface FileHistoryNewProps {
  handleCloseSlideOutPanel: () => void;
  isOpen: boolean;
  setUnsyncedIdes: (ids: string[]) => void;
  unsyncedIdes: string[];
}
const FileHistoryNew: FC<FileHistoryNewProps> = ({
  isOpen,
  handleCloseSlideOutPanel,
  unsyncedIdes,
  setUnsyncedIdes,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
  const getFileList = (id: string) => {
    setIsLoading(true);
    Application.getFilleList({ member_id: id })
      .then((res) => {
        if (res.data) {
          setUploadedFiles(
            res.data.map((file: any) => ({
              ...file,
              isNeedSync: unsyncedIdes.includes(file.file_id),
            })),
          );
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

  const handleCompletedProgress = (data: any) => {
    if (data.detail.file_id && data.detail.type == 'uploaded') {
      // alert('handleCompletedProgress');
      setUnsyncedIdes([...unsyncedIdes, data.detail.file_id]);
      setUploadedFiles((prev: any) =>
        prev.map((el: any) =>
          el.file_id === data.detail.file_id ? { ...el, isNeedSync: true } : el,
        ),
      );
    }
  };
  useEffect(() => {
    subscribe('completedProgress', handleCompletedProgress);
    subscribe('syncReport', () => {
      setUnsyncedIdes([]);
      setUploadedFiles((prev: any) =>
        prev.map((el: any) =>
          el.isNeedSync ? { ...el, isNeedSync: false } : el,
        ),
      );
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
      unsubscribe('completedProgress', handleCompletedProgress);
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
            // fileInputRef.current?.click();
            publish('uploadTestShow', {
              isShow: true,
            });
            handleCloseSlideOutPanel();
          }}
          className="mb-3 text-[14px] flex cursor-pointer justify-center items-center gap-1 bg-white border-Primary-DeepTeal border rounded-[20px] border-dashed px-8 h-8 w-full text-Primary-DeepTeal"
        >
          <img className="w-5 h-5" src="/icons/add-blue.svg" alt="" />
          Add File or Biomarker
        </div>
        <input
          type="file"
          accept=".pdf, .xls, .xlsx"
          multiple
          id="uploadFileBoxes"
          className="w-full absolute invisible h-full left-0 top-0"
        />
        <div className="w-full text-[12px] px-2 py-3 h-[48px] border border-Gray-50 bg-backgroundColor-Main text-Primary-DeepTeal font-medium  flex justify-between items-center rounded-[12px]">
          <div className="w-[70px] text-center text-nowrap">File Name</div>
          <div className="w-[80px]  text-nowrap">Upload Date</div>
          <div>Action</div>
        </div>
        <FileUploadProgressList uploadedFiles={uploadedFiles} />
      </div>
    </>
  );
};

export default FileHistoryNew;
