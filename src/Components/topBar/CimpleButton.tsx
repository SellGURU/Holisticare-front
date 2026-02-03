/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useMemo, useState } from 'react';
import { publish, subscribe, unsubscribe } from '../../utils/event';
import { ButtonPrimary } from '../Button/ButtonPrimary';
// import TooltipText from '../TooltipText';
import { Tooltip } from 'react-tooltip';
import SpinnerLoader from '../SpinnerLoader';
// import { ButtonSecondary } from '../../../Components/Button/ButtosSecondary';
// import Tooltip from '../../../'; // فرضی

const CompileButton: FC = () => {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  /* ---------- derive state ---------- */

  const state = useMemo(() => {
    if (isSyncing) return 'SYNCING';
    if (progressData.length === 0) return 'IDLE';

    const isCompiling = progressData.some(
      (item) => item.process_status === false
    );

    if (isCompiling) return 'COMPILING';

    return 'READY_TO_COMPILE';
  }, [progressData, isSyncing]);

  /* ---------- effects ---------- */

  useEffect(() => {
    subscribe('openProgressModal', (data?: any) => {
      if (!data?.detail?.data) return;

      setProgressData((prev) => {
        const updated = [...prev];
        data.detail.data.forEach((newItem: any) => {
          const index = updated.findIndex((item: any) => {
            if (item.category === 'file')
              return item.file_id === newItem.file_id;
            if (item.category === 'questionnaire')
              return item.f_unique_id === newItem.f_unique_id;
            if (item.category === 'refresh') return true;
            return false;
          });

          if (index !== -1) {
            updated[index] = { ...updated[index], ...newItem };
          } else {
            updated.push(newItem);
          }
        });
        return updated;
      });
    });

    subscribe('allProgressCompleted', () => {
      setProgressData((prev) =>
        prev.map((item) => ({ ...item, process_status: true }))
      );
    });

    subscribe('syncReport', () => {
      setIsSyncing(false);
      setProgressData([]);
    });

    return () => {
      unsubscribe('openProgressModal', () => {});
      unsubscribe('allProgressCompleted', () => {});
      unsubscribe('syncReport', () => {});
    };
  }, []);

  /* ---------- UI config ---------- */

  const ui = {
    IDLE: {
      label: 'Compiled',
      disabled: true,
      tooltip:
        'Your system is fully compiled. You can now use the Holistic Plan and Action Plan.',
    },
    COMPILING: {
      label: 'Compiling...',
      disabled: true,
      tooltip: 'Your changes are being compiled. You can continue working while this completes.',
    },
    READY_TO_COMPILE: {
      label: 'Compile',
      disabled: false,
      tooltip: 'Compilation is ready. Click to compile and apply your latest changes.',
    },
    SYNCING: {
      label: 'Compiling...',
      disabled: true,
      tooltip: 'Final compilation in progress. Applying changes to the system.',
    },
  }[state];

  /* ---------- handlers ---------- */

  const handleClick = () => {
    if (state !== 'READY_TO_COMPILE') return;
    setIsSyncing(true);
    publish('syncReport', {});
  };

  /* ---------- render ---------- */

  return (
    // <Tooltip content={ui.tooltip}>
    <>
      <div>
        <ButtonPrimary
          size="small"
          disabled={ui.disabled}
          onClick={handleClick}
        >
          {(state === 'COMPILING' || state === 'SYNCING') && (
            <SpinnerLoader></SpinnerLoader>
          )}
          <div  data-tooltip-id={'tooltipcompile'} data-tooltip-content={ui.tooltip}>
          {ui.label}
          </div>
        </ButtonPrimary>
      </div>
      <Tooltip 
            place='bottom-start'
          className="!opacity-100 !bg-opacity-100"
          id="tooltipcompile"      
      ></Tooltip>
    </>
    // </Tooltip>
  );
};

export default CompileButton;
