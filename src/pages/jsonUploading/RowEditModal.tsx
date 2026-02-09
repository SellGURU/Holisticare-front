import { useMemo, useState } from 'react';
import ThresholdsEditor from './ThresholdsEditor';

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type Props = {
  open: boolean;
  title?: string;
  columns: string[];
  value: Record<string, any> | null;
  onClose: () => void;
  onSave: (next: Record<string, any>) => void;
};

export default function RowEditModal({
  open,
  title = 'Edit row',
  columns,
  value,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Record<string, any> | null>(value);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // keep draft synced when opening new row
  useMemo(() => {
    if (open) {
      setDraft(value ? JSON.parse(JSON.stringify(value)) : {});
      setErrors({});
    }
  }, [open, value]);

  if (!open || !draft) return null;

  const validateAndSave = () => {
    const nextErrors: Record<string, string> = {};

    for (const k of columns) {
      if ((draft as any)[k] === '__INVALID_JSON__') nextErrors[k] = 'Invalid JSON';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave(draft);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full h-full md:h-auto md:max-h-[85vh] md:w-[92vw] md:rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="text-xs text-slate-500">Edit all fields with enough space.</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((k) => {
              const v = (draft as any)[k];
              const isComplex = typeof v === 'object' && v !== null;
              const isLong = typeof v === 'string' && v.length > 80;
              const fullWidth = k === 'thresholds';

              return (
                <div
                  key={k}
                  className={cn(
                    'rounded-xl border border-slate-200 bg-white p-3',
                    fullWidth && 'md:col-span-2',
                  )}
                >
                  <div className="text-xs font-semibold text-slate-700 mb-2">{k}</div>

                  {k === 'thresholds' ? (
                    <ThresholdsEditor
                      value={(draft as any)[k]}
                      onChange={(nextThresholds) => {
                        setDraft((d) => ({ ...(d as any), thresholds: nextThresholds }));
                      }}
                    />
                  ) : isComplex ? (
                    <>
                      <textarea
                        className="h-44 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-slate-400"
                        value={JSON.stringify(v, null, 2)}
                        onChange={(e) => {
                          const text = e.target.value;
                          try {
                            const parsed = JSON.parse(text);
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n[k];
                              return n;
                            });
                            setDraft((d) => ({ ...(d as any), [k]: parsed }));
                          } catch {
                            setErrors((prev) => ({ ...prev, [k]: 'Invalid JSON' }));
                            setDraft((d) => ({ ...(d as any), [k]: '__INVALID_JSON__' }));
                          }
                        }}
                      />
                      {errors[k] && <div className="mt-1 text-xs text-red-600">{errors[k]}</div>}
                    </>
                  ) : isLong ? (
                    <textarea
                      className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={String(v ?? '')}
                      onChange={(e) => setDraft((d) => ({ ...(d as any), [k]: e.target.value }))}
                    />
                  ) : (
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={
                        typeof v === 'boolean'
                          ? v
                            ? 'true'
                            : 'false'
                          : String(v ?? '')
                      }
                      onChange={(e) => {
                        const raw = e.target.value;

                        if (typeof v === 'boolean') {
                          setDraft((d) => ({ ...(d as any), [k]: raw === 'true' }));
                          return;
                        }
                        if (typeof v === 'number') {
                          const n = Number(raw);
                          setDraft((d) => ({ ...(d as any), [k]: Number.isFinite(n) ? n : raw }));
                          return;
                        }
                        setDraft((d) => ({ ...(d as any), [k]: raw }));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tip: object fields are edited as JSON. Use valid JSON (quotes, commas, etc.).
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-Primary-DeepTeal px-3 py-2 text-xs font-medium text-white hover:bg-[#005160]
"
              onClick={validateAndSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
