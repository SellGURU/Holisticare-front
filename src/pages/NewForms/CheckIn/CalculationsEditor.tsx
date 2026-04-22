import { FC, useMemo, useRef, useState } from 'react';

interface CalculationsEditorProps {
  scoring: Array<ScoringRuleType>;
  onChange: (next: Array<ScoringRuleType>) => void;
  questions: Array<QuestionaryType>;
  onChangeQuestions?: (next: Array<QuestionaryType>) => void;
}

const emptyRule: ScoringRuleType = {
  name: '',
  map_to_biomarker: '',
  unit: '',
  formula: '',
};

const ID_REGEX = /^[a-z_][a-z0-9_]*$/i;

const generateId = (
  question: QuestionaryType,
  index: number,
  taken: Set<string>,
): string => {
  const baseFromOrder = `q${question.order ?? index + 1}`;
  if (!taken.has(baseFromOrder)) return baseFromOrder;
  let n = index + 1;
  while (taken.has(`q${n}`)) n += 1;
  return `q${n}`;
};

const OPERATOR_CHIPS: Array<{ label: string; snippet: string }> = [
  { label: '+', snippet: ' + ' },
  { label: '−', snippet: ' - ' },
  { label: '×', snippet: ' * ' },
  { label: '÷', snippet: ' / ' },
  { label: '( )', snippet: '()' },
  { label: 'x²', snippet: ' ** 2' },
  { label: 'sum( )', snippet: 'sum()' },
  { label: 'avg( )', snippet: 'avg()' },
  { label: 'if_( )', snippet: 'if_(, , )' },
];

