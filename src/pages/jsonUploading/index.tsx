import React, { useEffect, useMemo, useRef, useState } from 'react';
import JsonUploadApi from '../../api/jsonUpload';
import ThresholdsEditor from './ThresholdsEditor';

type JsonType =
  | 'more_info'
  | 'categories'
  | 'unit_mapping'
  | 'biomarker_mapping';

const JSON_TYPE_LABELS: Record<JsonType, string> = {
  more_info: 'More Info (more_info_rules.json)',
  categories: 'Categories (benchmark areas.json)',
  unit_mapping: 'Unit Mapping (unit_mapping.json)',
  biomarker_mapping: 'Biomarker Mapping (biomarker_mapping.json)',
};

// ✅ YOUR CURRENT templates (kept as you pasted)
const TEMPLATES: Record<JsonType, any> = {
  categories: [
    {
      name: '',
      position: '',
      description: '',
    },
  ],

  more_info: [
    {
      'Benchmark areas': '',
      Biomarker: '',
      Definition: '',
      unit: '',
      thresholds: {},
      source: '',
      update_source: '',
      'show_in_maual_entry ': true,
    },
  ],

  unit_mapping: {
    unit_conversions: {},
    common_prefixes: {},
    case_sensitive_units: [],
    common_unit_aliases: {},
    biomarker_specific: [],
  },

  biomarker_mapping: {
    mappings: [
      {
        standard_name: '',
        variations: [''],
      },
    ],
  },
};

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function isPlainObject(v: any): v is Record<string, any> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function extractShapeKeys(template: any): string[] {
  if (Array.isArray(template)) {
    const first = template[0];
    return isPlainObject(first) ? Object.keys(first) : [];
  }
  if (isPlainObject(template)) return Object.keys(template);
  return [];
}

function matchesTemplateShape(
  data: any,
  template: any,
): { ok: boolean; reason?: string } {
  if (Array.isArray(template)) {
    if (!Array.isArray(data))
      return { ok: false, reason: 'Expected a JSON array.' };
    const t0 = template[0];
    if (isPlainObject(t0)) {
      const d0 = data[0];
      if (data.length === 0) return { ok: true };
      if (!isPlainObject(d0))
        return { ok: false, reason: 'Expected array of objects.' };
      const req = Object.keys(t0);
      const missing = req.filter((k) => !(k in d0));
      if (missing.length)
        return {
          ok: false,
          reason: `Missing keys in first row: ${missing.join(', ')}`,
        };
      return { ok: true };
    }
    return { ok: true };
  }

  if (isPlainObject(template)) {
    if (!isPlainObject(data))
      return { ok: false, reason: 'Expected a JSON object.' };
    const req = Object.keys(template);
    const missing = req.filter((k) => !(k in data));
    if (missing.length)
      return {
        ok: false,
        reason: `Missing top-level keys: ${missing.join(', ')}`,
      };
    return { ok: true };
  }

  return { ok: true };
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ');
}

function prettyJson(v: any) {
  return JSON.stringify(v, null, 2);
}

// ---------- Editors ----------

