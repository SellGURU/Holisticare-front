// BiomarkerMappingEditor.tsx
import ArrayOfObjectsTableEditor from './table';
import { StringListEditor } from './StringListEditor';

export type BiomarkerMappingRow = {
  standard_name: string;
  variations: string[];
};

export type BiomarkerMapping = {
  mappings: BiomarkerMappingRow[];
};

function normalizeStringList(list: string[]) {
  return Array.from(
    new Set(list.map((s) => s.trim()).filter(Boolean))
  );
}

export function BiomarkerMappingEditor({
  value,
  onChange,
}: {
  value: BiomarkerMapping;
  onChange: (next: BiomarkerMapping) => void;
}) {
  const rows = value?.mappings ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-slate-900">Biomarker Mapping</div>
        <div className="text-xs text-slate-500">
          Manage standard biomarker names and their possible variations.
        </div>
      </div>

      <ArrayOfObjectsTableEditor<BiomarkerMappingRow>
        value={rows}
        columns={['standard_name', 'variations']}
        previewColumns={['standard_name', 'variations']} // optional if your table supports it
        addOpensModal
        createDraft={() => ({ standard_name: '', variations: [''] })}
        // Optional: nicer preview for variations in table
        cellPreview={(col, v) => {
          if (col === 'variations') {
            const arr = Array.isArray(v) ? v : [];
            const clean = normalizeStringList(arr);
            return clean.length ? `${clean.length} variation(s)` : '—';
          }
          return typeof v === 'string' ? v : String(v ?? '');
        }}
        renderField={(key, draft, setDraft) => {
          if (key === 'standard_name') {
            return (
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="e.g. Vitamin D"
                value={draft.standard_name}
                onChange={(e) => setDraft({ ...draft, standard_name: e.target.value })}
              />
            );
          }

          if (key === 'variations') {
            return (
              <StringListEditor
                title="Variations"
                value={draft.variations ?? ['']}
                onChange={(next) =>
                  setDraft({ ...draft, variations: next })
                }
                placeholder="e.g. Vit D"
              />
            );
          }

          return null;
        }}
        validateDraft={(draft) => {
          const errors: Record<string, string> = {};
          if (!draft.standard_name.trim()) errors.standard_name = 'Required';

          const cleaned = normalizeStringList(draft.variations ?? []);
          if (!cleaned.length) errors.variations = 'Add at least 1 variation';

          return errors;
        }}
        onChange={(next) => onChange({ ...value, mappings: next })}
      />
    </div>
  );
}
