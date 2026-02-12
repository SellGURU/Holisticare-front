// RowEditModal.tsx
import { useEffect, useState } from 'react';

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type Props<T extends Record<string, any>> = {
  open: boolean;
  title?: string;

  columns: Array<keyof T>;
  value: T | null;

  onClose: () => void;
  onSave: (next: T) => void;

  renderField?: (
    key: keyof T,
    draft: T,
    setDraft: (next: T) => void,
  ) => React.ReactNode;

  validateDraft?: (draft: T) => Partial<Record<keyof T, string>>;
};

export default function RowEditModal<T extends Record<string, any>>({
  open,
  title = 'Edit row',
  columns,
  value,
  onClose,
  onSave,
  renderField,
  validateDraft,
}: Props<T>) {
  const [draft, setDraft] = useState<T>({} as T);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  useEffect(() => {
    if (!open) return;
    const next = (value ? JSON.parse(JSON.stringify(value)) : {}) as T;
    setDraft(next);
    setErrors({});
  }, [open, value]);

  if (!open || !draft) return null;

  function save() {
    const nextErrors = validateDraft ? validateDraft(draft) : {};
    setErrors(nextErrors ?? {});
    if (nextErrors && Object.keys(nextErrors).length) return;
    onSave(draft);
  }

  function defaultField(key: keyof T) {
    const v = draft[key];

    // simple behavior: string/number/bool input; objects as JSON textarea
    const isObj = typeof v === 'object' && v !== null;
    const isLong = typeof v === 'string' && v.length > 80;

    if (isObj) {
      return (
        <textarea
          className="h-44 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-slate-400"
          value={JSON.stringify(v, null, 2)}
          onChange={(e) => {
            const text = e.target.value;
            try {
              const parsed = JSON.parse(text);
              setErrors((prev) => {
                const n = { ...prev };
                delete (n as any)[key];
                return n;
              });
              setDraft((d) => ({ ...(d as any), [key]: parsed }));
            } catch {
              setErrors((prev) => ({ ...prev, [key]: 'Invalid JSON' as any }));
              setDraft((d) => ({ ...(d as any), [key]: v })); // keep old value
            }
          }}
        />
      );
    }

    if (isLong) {
      return (
        <textarea
          className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          value={String(v ?? '')}
          onChange={(e) =>
            setDraft((d) => ({ ...(d as any), [key]: e.target.value }))
          }
        />
      );
    }

    return (
      <input
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        value={
          typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v ?? '')
        }
        onChange={(e) => {
          const raw = e.target.value;

          if (typeof v === 'boolean') {
            setDraft((d) => ({ ...(d as any), [key]: raw === 'true' }));
            return;
          }
          if (typeof v === 'number') {
            const n = Number(raw);
            setDraft((d) => ({
              ...(d as any),
              [key]: Number.isFinite(n) ? n : (raw as any),
            }));
            return;
          }

          setDraft((d) => ({ ...(d as any), [key]: raw }));
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full h-full md:h-auto md:max-h-[85vh] md:w-[92vw] md:rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="text-xs text-slate-500">
              Edit all fields with enough space.
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {columns.map((k) => {
              const custom = renderField?.(k, draft, setDraft);
              const err = errors?.[k];

              return (
                <div
                  key={String(k)}
                  className={cn(
                    'rounded-xl border border-slate-200 bg-white p-3',
                  )}
                >
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    {String(k)}
                  </div>

                  {custom ?? defaultField(k)}

                  {err && (
                    <div className="mt-1 text-xs text-red-600">
                      {String(err)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tip: complex fields can be edited as JSON (if you didn’t provide a
            custom renderer).
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
              className="rounded-lg bg-Primary-DeepTeal px-3 py-2 text-xs font-medium text-white hover:bg-[#005160]"
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
