import { useMemo, useState } from 'react';

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

export function MapStringArrayEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
}) {
  const entries = useMemo(() => Object.entries(value ?? {}), [value]);

  const [newKey, setNewKey] = useState('');
  const [newAlias, setNewAlias] = useState('');

  function addUnit() {
    const k = newKey.trim();
    if (!k) return;
    if ((value ?? {})[k]) return;
    onChange({ ...(value ?? {}), [k]: [] });
    setNewKey('');
  }

  function addAlias(unitKey: string) {
    const a = newAlias.trim();
    if (!a) return;
    const next = { ...(value ?? {}) };
    const current = next[unitKey] ?? [];
    next[unitKey] = [...current, a];
    onChange(next);
    setNewAlias('');
  }

  function removeUnit(unitKey: string) {
    const next = { ...(value ?? {}) };
    delete next[unitKey];
    onChange(next);
  }

  function removeAlias(unitKey: string, idx: number) {
    const next = { ...(value ?? {}) };
    const list = (next[unitKey] ?? []).slice();
    list.splice(idx, 1);
    next[unitKey] = list;
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">
          Each key is a canonical unit, value is list of alias strings.
        </div>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Unit key (e.g. mg/dL)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <button
          type="button"
          onClick={addUnit}
          className="rounded-lg bg-Primary-EmeraldGreen  px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          + Add unit
        </button>
      </div>

      <div className="space-y-3  max-h-[500px] overflow-auto pr-2">
        {entries.map(([unitKey, aliases]) => (
          <div
            key={unitKey}
            className="rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-xs text-slate-900 truncate">
                  {unitKey}
                </div>
                <div className="text-[11px] text-slate-500">
                  {aliases.length} alias(es)
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeUnit(unitKey)}
                className={classNames(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition',
                  'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300',
                )}
              >
                Remove unit
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Add alias (e.g. mg/100ml)"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
              />
              <button
                type="button"
                onClick={() => addAlias(unitKey)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
              >
                + Add alias
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {aliases.map((a, idx) => (
                <div key={`${a}-${idx}`} className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={a}
                    onChange={(e) => {
                      const next = { ...(value ?? {}) };
                      const list = (next[unitKey] ?? []).slice();
                      list[idx] = e.target.value;
                      next[unitKey] = list;
                      onChange(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeAlias(unitKey, idx)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {!aliases.length && (
                <div className="text-xs text-slate-500">No aliases yet.</div>
              )}
            </div>
          </div>
        ))}

        {!entries.length && (
          <div className="text-xs text-slate-500">No unit aliases yet.</div>
        )}
      </div>
    </div>
  );
}
