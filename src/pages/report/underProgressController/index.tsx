/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import Application from '../../../api/app';
import { publish, subscribe, unsubscribe } from '../../../utils/event';

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

const formatDateTime = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const UnderProgressController = ({
  member_id,
}: UnderProgressControllerProps) => {
  // const [fromDate, setfromDate] = useState<Date>(new Date());
  const fromDate = useRef<Date>(new Date());
  const lastNeedCheckProgressRef = useRef<Date | null>(null);
  const [allprogress, SetAllprogress] = useState<any>({
    files: [],
    questionnaires: [],
    refresh: [],
  });
  const [idHaveAction, SetIdHaveAction] = useState<Array<string>>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const needCheckProgress = () => {
    const lastDate = lastNeedCheckProgressRef.current;
    Application.needCheckProgress(
      member_id,
      lastDate != null ? formatDateTime(lastDate) : null,
    )
      .then((res) => {
        if (res.data.response == true) {
          getProgress();
          const newDate = new Date();
          lastNeedCheckProgressRef.current = newDate;
        }
      })
      .catch(() => {});
  };

  const getProgress = () => {
    Application.getProgress(member_id, formatDateTime(fromDate.current))
      .then((res) => {
        SetAllprogress(res.data);
      })
      .catch(() => {});
  };

  // const checkUploadedFile = (file: any) => {
  //   // publish('openProgressModal', {
  //   //   file_id: file.file_id,
  //   // });
  //   Application.checkStepTwoUpload({
  //     file_id: file.file_id,
  //     member_id: member_id,
  //   })
  //     .then((res) => {
  //       if (res.data.step_two == true) {
  //         publish('completedProgress', { file_id: file.file_id });
  //         // publish('StepTwoSuccess', { file_id: file.file_id });
  //         SetAllprogress({
  //           ...allprogress,
  //           files: allprogress.files.filter(
  //             (f: any) => f.file_id !== file.file_id,
  //           ),
  //         });
  //       } else {
  //         const timeoutId = setTimeout(() => {
  //           checkUploadedFile(file);
  //         }, 15000);
  //         timeoutsRef.current.push(timeoutId);
  //       }
  //     })
  //     .catch(() => {
  //       const timeoutId = setTimeout(() => {
  //         checkUploadedFile(file);
  //       }, 15000);
  //       timeoutsRef.current.push(timeoutId);
  //     });
  // };
  // const checkDeleteFile = (file: any) => {
  //   Application.checkDeleteLabReport({
  //     file_id: file.file_id,
  //     member_id: member_id,
  //   })
  //     .then((res) => {
  //       if (res.data.deleted == true) {
  //         publish('completedProgress', { file_id: file.file_id });
  //         SetAllprogress({
  //           ...allprogress,
  //           files: allprogress.files.filter(
  //             (f: any) => f.file_id !== file.file_id,
  //           ),
  //         });
  //       } else {
  //         const timeoutId = setTimeout(() => {
  //           checkDeleteFile(file);
  //         }, 15000);
  //         timeoutsRef.current.push(timeoutId);
  //       }
  //     })
  //     .catch(() => {
  //       const timeoutId = setTimeout(() => {
  //         checkDeleteFile(file);
  //       }, 15000);
  //       timeoutsRef.current.push(timeoutId);
  //     });
  // };
  const resolveFileController = (files: any[]) => {
    files
      .filter((item: any) => item.process_status == false)
      .forEach((file) => {
        if (!idHaveAction.includes(file.action_type + '_' + file.file_id)) {
          SetIdHaveAction([
            ...idHaveAction,
            file.action_type + '_' + file.file_id,
          ]);
          // if (file.action_type === 'uploaded') {
          //   checkUploadedFile(file);
          // }
          // if (file.action_type === 'deleted') {
          //   checkDeleteFile(file);
          // }
        }
      });

    files.forEach((file) => {
      if (file.process_status == true) {
        publish('completedProgress', { file_id: file.file_id });
      }
    });
  };
  const resolveQuestionnaireController = (questionnaires: any[]) => {
    questionnaires.forEach((file) => {
      if (file.process_status == true) {
        publish('completedProgress', { file_id: file.q_unique_id });
      }
    });
  };
  const controllProgress = () => {
    if (allprogress.files.length > 0) {
      resolveFileController(allprogress.files);
    }
    if (allprogress.questionnaires.length > 0) {
      resolveQuestionnaireController(allprogress.questionnaires);
    }
    if (
      allprogress.questionnaires.length > 0 ||
      allprogress.refresh.length > 0 ||
      allprogress.files.length > 0
    ) {
      const progressArray: ProgressData = [
        ...allprogress.files.map(
          (item: any): FileProgress => ({
            ...item,
            category: 'file' as const,
          }),
        ),
        ...allprogress.questionnaires.map(
          (item: any): QuestionnaireProgress => ({
            ...item,
            category: 'questionnaire' as const,
          }),
        ),
        ...allprogress.refresh.map(
          (item: any): RefreshProgress => ({
            ...item,
            category: 'refresh' as const,
          }),
        ),
      ];
      publish('openProgressModal', {
        data: progressArray,
      });
      if (progressArray.length == 0) {
        publish('allProgressCompleted', {});
      }
    }
  };
  useEffect(() => {
    // getProgress();
    needCheckProgress();
    const interval = setInterval(() => {
      needCheckProgress();
    }, 30000);

    subscribe('checkProgress', (data?: any) => {
      if (data) {
        if (data.detail.type === 'file') {
          SetAllprogress((prev: any) => ({
            ...prev,
            files: [...prev.files, data.detail],
          }));
        }
        setTimeout(() => {
          getProgress();
        }, 2000);
      } else {
        getProgress();
      }
    });
    subscribe('syncReport', () => {
      fromDate.current = new Date();
    });

    return () => {
      SetAllprogress({
        files: [],
        questionnaires: [],
        refresh: [],
      });
      clearInterval(interval);
      unsubscribe('checkProgress', () => {
        getProgress();
      });
      // publish('clearAllProgress', {});       lastNeedCheckProgressRef.current = null;
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