function JsonObjectEditor({
  value,
  onChange,
  path = '',
}: {
  value: any;
  onChange: (next: any) => void;
  path?: string;
}) {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    const type = typeof value;

    return (
      <div className="flex items-center gap-2">
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          value={String(value ?? '')}
          onChange={(e) => {
            const raw = e.target.value;

            if (type === 'number') {
              const n = Number(raw);
              onChange(Number.isFinite(n) ? n : raw);
              return;
            }
            if (type === 'boolean') {
              onChange(raw === 'true');
              return;
            }
            onChange(raw);
          }}
        />
        <span className="text-xs text-slate-500">{type}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Array ({value.length})</span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
            onClick={() => onChange([...value, ''])}
          >
            + Add item
          </button>
        </div>

        <div className="space-y-3">
          {value.map((item, idx) => (
            <div
              key={`${path}[${idx}]`}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  [{idx}]
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                  onClick={() => {
                    const next = value.slice();
                    next.splice(idx, 1);
                    onChange(next);
                  }}
                >
                  Remove
                </button>
              </div>

              <JsonObjectEditor
                value={item}
                path={`${path}[${idx}]`}
                onChange={(nextItem) => {
                  const next = value.slice();
                  next[idx] = nextItem;
                  onChange(next);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const keys = Object.keys(value);

  return (
    <div className="space-y-3">
      {keys.map((k) => (
        <div
          key={`${path}.${k}`}
          className="rounded-xl border border-slate-200 bg-white p-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-slate-800">
                {k}
              </div>
              <div className="truncate text-xs text-slate-500">{`${path ? path + '.' : ''}${k}`}</div>
            </div>
          </div>

          <JsonObjectEditor
            value={value[k]}
            path={`${path ? path + '.' : ''}${k}`}
            onChange={(nextChild) => {
              onChange({ ...value, [k]: nextChild });
            }}
          />
        </div>
      ))}
    </div>
  );
}

function ArrayOfObjectsTableEditor({
  value,
  onChange,
  columns,
}: {
  value: Array<Record<string, any>>;
  onChange: (next: Array<Record<string, any>>) => void;
  columns: string[];
}) {
  const rows = value ?? [];

  // Pick which columns show in the table (compact view)
  const previewColumns = useMemo(() => {
    // Prefer common “summary” columns if they exist
    const preferred = [
      'name',
      'Benchmark areas',
      'Biomarker',
      'unit',
      'position',
    ];
    const picked = preferred.filter((c) => columns.includes(c));
    // Fill up to 5 columns total
    const rest = columns.filter((c) => !picked.includes(c));
    return [...picked, ...rest].slice(0, 5);
  }, [columns]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  function openEditor(idx: number) {
    setEditIndex(idx);
    setDraft(JSON.parse(JSON.stringify(rows[idx] ?? {})));
    setDraftErrors({});
  }

  function closeEditor() {
    setEditIndex(null);
    setDraft(null);
    setDraftErrors({});
  }

  function saveEditor() {
    if (editIndex === null || !draft) return;

    // validate JSON fields: any field whose value is object/array in original OR looks like JSON in draft
    const errors: Record<string, string> = {};

    for (const k of columns) {
      const v = draft[k];
      // if user is editing as string but it should be JSON, we parse in the field handler below
      // here we just ensure it isn't an invalid JSON sentinel
      if (v === '__INVALID_JSON__') {
        errors[k] = 'Invalid JSON';
      }
    }

    setDraftErrors(errors);
    if (Object.keys(errors).length) return;

    const next = rows.slice();
    next[editIndex] = draft;
    onChange(next);

    closeEditor();
  }

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
    // object/array
    return '{…}';
  }
  const hiddenCount = Math.max(0, columns.length - previewColumns.length);

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

      {/* Compact table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="max-h-[420px] overflow-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-700 w-[60px]">
                  #
                </th>
                {previewColumns.map((c) => (
                  <th
                    key={c}
                    className={` ${c == 'Definition' && 'text-center'} p-3 text-xs font-semibold text-slate-700`}
                  >
                    {c}
                  </th>
                ))}
                {
                    hiddenCount > 0 && ( <th className="p-3 text-xs text-center font-semibold text-slate-700">
                  More
                </th>)

                }
               
                <th className="p-3 text-xs text-center font-semibold text-slate-700 w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rIdx) => {
                return (
                  <tr
                    key={rIdx}
                    className="border-t border-slate-100 hover:bg-slate-50/40"
                  >
                    <td className="p-3 text-xs text-slate-500">{rIdx + 1}</td>

                    {previewColumns.map((c) => (
                      <td key={`${rIdx}-${c}`} className="p-3 align-top">
                        <div className="text-xs text-slate-800">
                          {cellPreview(row?.[c])}
                        </div>
                      </td>
                    ))}
                    {hiddenCount > 0 && (
                      <td className="p-3 text-xs text-center text-slate-500">
                        {hiddenCount > 0 ? `${hiddenCount} more…` : '—'}
                      </td>
                    )}

                    <td className="p-3">
                      <div className="flex w-[120px] justify-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                          onClick={() => openEditor(rIdx)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                          onClick={() => removeRow(rIdx)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

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

      {/* Fullscreen Modal Editor */}
      {editIndex !== null && draft && (
        <div className="w-full h-screen flex justify-center fixed z-[120] top-0 left-0 items-center ">
          <div
            className="absolute inset-0 bg-black/40 -mt-4"
            onClick={closeEditor}
          />

          <div className="absolute inset-x-0 bottom-0 top-0 md:inset-12 -mt-4 md:rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden ">
            <div className="border-b border-slate-200 p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Edit row #{editIndex + 1}
                </div>
                <div className="text-xs text-slate-500">
                  Edit all fields with enough space.
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {columns.map((k) => {
                  const v = draft[k];

                  const isComplex = typeof v === 'object' && v !== null;
                  const isLong = typeof v === 'string' && v.length > 80;

                  return (
                    <div
                      key={k}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        {k}
                      </div>

                      {k === 'thresholds' ? (
                        <ThresholdsEditor
                          value={draft[k]}
                          onChange={(nextThresholds) => {
                            setDraft((d) => ({
                              ...(d as any),
                              thresholds: nextThresholds,
                            }));
                          }}
                        />
                      ) : isComplex ? (
                        <div>
                          <textarea
                            className="h-44 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-slate-400"
                            value={JSON.stringify(v, null, 2)}
                            onChange={(e) => {
                              const text = e.target.value;
                              try {
                                const parsed = JSON.parse(text);
                                setDraftErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[k];
                                  return next;
                                });
                                setDraft((d) => ({
                                  ...(d as any),
                                  [k]: parsed,
                                }));
                              } catch {
                                setDraftErrors((prev) => ({
                                  ...prev,
                                  [k]: 'Invalid JSON',
                                }));
                                // keep marker so save blocks
                                setDraft((d) => ({
                                  ...(d as any),
                                  [k]: '__INVALID_JSON__',
                                }));
                              }
                            }}
                          />
                          {draftErrors[k] && (
                            <div className="mt-1 text-xs text-red-600">
                              {draftErrors[k]}
                            </div>
                          )}
                        </div>
                      ) : isLong ? (
                        <textarea
                          className="h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                          value={String(v ?? '')}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...(d as any),
                              [k]: e.target.value,
                            }))
                          }
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

                            // keep boolean nice
                            if (typeof v === 'boolean') {
                              setDraft((d) => ({
                                ...(d as any),
                                [k]: raw === 'true',
                              }));
                              return;
                            }

                            // keep numbers nice
                            if (typeof v === 'number') {
                              const n = Number(raw);
                              setDraft((d) => ({
                                ...(d as any),
                                [k]: Number.isFinite(n) ? n : raw,
                              }));
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
                Tip: object fields are edited as JSON. Use valid JSON (quotes,
                commas, etc.).
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                  onClick={closeEditor}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  onClick={saveEditor}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Component ----------

export const JsonUploading: React.FC = () => {
  const [jsonType, setJsonType] = useState<JsonType>('more_info');
  const [data, setData] = useState<any>(() => deepClone(TEMPLATES.more_info));
  const [rawText, setRawText] = useState<string>(() =>
    prettyJson(TEMPLATES.more_info),
  );
  const [rawMode, setRawMode] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const template = useMemo(() => TEMPLATES[jsonType], [jsonType]);
  const arrayColumns = useMemo(() => extractShapeKeys(template), [template]);
  const isArrayOfObjectsTemplate = useMemo(
    () => Array.isArray(template) && arrayColumns.length > 0,
    [template, arrayColumns],
  );

  useEffect(() => {
    const next = deepClone(TEMPLATES[jsonType]);
    setData(next);
    setRawText(prettyJson(next));
    setError(null);
    setSuccessMsg(null);
  }, [jsonType]);

  useEffect(() => {
    if (!rawMode) setRawText(prettyJson(data));
  }, [data, rawMode]);

  function onPickFile() {
    fileInputRef.current?.click();
  }

  async function onFileSelected(file: File | null) {
    if (!file) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const match = matchesTemplateShape(parsed, template);
      if (!match.ok) {
        setError(
          `Uploaded JSON doesn't match "${JSON_TYPE_LABELS[jsonType]}". ${match.reason ?? ''}`,
        );
        return;
      }

      setData(parsed);
      setRawText(prettyJson(parsed));
      setRawMode(false);
      setSuccessMsg('JSON loaded successfully. You can edit fields now.');
    } catch (e: any) {
      setError(`Could not read JSON file. ${e?.message ?? 'Unknown error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function applyRawJson() {
    setError(null);
    setSuccessMsg(null);

    try {
      const parsed = JSON.parse(rawText);
      const match = matchesTemplateShape(parsed, template);
      if (!match.ok) {
        setError(
          `Raw JSON doesn't match "${JSON_TYPE_LABELS[jsonType]}". ${match.reason ?? ''}`,
        );
        return;
      }
      setData(parsed);
      setSuccessMsg('Raw JSON applied.');
    } catch (e: any) {
      setError(`Invalid JSON: ${e?.message ?? 'Unknown error'}`);
    }
  }

  function downloadJson() {
    const blob = new Blob([prettyJson(data)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jsonType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function getClinicEmailFromLocalStorage(): string {
  const email = localStorage.getItem('email') ?? '';
  return email.trim();
}

  const [baseFile] = useState<boolean>(true);
const clinicEmail = useMemo(() => {
  return getClinicEmailFromLocalStorage();
}, []);


async function submit() {
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    if (!clinicEmail) {
      throw new Error('Clinic email not found in localStorage');
    }

    const meta = {
      base_file: baseFile,
      include_clinics_emails: [clinicEmail],
    };

    switch (jsonType) {
      case 'more_info':
        await JsonUploadApi.uploadMore_info(data, meta);
        break;
      case 'categories':
        await JsonUploadApi.uploadCategories(data, meta);
        break;
      case 'unit_mapping':
        await JsonUploadApi.uploadUnit_mapping(data, meta);
        break;
      case 'biomarker_mapping':
        await JsonUploadApi.uploadBiomarker_mapping(data, meta);
        break;
    }

    setSuccessMsg(`Uploaded successfully using "${jsonType}" endpoint.`);
  } catch (e: any) {
    setError(e?.message ?? 'Upload failed.');
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="w-full h-[calc(100vh-60px)] overflow-auto p-4">
      <div className="mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                JSON Uploading
              </h1>
              <p className="text-sm text-slate-600">
                Pick a JSON type, edit values (or upload a file), then submit to
                the correct API.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                onClick={onPickFile}
              >
                Upload .json file
              </button>

              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                onClick={downloadJson}
              >
                Download current JSON
              </button>

              <button
                type="button"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                onClick={submit}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Submit'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                JSON Type
              </label>
              <select
                value={jsonType}
                onChange={(e) => setJsonType(e.target.value as JsonType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
              >
                {Object.keys(JSON_TYPE_LABELS).map((k) => (
                  <option key={k} value={k}>
                    {JSON_TYPE_LABELS[k as JsonType]}
                  </option>
                ))}
              </select>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-700">
                    Editor mode
                  </div>
                  <div className="text-xs text-slate-500">
                    Structured vs Raw JSON
                  </div>
                </div>
                <button
                  type="button"
                  className={classNames(
                    'rounded-xl px-3 py-2 text-xs font-medium',
                    rawMode
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                  onClick={() => {
                    setRawMode((v) => !v);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                >
                  {rawMode ? 'Raw JSON ON' : 'Raw JSON OFF'}
                </button>
              </div>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <div className="font-semibold">Error</div>
                  <div className="text-xs">{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <div className="font-semibold">OK</div>
                  <div className="text-xs">{successMsg}</div>
                </div>
              )}

              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-700">
                  Expected top-level keys
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {extractShapeKeys(template).map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
                    >
                      {k}
                    </span>
                  ))}
                  {extractShapeKeys(template).length === 0 && (
                    <span className="text-xs text-slate-500">
                      No strict keys
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-700">
                  API Base URL
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Set <span className="font-mono">JsonUploadApi.BASE_URL</span>{' '}
                  (or wire to env).
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                {!rawMode ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">
                        Structured editor
                      </h2>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                        onClick={() => {
                          const next = deepClone(TEMPLATES[jsonType]);
                          setData(next);
                          setError(null);
                          setSuccessMsg('Reset to template.');
                        }}
                      >
                        Reset
                      </button>
                    </div>

                    {isArrayOfObjectsTemplate ? (
                      <ArrayOfObjectsTableEditor
                        value={Array.isArray(data) ? data : []}
                        columns={arrayColumns}
                        onChange={(next) => setData(next)}
                      />
                    ) : (
                      <JsonObjectEditor
                        value={data}
                        onChange={(next) => setData(next)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">
                        Raw JSON
                      </h2>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                          onClick={applyRawJson}
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                          onClick={() => setRawText(prettyJson(data))}
                        >
                          Revert
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="h-[520px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-slate-400"
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      spellCheck={false}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Paste JSON here. Click{' '}
                      <span className="font-semibold">Apply</span>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-900">
            Preview (current payload)
          </div>
          <pre className="max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
            {prettyJson(data)}
          </pre>
        </div>
      </div>
    </div>
  );
};