const CalculationsEditor: FC<CalculationsEditorProps> = ({
  scoring,
  onChange,
  questions,
  onChangeQuestions,
}) => {
  const [expanded, setExpanded] = useState<boolean>(scoring.length > 0);
  const [draft, setDraft] = useState<ScoringRuleType | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const formulaRef = useRef<HTMLTextAreaElement | null>(null);

  const takenIds = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.id && typeof q.id === 'string' && ID_REGEX.test(q.id)) {
        set.add(q.id);
      }
    });
    return set;
  }, [questions]);

  const ensureId = (questionIndex: number): string => {
    const q = questions[questionIndex];
    if (q.id && ID_REGEX.test(q.id)) return q.id;
    const taken = new Set(takenIds);
    const newId = generateId(q, questionIndex, taken);
    if (onChangeQuestions) {
      const next = questions.map((qq, i) =>
        i === questionIndex ? { ...qq, id: newId } : qq,
      );
      onChangeQuestions(next);
    }
    return newId;
  };

  const insertSnippet = (snippet: string, cursorOffsetFromEnd = 0) => {
    const ta = formulaRef.current;
    const current = draft?.formula || '';
    let start = current.length;
    let end = current.length;
    if (ta) {
      start = ta.selectionStart ?? current.length;
      end = ta.selectionEnd ?? current.length;
    }
    const before = current.slice(0, start);
    const after = current.slice(end);
    const needsLeftSpace =
      before.length > 0 && !/[\s(]$/.test(before) && !/^[\s)]/.test(snippet);
    const joiner = needsLeftSpace ? ' ' : '';
    const nextText = `${before}${joiner}${snippet}${after}`;
    setDraft((d) => (d ? { ...d, formula: nextText } : d));
    const caret = before.length + joiner.length + snippet.length - cursorOffsetFromEnd;
    window.requestAnimationFrame(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(caret, caret);
      }
    });
  };

  const insertQuestion = (questionIndex: number) => {
    const id = ensureId(questionIndex);
    insertSnippet(id);
  };

  const toggleSelected = (questionIndex: number) => {
    const id = ensureId(questionIndex);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const wrapSelectedWith = (fnName: 'sum' | 'avg' | 'min' | 'max') => {
    if (selectedIds.size === 0) return;
    const snippet = `${fnName}(${Array.from(selectedIds).join(', ')})`;
    insertSnippet(snippet);
    setSelectedIds(new Set());
  };

  const startAdd = () => {
    setDraft({ ...emptyRule });
    setEditIndex(-1);
    setSelectedIds(new Set());
  };

  const startEdit = (index: number) => {
    setDraft({ ...scoring[index] });
    setEditIndex(index);
    setSelectedIds(new Set());
  };

  const cancelDraft = () => {
    setDraft(null);
    setEditIndex(-1);
    setSelectedIds(new Set());
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
    cancelDraft();
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
              Build a score from question responses. Example: sum 10 anxiety
              questions to produce a GAD-7 total.
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
            <div className="rounded-xl border border-Primary-DeepTeal p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Name (e.g. GAD-7 Total)"
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

              <div>
                <div className="text-[11px] text-Text-Primary font-medium mb-1">
                  Formula
                </div>
                <textarea
                  ref={formulaRef}
                  placeholder="Click questions below to insert them, then combine with operators."
                  value={draft.formula}
                  onChange={(e) =>
                    setDraft({ ...draft, formula: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md border border-Gray-50 px-2 py-1 text-[12px] font-mono"
                />
                <div className="mt-1 flex flex-wrap gap-1">
                  {OPERATOR_CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        if (chip.snippet === '()') {
                          insertSnippet('()', 1);
                        } else if (chip.snippet === 'sum()' || chip.snippet === 'avg()') {
                          insertSnippet(chip.snippet, 1);
                        } else if (chip.snippet === 'if_(, , )') {
                          insertSnippet('if_(, , )', 5);
                        } else {
                          insertSnippet(chip.snippet);
                        }
                      }}
                      className="rounded-md bg-[#F3F6F8] border border-Gray-50 px-2 py-[2px] text-[11px] hover:border-Primary-DeepTeal"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] text-Text-Primary font-medium">
                    Questions
                  </div>
                  <div className="text-[10px] text-Text-Secondary">
                    Click a row to insert its id. Use checkboxes to aggregate.
                  </div>
                </div>
                <div className="max-h-[220px] overflow-y-auto rounded-lg border border-Gray-50 bg-[#FAFBFC]">
                  {questions.length === 0 && (
                    <div className="p-3 text-[11px] text-Text-Secondary">
                      Add at least one question above before building a formula.
                    </div>
                  )}
                  {questions.map((q, index) => {
                    const displayId =
                      q.id && ID_REGEX.test(q.id)
                        ? q.id
                        : `q${q.order ?? index + 1} (auto)`;
                    const isSelected =
                      !!q.id && ID_REGEX.test(q.id) && selectedIds.has(q.id);
                    return (
                      <div
                        key={`q-picker-${index}`}
                        className="flex items-center gap-2 px-2 py-1 border-b border-Gray-50 last:border-b-0 hover:bg-white"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelected(index)}
                          className="accent-Primary-DeepTeal"
                          aria-label="Select question for aggregation"
                        />
                        <button
                          type="button"
                          onClick={() => insertQuestion(index)}
                          className="flex-1 min-w-0 flex items-center gap-2 text-left"
                        >
                          <code className="shrink-0 rounded bg-[#E8F0F3] px-1.5 py-[1px] text-[10px] text-Primary-DeepTeal">
                            {displayId}
                          </code>
                          <span className="truncate text-[11px] text-Text-Primary">
                            {q.question || '(untitled question)'}
                          </span>
                          {q.type && (
                            <span className="shrink-0 text-[10px] text-Text-Secondary">
                              · {q.type}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => insertQuestion(index)}
                          className="shrink-0 text-[10px] text-Primary-DeepTeal hover:underline"
                        >
                          + Insert
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedIds.size > 0 && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-Text-Secondary">
                      With {selectedIds.size} selected:
                    </span>
                    <button
                      type="button"
                      onClick={() => wrapSelectedWith('sum')}
                      className="rounded-md bg-Primary-DeepTeal text-white px-2 py-[2px] text-[11px]"
                    >
                      Sum
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectedWith('avg')}
                      className="rounded-md bg-Primary-DeepTeal text-white px-2 py-[2px] text-[11px]"
                    >
                      Average
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectedWith('min')}
                      className="rounded-md bg-Primary-DeepTeal text-white px-2 py-[2px] text-[11px]"
                    >
                      Min
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectedWith('max')}
                      className="rounded-md bg-Primary-DeepTeal text-white px-2 py-[2px] text-[11px]"
                    >
                      Max
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIds(new Set())}
                      className="text-[10px] text-Disable"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

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
