/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../../api/app';
import { publish, subscribe } from '../../../utils/event';

interface UnderProgressControllerProps {
  member_id: string;
}

const UnderProgressController = ({
  member_id,
}: UnderProgressControllerProps) => {
  const [allprogress, SetAllprogress] = useState<any>({
    files: [],
    questionnaires: [],
    refresh: [],
  });

  const getProgress = () => {
    Application.getProgress(member_id).then((res) => {
      console.log(res);
      SetAllprogress(res.data);
    });
  };

  const checkUploadedFile = (file: any) => {
    publish('openProgressModal', {
      file_id: file.file_id,
    });
    Application.checkStepTwoUpload({
      file_id: file.file_id,
      member_id: member_id,
    }).then((res) => {
      if(res.data.step_two == true) {
        publish('StepTwoSuccess', {file_id: file.file_id});
      }else {
        setTimeout(() => {
          checkUploadedFile(file);
        }, 15000);
      }
      // console.log(res);
    }).catch(() =>{});
  };
  const checkDeleteFile =(file:any) => {
    Application.checkDeleteLabReport({
      file_id: file.file_id,
      member_id: member_id,
    }).then(() => {
      // console.log(res);
    }).catch(() =>{});
  }
  const resolveFileController = (files: any[]) => {
    files.forEach((file) => {
      if (file.action_type === 'uploaded') {
        checkUploadedFile(file);
      }
      if (file.action_type === 'deleted') {
        checkDeleteFile(file);
      }
    });
  };

  const controllProgress = () => {
    if (allprogress.files.length > 0) {
      resolveFileController(allprogress.files);
    }
  };
  useEffect(() => {
    getProgress();
    subscribe('checkProgress', (data: any) => {
      if(data.detail.type === 'file') {
        SetAllprogress({...allprogress, files: [...allprogress.files, data.detail]});
      }
    });
    // const interval = setInterval(() => {
    //   getProgress();
    // }, 10000);
    // return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    controllProgress();
  }, [allprogress]);
  return <></>;
};

export default UnderProgressController;
