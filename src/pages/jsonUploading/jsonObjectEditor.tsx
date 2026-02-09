import { isPlainObject } from '../../utils/jsonUploading';

type Props = {
  value: any;
  onChange: (next: any) => void;
  path?: string;
};

export default function JsonObjectEditor({ value, onChange, path = '' }: Props) {
  // Primitive
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

  // Array
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

  // Object
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
              <div className="truncate text-xs text-slate-500">{`${
                path ? path + '.' : ''
              }${k}`}</div>
            </div>
          </div>

          <JsonObjectEditor
            value={value[k]}
            path={`${path ? path + '.' : ''}${k}`}
            onChange={(nextChild) => onChange({ ...value, [k]: nextChild })}
          />
        </div>
      ))}
    </div>
  );
}
