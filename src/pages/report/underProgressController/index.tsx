/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import Application from '../../../api/app';
import { publish, subscribe } from '../../../utils/event';

interface UnderProgressControllerProps {
  member_id: string;
}

interface FileProgress {
  category: 'file';
  file_id: string;
  action_type: 'uploaded' | 'deleted';
  [key: string]: any;
}

interface QuestionnaireProgress {
  category: 'questionnaire';
  [key: string]: any;
}

interface RefreshProgress {
  category: 'refresh';
  [key: string]: any;
}

type ProgressItem = FileProgress | QuestionnaireProgress | RefreshProgress;

type ProgressData = ProgressItem[];

const UnderProgressController = ({
  member_id,
}: UnderProgressControllerProps) => {
  const [allprogress, SetAllprogress] = useState<any>({
    files: [],
    questionnaires: [],
    refresh: [],
  });
  const [idHaveAction, SetIdHaveAction] = useState<Array<string>>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const getProgress = () => {
    Application.getProgress(member_id).then((res) => {
      SetAllprogress(res.data);
    });
  };

  const checkUploadedFile = (file: any) => {
    // publish('openProgressModal', {
    //   file_id: file.file_id,
    // });
    Application.checkStepTwoUpload({
      file_id: file.file_id,
      member_id: member_id,
    })
      .then((res) => {
        if (res.data.step_two == true) {
          publish('completedProgress', { file_id: file.file_id });
          // publish('StepTwoSuccess', { file_id: file.file_id });
          SetAllprogress({...allprogress, files: allprogress.files.filter((f:any) => f.file_id !== file.file_id)});
        } else {
          const timeoutId = setTimeout(() => {
            checkUploadedFile(file);
          }, 15000);
          timeoutsRef.current.push(timeoutId);
        }
      })
      .catch(() => {
        const timeoutId = setTimeout(() => {
          checkUploadedFile(file);
        }, 15000);
        timeoutsRef.current.push(timeoutId);
      });
  };
  const checkDeleteFile = (file: any) => {
    publish('openDeleteProgressModal', {
      file_id: file.file_id,
    });
    Application.checkDeleteLabReport({
      file_id: file.file_id,
      member_id: member_id,
    })
      .then((res) => {  
        if( res.data.deleted_date !== null) {
          publish('DeleteSuccess', { file_id: file.file_id });
          SetAllprogress({...allprogress, files: allprogress.files.filter((f:any) => f.file_id !== file.file_id)});
        }else {
          const timeoutId = setTimeout(() => {
            checkDeleteFile(file);
          }, 15000);
          timeoutsRef.current.push(timeoutId);
        }
      })
      .catch(() => {
        const timeoutId = setTimeout(() => {
          checkDeleteFile(file);
        }, 15000);
        timeoutsRef.current.push(timeoutId);
      });
  };
  const resolveFileController = (files: any[]) => {
    files.forEach((file) => {
      if(!idHaveAction.includes(file.action_type+'_'+file.file_id)){
        SetIdHaveAction([...idHaveAction, file.action_type+'_'+file.file_id]);
        if (file.action_type === 'uploaded') {
          checkUploadedFile(file);
        }
        if (file.action_type === 'deleted') {
          checkDeleteFile(file);
        }
      }
    });
  };

  const controllProgress = () => {
    if (allprogress.files.length > 0) {
      resolveFileController(allprogress.files);
    }
    if(allprogress.questionnaires.length > 0 || allprogress.refresh.length > 0 || allprogress.files.length > 0) {
      const progressArray: ProgressData = [
        ...allprogress.files.map((item: any): FileProgress => ({
          ...item,
          category: 'file' as const,
        })),
        ...allprogress.questionnaires.map((item: any): QuestionnaireProgress => ({
          ...item,
          category: 'questionnaire' as const,
        })),
        ...allprogress.refresh.map((item: any): RefreshProgress => ({
          ...item,
          category: 'refresh' as const,
        })),
      ];
      publish('openProgressModal', {
        data: progressArray,
      });
    }
  };
  useEffect(() => {
    getProgress();
    subscribe('checkProgress', (data: any) => {
      if (data.detail.type === 'file') {
        SetAllprogress((prev: any) => ({
          ...prev,
          files: [...prev.files, data.detail],
        }));
      }
    });
    
    return () => {
      SetAllprogress({
        files: [],
        questionnaires: [],
        refresh: [],
      });
      publish('clearAllProgress',{});
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    controllProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allprogress]);
  return <></>;
};

export default UnderProgressController;
