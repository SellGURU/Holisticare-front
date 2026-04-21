import { FC, useState } from 'react';

interface CalculationsEditorProps {
  scoring: Array<ScoringRuleType>;
  onChange: (next: Array<ScoringRuleType>) => void;
  questions: Array<QuestionaryType>;
}

const emptyRule: ScoringRuleType = {
  name: '',
  map_to_biomarker: '',
  unit: '',
  formula: '',
};

const CalculationsEditor: FC<CalculationsEditorProps> = ({
  scoring,
  onChange,
  questions,
}) => {
  const [expanded, setExpanded] = useState<boolean>(scoring.length > 0);
  const [draft, setDraft] = useState<ScoringRuleType | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);

  const idHints = questions
    .map((q) => q.id)
    .filter((id): id is string => !!id && id.trim().length > 0);

  const startAdd = () => {
    setDraft({ ...emptyRule });
    setEditIndex(-1);
  };

  const startEdit = (index: number) => {
    setDraft({ ...scoring[index] });
    setEditIndex(index);
  };

  const cancelDraft = () => {
    setDraft(null);
    setEditIndex(-1);
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.formula.trim()) return;
    const next = [...scoring];
    if (editIndex >= 0) {
      next[editIndex] = draft;
    } else {
      next.push(draft);
    }
    onChange(next);
    setDraft(null);
    setEditIndex(-1);
  };

  const removeRule = (index: number) => {
    const next = scoring.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="w-full mt-6">
      <div
        className="w-full flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="text-xs text-Text-Primary font-medium">
          Calculations (optional)
        </div>
        <div className="text-[11px] text-Primary-DeepTeal">
          {expanded ? 'Hide' : `Show (${scoring.length})`}
        </div>
      </div>

      {expanded && (
        <div className="w-full mt-3 space-y-2">
          {scoring.length === 0 && !draft && (
            <div className="text-[11px] text-Text-Secondary">
              Use formulas to derive new biomarkers from question responses.
              Variables are question ids.
            </div>
          )}

          {scoring.map((rule, index) => (
            <div
              key={`${rule.name}-${index}`}
              className="rounded-xl border border-Gray-50 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-[12px] text-Text-Primary font-medium">
                  {rule.name}
                  {rule.map_to_biomarker && (
                    <span className="text-Text-Secondary font-normal">
                      {' '}
                      → {rule.map_to_biomarker}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="text-[11px] text-Primary-DeepTeal"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="text-[11px] text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-Text-Secondary font-mono break-all">
                {rule.formula}
              </div>
              {rule.unit && (
                <div className="text-[10px] text-Text-Secondary mt-1">
                  Unit: {rule.unit}
                </div>
              )}
            </div>
          ))}

          {draft && (
            <div className="rounded-xl border border-Primary-DeepTeal p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. BMI)"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  className="rounded-md border border-Gray-50 px-2 py-1 text-[12px]"
                />
                <input
                  type="text"
                  placeholder="Map to biomarker (optional)"
                  value={draft.map_to_biomarker || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, map_to_biomarker: e.target.value })
                  }
                  className="rounded-md border border-Gray-50 px-2 py-1 text-[12px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Unit (optional, e.g. kg/m^2)"
                  value={draft.unit || ''}
                  onChange={(e) =>
                    setDraft({ ...draft, unit: e.target.value })
                  }
                  className="rounded-md border border-Gray-50 px-2 py-1 text-[12px]"
                />
                <input
                  type="number"
                  placeholder="Round digits (optional)"
                  value={draft.round ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      round:
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  className="rounded-md border border-Gray-50 px-2 py-1 text-[12px]"
                />
              </div>
              <textarea
                placeholder="Formula (e.g. q_weight / ((q_height / 100) ** 2))"
                value={draft.formula}
                onChange={(e) =>
                  setDraft({ ...draft, formula: e.target.value })
                }
                rows={3}
                className="w-full rounded-md border border-Gray-50 px-2 py-1 text-[12px] font-mono"
              />
              {idHints.length > 0 && (
                <div className="text-[10px] text-Text-Secondary">
                  Available variables: {idHints.join(', ')}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={cancelDraft}
                  className="text-[11px] text-Disable"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={!draft.name.trim() || !draft.formula.trim()}
                  className={`text-[11px] ${
                    !draft.name.trim() || !draft.formula.trim()
                      ? 'text-Disable cursor-not-allowed'
                      : 'text-Primary-DeepTeal'
                  }`}
                >
                  {editIndex >= 0 ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {!draft && (
            <button
              type="button"
              onClick={startAdd}
              className="flex items-center justify-center text-xs cursor-pointer text-Primary-DeepTeal font-medium border-2 border-dashed rounded-xl w-full h-[36px] bg-backgroundColor-Card border-Primary-DeepTeal"
            >
              + Add Calculation
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculationsEditor;
