import React, { useEffect, useMemo, useRef, useState } from 'react';
import JsonUploadApi from '../../api/jsonUpload';

import { JsonType, JSON_TYPE_LABELS, TEMPLATES } from './constants';
import {
  deepClone,
  prettyJson,
  extractShapeKeys,
  matchesTemplateShape,
  normalizeEmails,
  looksLikeEmail,
} from '../../utils/jsonUploading';

import { LeftPanel } from './LeftPanel';
import JsonObjectEditor from './jsonObjectEditor';
import ArrayOfObjectsTableEditor from './table';

export const JsonUploading: React.FC = () => {
  // state
  const [jsonType, setJsonType] = useState<JsonType>('more_info');
  const [data, setData] = useState<any>(() => deepClone(TEMPLATES.more_info));
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(() => prettyJson(TEMPLATES.more_info));

  const [clinicEmails, setClinicEmails] = useState<string[]>(['']);
  const baseFile = true;

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // derived
  const template = useMemo(() => TEMPLATES[jsonType], [jsonType]);
  const columns = useMemo(() => extractShapeKeys(template), [template]);
  const isArrayOfObjectsTemplate = useMemo(
    () => Array.isArray(template) && columns.length > 0,
    [template, columns],
  );

  // reset when type changes
  useEffect(() => {
    const next = deepClone(TEMPLATES[jsonType]);
    setData(next);
    setRawText(prettyJson(next));
    setError(null);
    setSuccessMsg(null);
    setRawMode(false);
  }, [jsonType]);

  // keep raw in sync unless user is editing raw mode
  useEffect(() => {
    if (!rawMode) setRawText(prettyJson(data));
  }, [data, rawMode]);

  // handlers
  const onPickFile = () => fileInputRef.current?.click();

  const onFileSelected = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const match = matchesTemplateShape(parsed, template);
      if (!match.ok) {
        setError(`Uploaded JSON doesn't match "${JSON_TYPE_LABELS[jsonType]}". ${match.reason ?? ''}`);
        return;
      }

      setData(parsed);
      setRawMode(false);
      setSuccessMsg('JSON loaded successfully. You can edit fields now.');
    } catch (e: any) {
      setError(`Could not read JSON file. ${e?.message ?? 'Unknown error'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const applyRawJson = () => {
    setError(null);
    setSuccessMsg(null);

    try {
      const parsed = JSON.parse(rawText);
      const match = matchesTemplateShape(parsed, template);
      if (!match.ok) {
        setError(`Raw JSON doesn't match "${JSON_TYPE_LABELS[jsonType]}". ${match.reason ?? ''}`);
        return;
      }
      setData(parsed);
      setSuccessMsg('Raw JSON applied.');
    } catch (e: any) {
      setError(`Invalid JSON: ${e?.message ?? 'Unknown error'}`);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([prettyJson(data)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jsonType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const emails = normalizeEmails(clinicEmails);
      if (!emails.length) throw new Error('Please enter at least one clinic email.');

      const invalid = emails.filter((e) => !looksLikeEmail(e));
      if (invalid.length) throw new Error(`Invalid email(s): ${invalid.join(', ')}`);

      const meta = {
        base_file: baseFile,
        include_clinics_emails: emails,
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
  };

  return (
    <div className="w-full h-[calc(100vh-60px)] overflow-auto p-4">
      <div className="mx-auto space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">JSON Uploading</h1>
              <p className="text-sm text-slate-600">
                Pick a JSON type, edit values (or upload a file), then submit to the correct API.
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

          {/* Content */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1 space-y-3">
              <LeftPanel
                jsonType={jsonType}
                setJsonType={setJsonType}
                clinicEmails={clinicEmails}
                setClinicEmails={setClinicEmails}
                rawMode={rawMode}
                toggleRawMode={() => {
                  setRawMode((v) => !v);
                  setError(null);
                  setSuccessMsg(null);
                }}
              />

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <div className="font-semibold">Error</div>
                  <div className="text-xs">{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  <div className="font-semibold">OK</div>
                  <div className="text-xs">{successMsg}</div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold text-slate-700">Expected top-level keys</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {columns.map((k) => (
                    <span
                      key={k}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
                    >
                      {k}
                    </span>
                  ))}
                  {columns.length === 0 && (
                    <span className="text-xs text-slate-500">No strict keys</span>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                {!rawMode ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">Structured editor</h2>
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
                        columns={columns}
                        onChange={setData}
                      />
                    ) : (
                      <JsonObjectEditor value={data} onChange={setData} />
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-900">Raw JSON</h2>
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
                      Paste JSON here. Click <span className="font-semibold">Apply</span>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-slate-900">Preview (current payload)</div>
          <pre className="max-h-[320px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
            {prettyJson(data)}
          </pre>
        </div>
      </div>
    </div>
  );
};
