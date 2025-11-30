/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Application from "../../../api/app";

interface UnderProgressControllerProps {
  member_id: string;
}

const UnderProgressController = ({ member_id }: UnderProgressControllerProps) => {
  const [allprogress,SetAllprogress] = useState<any>({
    files: [],
    questionnaires: [],
    refresh: []    
  });
  
  const getProgress = () => {
    Application.getProgress(member_id).then((res) => {
      console.log(res);
      SetAllprogress(res.data);
    });
  }

  const checkUploadedFile =(file: any) => {
    Application.checkStepTwoUpload({
      file_id: file.file_id,
      member_id: member_id
    }).then((res) => {
      // console.log(res);
    });

  }
  const resolveFileController =(files: any[]) => {
    files.forEach((file) => {
      if(file.action_type === 'uploaded') {
        checkUploadedFile(file);
      }
    });
  }



  const controllProgress = () => {
    if(allprogress.files.length > 0) {
      resolveFileController(allprogress.files);
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {  getProgress();
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    controllProgress();
  }, [allprogress]);
  return (
    <>
    </>
  );
};

export default UnderProgressController;