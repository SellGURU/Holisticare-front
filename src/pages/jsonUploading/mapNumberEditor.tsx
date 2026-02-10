import { useMemo, useState } from 'react';

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export function MapNumberEditor({
  title,
  value,
  onChange,
  numberStep = 'any',
}: {
  title: string;
  value: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  numberStep?: string;
}) {
  const entries = useMemo(() => Object.entries(value ?? {}), [value]);
  const [k, setK] = useState('');
  const [v, setV] = useState<string>('');

  function add() {
    const key = k.trim();
    if (!key) return;

    const n = Number(v);
    if (!Number.isFinite(n)) return;

    onChange({ ...(value ?? {}), [key]: n });
    setK('');
    setV('');
  }

  function remove(key: string) {
    const next = { ...(value ?? {}) };
    delete next[key];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">Edit as key → number.</div>
      </div>

      <div className="flex gap-2">
        <input
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="key"
          value={k}
          onChange={(e) => setK(e.target.value)}
        />
        <input
          className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="number"
          value={v}
          onChange={(e) => setV(e.target.value)}
          type="number"
          step={numberStep}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-Primary-EmeraldGreen hover:bg-[#5fb43f] px-3 py-2 text-xs font-medium text-white text-nowrap"
        >
          + Add
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-xs text-slate-700 text-left">Key</th>
                <th className="px-3 py-2 text-xs text-slate-700 text-left">Value</th>
                <th className="px-3 py-2 text-xs text-slate-700 text-center w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, val]) => (
                <tr key={key} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-xs">{key}</td>
                  <td className="px-3 py-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      type="number"
                      step={numberStep}
                      value={String(val)}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (!Number.isFinite(n)) return;
                        onChange({ ...(value ?? {}), [key]: n });
                      }}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className={classNames(
                        'rounded-lg border px-3 py-2 text-xs font-medium transition',
                        'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300',
                      )}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}

              {!entries.length && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-500">
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
