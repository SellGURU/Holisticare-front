type ThresholdItem = {
  label: string;
  status: string;
  low: number | string;
  high: number | string;
  color: string;
};

type Thresholds = Record<
  string, // gender e.g. "male" | "female"
  Record<
    string, // age range e.g. "18-100"
    ThresholdItem[]
  >
>;

function ensureThresholds(v: any): Thresholds {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Thresholds;
  return { male: {}, female: {} };
}

export default function ThresholdsEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (next: Thresholds) => void;
}) {
  const thresholds = ensureThresholds(value);

  const genders = Object.keys(thresholds).length
    ? Object.keys(thresholds)
    : ['male', 'female'];

  function setGenderRange(
    gender: string,
    rangeKey: string,
    items: ThresholdItem[],
  ) {
    const next: Thresholds = JSON.parse(JSON.stringify(thresholds));
    if (!next[gender]) next[gender] = {};
    next[gender][rangeKey] = items;
    onChange(next);
  }

  function removeGenderRange(gender: string, rangeKey: string) {
    const next: Thresholds = JSON.parse(JSON.stringify(thresholds));
    if (next[gender]) {
      delete next[gender][rangeKey];
      onChange(next);
    }
  }

  function addRange(gender: string) {
    const rangeKey = prompt('Enter age range key (e.g. 18-100):', '18-100');
    if (!rangeKey) return;

    const next: Thresholds = JSON.parse(JSON.stringify(thresholds));
    if (!next[gender]) next[gender] = {};
    if (!next[gender][rangeKey]) {
      next[gender][rangeKey] = [
        {
          label: '',
          status: '',
          low: '',
          high: '',
          color: '',
        },
      ];
    }
    onChange(next);
  }

  function addItem(gender: string, rangeKey: string) {
    const items = thresholds?.[gender]?.[rangeKey] ?? [];
    const nextItems = items.concat([
      { label: '', status: '', low: '', high: '', color: '' },
    ]);
    setGenderRange(gender, rangeKey, nextItems);
  }

  function removeItem(gender: string, rangeKey: string, idx: number) {
    const items = thresholds?.[gender]?.[rangeKey] ?? [];
    const nextItems = items.slice();
    nextItems.splice(idx, 1);
    setGenderRange(gender, rangeKey, nextItems);
  }

  function updateItem(
    gender: string,
    rangeKey: string,
    idx: number,
    patch: Partial<ThresholdItem>,
  ) {
    const items = thresholds?.[gender]?.[rangeKey] ?? [];
    const nextItems = items.slice();
    nextItems[idx] = { ...(nextItems[idx] ?? {}), ...patch } as ThresholdItem;
    setGenderRange(gender, rangeKey, nextItems);
  }

  return (
    <div className="space-y-4">
      {genders.map((gender) => {
        const ranges = thresholds[gender] ?? {};
        const rangeKeys = Object.keys(ranges);

        return (
          <div
            key={gender}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">
                {gender}
              </div>
              <button
                type="button"
                className="rounded-lg hover:bg-[#5fb43f]
 bg-Primary-EmeraldGreen px-3 py-2 text-xs font-medium text-white "
                onClick={() => addRange(gender)}
              >
                + Add range
              </button>
            </div>

            {rangeKeys.length === 0 ? (
              <div className="mt-3 text-xs text-slate-500">No ranges yet.</div>
            ) : (
              <div className="mt-3 space-y-3">
                {rangeKeys.map((rangeKey) => {
                  const items = ranges[rangeKey] ?? [];
                  return (
                    <div
                      key={`${gender}-${rangeKey}`}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="text-xs font-semibold text-slate-700">
                          Age range:{' '}
                          <span className="font-mono">{rangeKey}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                            onClick={() => addItem(gender, rangeKey)}
                          >
                            + Add item
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 hover:border-red-300 transition"
                            onClick={() => removeGenderRange(gender, rangeKey)}
                          >
                            Remove range
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-3">
                        {items.map((it, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-xs font-semibold text-slate-700">
                                Item #{idx + 1}
                              </div>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50"
                                onClick={() =>
                                  removeItem(gender, rangeKey, idx)
                                }
                              >
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                              <input
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                placeholder="e.g. Optimal"
                                value={it?.label ?? ''}
                                onChange={(e) =>
                                  updateItem(gender, rangeKey, idx, {
                                    label: e.target.value,
                                  })
                                }
                              />

                              <input
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                placeholder="e.g. OptimalRange"
                                value={it?.status ?? ''}
                                onChange={(e) =>
                                  updateItem(gender, rangeKey, idx, {
                                    status: e.target.value,
                                  })
                                }
                              />

                              <input
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                placeholder="low"
                                value={String(it?.low ?? '')}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const n = Number(raw);
                                  updateItem(gender, rangeKey, idx, {
                                    low:
                                      Number.isFinite(n) && raw !== ''
                                        ? n
                                        : raw,
                                  });
                                }}
                              />

                              <input
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                placeholder="high"
                                value={String(it?.high ?? '')}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  const n = Number(raw);
                                  updateItem(gender, rangeKey, idx, {
                                    high:
                                      Number.isFinite(n) && raw !== ''
                                        ? n
                                        : raw,
                                  });
                                }}
                              />

                              <input
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                                placeholder="color"
                                value={it?.color ?? ''}
                                onChange={(e) =>
                                  updateItem(gender, rangeKey, idx, {
                                    color: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        ))}

                        {items.length === 0 && (
                          <div className="text-xs text-slate-500">
                            No items. Click “Add item”.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
