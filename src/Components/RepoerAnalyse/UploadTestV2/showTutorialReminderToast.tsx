import { useState } from 'react';
import Toggle from '../Boxs/Toggle';

type TutorialReminderToastProps = {
  visible: boolean;
  onViewTutorial: (value: boolean) => void;
  onClose: () => void;
  setRun: (value: boolean) => void;
};

export const TutorialReminderToast = ({
  visible,
  onViewTutorial,
  onClose,
  setRun,
}: TutorialReminderToastProps) => {
  const [viewTutorial, setViewTutorial] = useState(true);
  if (!visible) return null;

  return (
    <div className="fixed top-12 left-1/2 z-[1000] -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg">
        <span className="text-sm text-slate-700">
          Would you like to view the tutorial?
        </span>

        <Toggle
          checked={viewTutorial}
          setChecked={(value) => {
            onViewTutorial(value);
            setViewTutorial(value);
          }}
        />
        <button
          onClick={() => {
            onClose();
            if (viewTutorial) {
              localStorage.setItem('showTutorialAgain', 'true');
              setRun(true);
            } else {
              localStorage.setItem('showTutorialAgain', 'false');
              setRun(false);
            }
          }}
          className="text-slate-400 hover:text-slate-600 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
