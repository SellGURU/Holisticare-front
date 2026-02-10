import { useMemo, useState } from 'react';
import RowEditModal from './RowEditModal';

function cn(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

type Props = {
  value: Array<Record<string, any>>;
  onChange: (next: any) => void;
  columns: string[];
};

export default function ArrayOfObjectsTableEditor({
  value,
  onChange,
  columns,
}: Props) {
  const rows = value ?? [];

  const previewColumns = useMemo(() => {
    const preferred = [
      'name',
      'Benchmark areas',
      'Biomarker',
      'unit',
      'position',
    ];
    const picked = preferred.filter((c) => columns.includes(c));
    const rest = columns.filter((c) => !picked.includes(c));
    return [...picked, ...rest].slice(0, 5);
  }, [columns]);

  const hiddenCount = Math.max(0, columns.length - previewColumns.length);

  // modal state
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function makeBlankRow() {
    const blank: Record<string, any> = {};
    columns.forEach((c) => (blank[c] = ''));
    return blank;
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

  // which row to show in modal
  const modalValue = useMemo(() => {
    if (isCreating) return makeBlankRow();
    if (editIndex === null) return null;
    return rows[editIndex] ?? makeBlankRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating, editIndex, rows]);

  const modalOpen = isCreating || editIndex !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-700">
          Rows: <span className="font-semibold">{rows.length}</span>
        </div>

        <button
          type="button"
          className="rounded-lg hover:bg-[#5fb43f]
 bg-Primary-EmeraldGreen px-3 py-2 text-xs font-medium text-white "
          onClick={() => {
            // ✅ open modal first (don’t add row yet)
            setIsCreating(true);
            setEditIndex(null);
          }}
        >
          + Add row
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold text-slate-700 w-[60px]">
                  #
                </th>

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
                <tr
                  key={rIdx}
                  className="border-t border-slate-100 hover:bg-slate-50/40"
                >
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {rIdx + 1}
                  </td>

                  {previewColumns.map((c) => (
                    <td key={`${rIdx}-${c}`} className="px-3 py-2 align-top">
                      <div className="text-xs text-slate-800">
                        {cellPreview(row?.[c])}
                      </div>
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
                        className="rounded-lg bg-Primary-DeepTeal px-3 py-1 text-xs font-medium text-white hover:bg-[#005160]
"
                        onClick={() => {
                          setEditIndex(rIdx);
                          setIsCreating(false);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
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
                  <td
                    colSpan={previewColumns.length + 3}
                    className="p-6 text-center text-sm text-slate-500"
                  >
                    No rows yet. Click “Add row”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RowEditModal
        open={modalOpen}
        title={
          isCreating
            ? 'Add row'
            : editIndex !== null
              ? `Edit row #${editIndex + 1}`
              : 'Edit row'
        }
        columns={columns}
        value={modalValue}
        onClose={() => {
          setIsCreating(false);
          setEditIndex(null);
        }}
        onSave={(nextRow) => {
          if (isCreating) {
            // ✅ only now append
            onChange([...rows, nextRow]);
            setIsCreating(false);
            return;
          }

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
