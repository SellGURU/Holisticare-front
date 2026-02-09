import { useMemo, useState } from 'react';
import RowEditModal from './RowEditModal';

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type Props = {
  value: Array<Record<string, any>>;
  onChange: (next: Array<Record<string, any>>) => void;
  columns: string[];
};

export default function ArrayOfObjectsTableEditor({ value, onChange, columns }: Props) {
  const rows = value ?? [];

  const previewColumns = useMemo(() => {
    const preferred = ['name', 'Benchmark areas', 'Biomarker', 'unit', 'position'];
    const picked = preferred.filter((c) => columns.includes(c));
    const rest = columns.filter((c) => !picked.includes(c));
    return [...picked, ...rest].slice(0, 5);
  }, [columns]);

  const hiddenCount = Math.max(0, columns.length - previewColumns.length);

  const [editIndex, setEditIndex] = useState<number | null>(null);

  function addRow() {
    const blankRow: Record<string, any> = {};
    columns.forEach((c) => (blankRow[c] = ''));
    onChange([...rows, blankRow]);
  }

  function removeRow(idx: number) {
    const next = rows.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  function cellPreview(v: any) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'string') {
      const t = v.trim();
      return t.length > 40 ? t.slice(0, 40) + '…' : t;
    }
    return '{…}';
  }

  const currentRow = editIndex === null ? null : rows[editIndex] ?? {};

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">
          Rows: <span className="font-semibold">{rows.length}</span>
        </div>

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
          onClick={addRow}
        >
          + Add row
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold text-slate-700 w-[60px]">#</th>

                {previewColumns.map((c) => (
                  <th
                    key={c}
                    className={cn(
                      'px-3 py-2 text-xs font-semibold text-slate-700',
                      c === 'Definition' && 'text-center',
                    )}
                  >
                    {c}
                  </th>
                ))}

                {hiddenCount > 0 && (
                  <th className="px-3 py-2 text-xs text-center font-semibold text-slate-700">
                    More
                  </th>
                )}

                <th className="px-3 py-2 text-xs text-center font-semibold text-slate-700 w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-slate-100 hover:bg-slate-50/40">
                  <td className="px-3 py-2 text-xs text-slate-500">{rIdx + 1}</td>

                  {previewColumns.map((c) => (
                    <td key={`${rIdx}-${c}`} className="px-3 py-2 align-top">
                      <div className="text-xs text-slate-800">{cellPreview(row?.[c])}</div>
                    </td>
                  ))}

                  {hiddenCount > 0 && (
                    <td className="px-3 py-2 text-xs text-center text-slate-500">
                      {hiddenCount} more…
                    </td>
                  )}

                  <td className="px-3 py-2">
                    <div className="flex w-[120px] justify-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                        onClick={() => setEditIndex(rIdx)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs hover:bg-slate-50"
                        onClick={() => removeRow(rIdx)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={previewColumns.length + 3} className="p-6 text-center text-sm text-slate-500">
                    No rows yet. Click “Add row”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RowEditModal
        open={editIndex !== null}
        title={editIndex !== null ? `Edit row #${editIndex + 1}` : 'Edit row'}
        columns={columns}
        value={currentRow}
        onClose={() => setEditIndex(null)}
        onSave={(nextRow) => {
          if (editIndex === null) return;
          const next = rows.slice();
          next[editIndex] = nextRow;
          onChange(next);
          setEditIndex(null);
        }}
      />
    </div>
  );
}
