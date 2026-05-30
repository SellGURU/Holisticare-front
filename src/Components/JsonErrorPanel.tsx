export interface JsonErrorInfo {
  title: string;
  message: string;
  details?: string[];
  severity?: 'error' | 'warning';
}

interface JsonErrorPanelProps {
  error: JsonErrorInfo | null;
  fileName?: string;
  onDismiss?: () => void;
}

const JsonErrorPanel = ({ error, fileName, onDismiss }: JsonErrorPanelProps) => {
  if (!error) return null;

  return (
    <div className="mt-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{error.title}</div>
          {fileName && (
            <div className="mt-0.5 text-[10px] text-red-700">
              File: <span className="font-medium">{fileName}</span>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] text-red-700"
          >
            Dismiss
          </button>
        )}
      </div>
      <div className="mt-2 leading-5">{error.message}</div>
      {!!error.details?.length && (
        <ul className="mt-2 max-h-[320px] list-disc space-y-1 overflow-y-auto rounded-xl bg-white/60 py-2 pl-5 pr-3 text-[11px] leading-5">
          {error.details.map((detail, index) => (
            <li key={`${detail}-${index}`}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JsonErrorPanel;
