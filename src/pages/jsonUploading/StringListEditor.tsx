import { useState } from 'react';

export function StringListEditor({
  title,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const s = draft.trim();
    if (!s) return;
    onChange([...(value ?? []), s]);
    setDraft('');
  }

  function removeAt(i: number) {
    const next = (value ?? []).slice();
    next.splice(i, 1);
    onChange(next.length ? next : []);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 ">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">Edit as list of strings.</div>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg bg-Primary-EmeraldGreen px-3 py-2 text-xs font-medium text-white hover:bg-[#5fb43f]"
        >
          + Add
        </button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-auto pr-2">
        {(value ?? []).map((s, i) => (
          <div key={`${s}-${i}`} className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={s}
              onChange={(e) => {
                const next = (value ?? []).slice();
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
            >
              Remove
            </button>
          </div>
        ))}

        {!((value ?? []).length) && (
          <div className="text-xs text-slate-500">No items yet.</div>
        )}
      </div>
    </div>
  );
}
