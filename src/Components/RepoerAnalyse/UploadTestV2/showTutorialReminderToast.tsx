type TutorialReminderToastProps = {
  visible: boolean;
  onRestart: () => void;
  onClose: () => void;
};

export const TutorialReminderToast = ({
  visible,
  onRestart,
  onClose,
}: TutorialReminderToastProps) => {
  if (!visible) return null;

  return (
    <div className="fixed top-12 left-1/2 z-[1000] -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-lg">
        <span className="text-sm text-slate-700">
          Would you like to view the tutorial again?
        </span>

        <button
          onClick={onRestart}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Restart
        </button>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
