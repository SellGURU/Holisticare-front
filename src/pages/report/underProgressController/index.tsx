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

const BURST_POLL_INTERVAL_MS = 5000;
const BURST_POLL_MAX_MS = 180000;
const ALL_PROGRESS_COMPLETED_DELAY_MS = 1500;

const formatDateTime = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const hasInflightOperations = (progress: {
  files: any[];
  questionnaires: any[];
  refresh: any[];
}) =>
  [...progress.files, ...progress.questionnaires, ...progress.refresh].some(
    (item) => item.process_status === false,
  );

const UnderProgressController = ({
  member_id,
}: UnderProgressControllerProps) => {
  const fromDate = useRef<Date>(new Date());
  const lastNeedCheckProgressRef = useRef<Date | null>(null);
  const currentMemberIdRef = useRef<string>(member_id);
  const [allprogress, SetAllprogress] = useState<any>({
    files: [],
    questionnaires: [],
    refresh: [],
  });
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const burstPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstPollStartedRef = useRef<number | null>(null);
  const overviewPollTriggeredRef = useRef(false);
  const hadInflightOperationsRef = useRef(false);
  const completedProgressKeysRef = useRef<Set<string>>(new Set());
  const allProgressCompletedTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scheduleAllProgressCompleted = () => {
    if (allProgressCompletedTimeoutRef.current) {
      clearTimeout(allProgressCompletedTimeoutRef.current);
    }
    allProgressCompletedTimeoutRef.current = setTimeout(() => {
      publish('allProgressCompleted', {});
      allProgressCompletedTimeoutRef.current = null;
    }, ALL_PROGRESS_COMPLETED_DELAY_MS);
  };

  const stopBurstPoll = () => {
    if (burstPollRef.current) {
      clearInterval(burstPollRef.current);
      burstPollRef.current = null;
    }
    burstPollStartedRef.current = null;
  };

  const getProgress = () => {
    Application.getProgress(member_id, formatDateTime(fromDate.current))
      .then((res) => {
        SetAllprogress(res.data);
      })
      .catch(() => {});
  };

  const startBurstPoll = () => {
    stopBurstPoll();
    burstPollStartedRef.current = Date.now();
    getProgress();
    burstPollRef.current = setInterval(() => {
      if (
        burstPollStartedRef.current &&
        Date.now() - burstPollStartedRef.current > BURST_POLL_MAX_MS
      ) {
        stopBurstPoll();
        return;
      }
      getProgress();
    }, BURST_POLL_INTERVAL_MS);
  };

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

  const publishCompletedProgressOnce = (key: string, payload: any) => {
    if (completedProgressKeysRef.current.has(key)) return;
    completedProgressKeysRef.current.add(key);
    publish('completedProgress', payload);
  };

  const resolveFileController = (files: any[]) => {
    files.forEach((file) => {
      if (file.process_status == true) {
        publishCompletedProgressOnce(
          `file:${file.file_id}:${file.action_type}`,
          {
            file_id: file.file_id,
            type: file.action_type,
          },
        );
      }
    });
  };
  const resolveQuestionnaireController = (questionnaires: any[]) => {
    questionnaires.forEach((file) => {
      if (file.process_status == true) {
        publishCompletedProgressOnce(
          `questionnaire:${file.f_unique_id}:${file.action_type}`,
          {
            file_id: file.f_unique_id,
            type: file.action_type,
          },
        );
      }
    });
  };
  const resolveRefreshController = (refresh: any[]) => {
    refresh.forEach((item) => {
      if (item.process_status == true) {
        publish('RefreshCompleted', {
          file_id: item.file_id,
          type: item.action_type,
        });
      } else {
        publish('disableGenerate', {});
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
    if (allprogress.refresh.length > 0) {
      resolveRefreshController(allprogress.refresh);
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
    }
  };
  useEffect(() => {
    currentMemberIdRef.current = member_id;
    completedProgressKeysRef.current.clear();
    hadInflightOperationsRef.current = false;

    const effectMemberId = member_id;

    needCheckProgress();
    const interval = setInterval(() => {
      needCheckProgress();
    }, 30000);

    const handleCheckProgress = (data?: any) => {
      if (currentMemberIdRef.current !== effectMemberId) {
        return;
      }

      startBurstPoll();

      if (data?.detail?.type === 'file') {
        SetAllprogress((prev: any) => {
          const fileId = data.detail.file_id;
          const filesWithoutDuplicate = prev.files.filter(
            (f: any) => f.file_id !== fileId,
          );
          return {
            ...prev,
            files: [...filesWithoutDuplicate, data.detail],
          };
        });
      } else {
        getProgress();
      }
    };

    const handleSyncReport = (data?: any) => {
      if (currentMemberIdRef.current !== effectMemberId) {
        return;
      }
      if (data?.detail?.silent === true) {
        return;
      }
      fromDate.current = new Date();
    };

    subscribe('checkProgress', handleCheckProgress);
    subscribe('syncReport', handleSyncReport);

    return () => {
      SetAllprogress({
        files: [],
        questionnaires: [],
        refresh: [],
      });
      clearInterval(interval);
      stopBurstPoll();
      unsubscribe('checkProgress', handleCheckProgress);
      unsubscribe('syncReport', handleSyncReport);
      if (allProgressCompletedTimeoutRef.current) {
        clearTimeout(allProgressCompletedTimeoutRef.current);
        allProgressCompletedTimeoutRef.current = null;
      }
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member_id]);
  useEffect(() => {
    controllProgress();
    const inflight = hasInflightOperations(allprogress);
    const hasTrackedOperations =
      allprogress.files.length > 0 ||
      allprogress.questionnaires.length > 0 ||
      allprogress.refresh.length > 0;

    if (inflight) {
      hadInflightOperationsRef.current = true;
      if (!overviewPollTriggeredRef.current) {
        overviewPollTriggeredRef.current = true;
        publish('checkProgress', { source: 'inflight_start' });
      }
    } else if (hadInflightOperationsRef.current && hasTrackedOperations) {
      scheduleAllProgressCompleted();
      hadInflightOperationsRef.current = false;
    } else if (!inflight && !hasTrackedOperations) {
      overviewPollTriggeredRef.current = false;
    }

    if (!inflight) {
      stopBurstPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allprogress]);
  return <></>;
};

export default UnderProgressController;
