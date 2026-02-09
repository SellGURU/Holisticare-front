import { JsonType, JSON_TYPE_LABELS } from './constants';

type Props = {
  jsonType: JsonType;
  setJsonType: (v: JsonType) => void;
  clinicEmails: string[];
  setClinicEmails: React.Dispatch<React.SetStateAction<string[]>>;
  rawMode: boolean;
  toggleRawMode: () => void;
};

export const LeftPanel: React.FC<Props> = ({
  jsonType,
  setJsonType,
  clinicEmails,
  setClinicEmails,
  rawMode,
  toggleRawMode,
}) => {
  return (
    <>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        JSON Type
      </label>

      <select
        value={jsonType}
        onChange={(e) => setJsonType(e.target.value as JsonType)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        {Object.entries(JSON_TYPE_LABELS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>

      {/* Emails */}
      <div className="mt-3 rounded-xl border p-3 space-y-3">
        <div className="flex justify-between">
          <span className="text-xs font-semibold">include_clinics_emails</span>
          <button
            className="text-xs bg-Primary-EmeraldGreen text-white px-[18px] py-2 rounded-lg border border-Gray-50"
            onClick={() => setClinicEmails((e) => [...e, ''])}
          >
            + Add
          </button>
        </div>

        {clinicEmails.map((email, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              value={email}
              onChange={(e) => {
                const next = [...clinicEmails];
                next[i] = e.target.value;
                setClinicEmails(next);
              }}
            />
            <button
              type="button"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
              onClick={() =>
                setClinicEmails((e) =>
                  e.filter((_, idx) => idx !== i).length
                    ? e.filter((_, idx) => idx !== i)
                    : [''],
                )
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Mode toggle */}
      <div className="mt-3 flex justify-between border p-3 rounded-xl bg-slate-50">
        <div>
          <div className="text-xs font-semibold">Editor mode</div>
          <div className="text-xs text-slate-500">Structured vs Raw</div>
        </div>
        <button
          className={`px-3 py-2 text-xs rounded ${
            rawMode ? 'bg-slate-900 text-white' : 'border'
          }`}
          onClick={toggleRawMode}
        >
          {rawMode ? 'Raw ON' : 'Raw OFF'}
        </button>
      </div>
    </>
  );
};
