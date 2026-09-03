import { FC, useEffect, useMemo, useRef, useState } from 'react';
import FormCatalogBiomarkerPicker from './FormCatalogBiomarkerPicker';
import {
  ID_REGEX,
  formulaPartialQuestionId,
  questionFormulaKind,
  unknownFormulaIds,
  type FormCatalogItem,
} from './questionFormula';

interface CalculationsEditorProps {
  scoring: Array<ScoringRuleType>;
  onChange: (next: Array<ScoringRuleType>) => void;
  questions: Array<QuestionaryType>;
  onChangeQuestions?: (next: Array<QuestionaryType>) => void;
  catalog?: Array<FormCatalogItem>;
  catalogLoading?: boolean;
}

const emptyRule: ScoringRuleType = {
  name: '',
  is_biomarker: true,
  use_in_insight: false,
  map_to_biomarker: '',
  unit: '',
  formula: '',
};

const KIND_LABEL: Record<ReturnType<typeof questionFormulaKind>, string> = {
  numeric: 'numeric',
  scored: 'scored',
  yesno: 'yes/no',
  text: 'text',
};

const NUMBER_CHIPS: Array<{ label: string; snippet: string; offset?: number }> = [
  { label: '+', snippet: ' + ' },
  { label: '−', snippet: ' - ' },
  { label: '×', snippet: ' * ' },
  { label: '÷', snippet: ' / ' },
  { label: '( )', snippet: '()', offset: 1 },
  { label: 'sum( )', snippet: 'sum()', offset: 1 },
  { label: 'avg( )', snippet: 'avg()', offset: 1 },
];

const TEXT_CHIPS: Array<{ label: string; snippet: string; offset?: number }> = [
  { label: 'if_( )', snippet: 'if_(, , )', offset: 5 },
  { label: '== ""', snippet: ' == ""', offset: 1 },
];

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

const CalculationsEditor: FC<CalculationsEditorProps> = ({
  scoring,
  onChange,
  questions,
  onChangeQuestions,
  catalog = [],
  catalogLoading = false,
}) => {
  const [draft, setDraft] = useState<ScoringRuleType | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [outputKind, setOutputKind] = useState<'number' | 'text'>('number');
  const [questionQuery, setQuestionQuery] = useState('');
  const [caret, setCaret] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(false);
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

  const formulaUnknownIds = useMemo(() => {
    if (!draft?.formula) return [];
    return unknownFormulaIds(draft.formula, takenIds);
  }, [draft?.formula, takenIds]);

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
    const nextCaret =
      before.length + joiner.length + snippet.length - cursorOffsetFromEnd;
    window.requestAnimationFrame(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(nextCaret, nextCaret);
        setCaret(nextCaret);
      }
    });
  };

  const insertQuestion = (questionIndex: number) => {
    insertSnippet(ensureId(questionIndex));
  };

  const insertIdAtCaret = (id: string, replaceFrom?: number) => {
    const current = draft?.formula || '';
    const at = formulaRef.current?.selectionStart ?? caret;
    const start = replaceFrom ?? at;
    const nextText = `${current.slice(0, start)}${id}${current.slice(at)}`;
    setDraft((d) => (d ? { ...d, formula: nextText } : d));
    const nextCaret = start + id.length;
    setSuggestOpen(false);
    window.requestAnimationFrame(() => {
      formulaRef.current?.focus();
      formulaRef.current?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
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

  const wrapSelectedWith = (fnName: 'sum' | 'avg') => {
    if (selectedIds.size === 0) return;
    insertSnippet(`${fnName}(${Array.from(selectedIds).join(', ')})`);
    setSelectedIds(new Set());
  };

  const startAdd = (preset?: Partial<ScoringRuleType>, kind: 'number' | 'text' = 'number') => {
    setDraft({ ...emptyRule, ...preset });
    setEditIndex(-1);
    setSelectedIds(new Set());
    setOutputKind(kind);
    setQuestionQuery('');
  };

  const startEdit = (index: number) => {
    const rule = scoring[index];
    setDraft({ ...rule });
    setEditIndex(index);
    setSelectedIds(new Set());
    setOutputKind(/["']/.test(rule.formula || '') ? 'text' : 'number');
    setQuestionQuery('');
  };

  const cancelDraft = () => {
    setDraft(null);
    setEditIndex(-1);
    setSelectedIds(new Set());
  };

  const saveDraft = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.formula.trim()) return;
    if ((draft.is_biomarker ?? true) && !draft.map_to_biomarker?.trim()) return;
    if (formulaUnknownIds.length > 0) return;
    const normalizedDraft = {
      ...draft,
      map_to_biomarker: draft.map_to_biomarker?.trim() || '',
      is_biomarker: draft.is_biomarker ?? true,
      use_in_insight: draft.use_in_insight ?? draft.use_in_insights ?? false,
    };
    const next = [...scoring];
    if (editIndex >= 0) {
      next[editIndex] = normalizedDraft;
    } else {
      next.push(normalizedDraft);
    }
    onChange(next);
    cancelDraft();
  };

  const applyScoreTemplate = () => {
    const ids =
      selectedIds.size > 0
        ? Array.from(selectedIds)
        : questions
            .map((q, index) =>
              questionFormulaKind(q) === 'scored' ? ensureId(index) : '',
            )
            .filter(Boolean);
    startAdd(
      {
        name: 'Total score',
        formula: ids.length ? `sum(${ids.join(', ')})` : 'sum()',
      },
      'number',
    );
  };

  const applyNumberTemplate = () => {
    const weight = questions.findIndex((q) =>
      /weight/i.test(`${q.id || ''} ${q.question || ''}`),
    );
    const height = questions.findIndex((q) =>
      /height/i.test(`${q.id || ''} ${q.question || ''}`),
    );
    const w = weight >= 0 ? ensureId(weight) : 'q_weight';
    const h = height >= 0 ? ensureId(height) : 'q_height';
    startAdd(
      {
        name: 'BMI',
        formula: `${w} / ((${h} / 100) ** 2)`,
        round: 2,
      },
      'number',
    );
  };

  const applyTextTemplate = () => {
    const yesNo = questions.findIndex((q) => questionFormulaKind(q) === 'yesno');
    const id = yesNo >= 0 ? ensureId(yesNo) : 'q_smoke';
    startAdd(
      {
        name: 'Mapped answer',
        formula: `if_(${id} == "Yes", "Yes", "No")`,
      },
      'text',
    );
  };

  const filteredQuestions = useMemo(() => {
    const q = questionQuery.trim().toLowerCase();
    return questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => {
        if (!q) return true;
        return `${question.id || ''} ${question.question || ''} ${question.type || ''}`
          .toLowerCase()
          .includes(q);
      });
  }, [questions, questionQuery]);

  const partial = formulaPartialQuestionId(draft?.formula || '', caret);
  const suggestions = useMemo(() => {
    if (!partial || !suggestOpen) return [];
    const query = partial.query.toLowerCase();
    return questions
      .map((question, index) => ({
        id: question.id && ID_REGEX.test(question.id) ? question.id : `q${question.order ?? index + 1}`,
        question,
        index,
      }))
      .filter((item) => item.id.toLowerCase().startsWith(query) || query === 'q')
      .slice(0, 6);
  }, [partial, questions, suggestOpen]);

  useEffect(() => {
    setSuggestOpen(Boolean(partial));
  }, [partial]);

  const chips = outputKind === 'text' ? TEXT_CHIPS : NUMBER_CHIPS;
  const canSave =
    !!draft &&
    draft.name.trim() &&
    draft.formula.trim() &&
    formulaUnknownIds.length === 0 &&
    (!(draft.is_biomarker ?? true) || !!draft.map_to_biomarker?.trim());

  return (
    <div className="w-full mt-6 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-gray-800">
            Derived biomarkers
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">
            The client never sees this. Values are calculated after submit from
            earlier answers — a number or a text label.
          </p>
        </div>
        {!draft ? (
          <button
            type="button"
            onClick={() => startAdd()}
            className="inline-flex h-8 shrink-0 items-center rounded-lg bg-[#10B981] px-2.5 text-[12px] font-medium text-white hover:bg-[#10B981]/85"
          >
            + Add
          </button>
        ) : null}
      </div>

      {scoring.length === 0 && !draft ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={applyScoreTemplate}
            className="rounded-xl border border-gray-200 bg-[#FAFBFC] px-3 py-2 text-left hover:border-[#10B981]"
          >
            <div className="text-[12px] font-medium text-gray-800">
              Total a score
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">
              Sum Likert / scored questions
            </div>
          </button>
          <button
            type="button"
            onClick={applyNumberTemplate}
            className="rounded-xl border border-gray-200 bg-[#FAFBFC] px-3 py-2 text-left hover:border-[#10B981]"
          >
            <div className="text-[12px] font-medium text-gray-800">
              Calculate a number
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">
              e.g. BMI from height and weight
            </div>
          </button>
          <button
            type="button"
            onClick={applyTextTemplate}
            className="rounded-xl border border-gray-200 bg-[#FAFBFC] px-3 py-2 text-left hover:border-[#10B981]"
          >
            <div className="text-[12px] font-medium text-gray-800">
              Map answers to text
            </div>
            <div className="mt-0.5 text-[10px] text-gray-500">
              e.g. Yes → Smoker
            </div>
          </button>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {scoring.map((rule, index) => (
          <div
            key={`${rule.name}-${index}`}
            className="rounded-xl border border-gray-200 px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-gray-800">
                  {rule.name}
                  {(rule.is_biomarker ?? true) && rule.map_to_biomarker ? (
                    <span className="font-normal text-gray-500">
                      {' '}
                      → {rule.map_to_biomarker}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-gray-500 break-all">
                  {rule.formula}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#E8F0F3] px-2 py-[1px] text-[9px] text-Primary-DeepTeal">
                  {/["']/.test(rule.formula || '') ? 'Text' : 'Number'}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  className="text-[11px] text-Primary-DeepTeal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onChange(scoring.filter((_, i) => i !== index))}
                  className="text-[11px] text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft ? (
        <div className="mt-3 space-y-3 rounded-xl border border-[#10B981]/40 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-700">
                Name
              </span>
              <input
                type="text"
                placeholder="e.g. Smoking status"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="h-9 rounded-lg border border-gray-200 px-2.5 text-[12px] outline-none focus:border-[#10B981]"
              />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-700">
                Output
              </span>
              <div className="flex h-9 overflow-hidden rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setOutputKind('number')}
                  className={`flex-1 text-[12px] ${
                    outputKind === 'number'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Number
                </button>
                <button
                  type="button"
                  onClick={() => setOutputKind('text')}
                  className={`flex-1 text-[12px] ${
                    outputKind === 'text'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Text
                </button>
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-gray-700">
              Clinic biomarker
              {(draft.is_biomarker ?? true) ? (
                <span className="text-red-500"> *</span>
              ) : null}
            </span>
            {(draft.is_biomarker ?? true) ? (
              <FormCatalogBiomarkerPicker
                items={catalog}
                value={draft.map_to_biomarker || ''}
                loading={catalogLoading}
                onChange={(item) =>
                  setDraft({
                    ...draft,
                    map_to_biomarker: item?.name || '',
                    unit: draft.unit || item?.unit || '',
                  })
                }
              />
            ) : (
              <p className="text-[11px] text-gray-500">
                Not stored as a biomarker.
              </p>
            )}
          </label>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5 text-[12px]">
              <input
                type="checkbox"
                checked={draft.is_biomarker ?? true}
                onChange={(e) =>
                  setDraft({ ...draft, is_biomarker: e.target.checked })
                }
                className="accent-[#10B981]"
              />
              Save as biomarker
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5 text-[12px]">
              <input
                type="checkbox"
                checked={draft.use_in_insight ?? draft.use_in_insights ?? false}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    use_in_insight: e.target.checked,
                    use_in_insights: undefined,
                  })
                }
                className="accent-[#10B981]"
              />
              Include in insights
            </label>
          </div>

          {outputKind === 'number' ? (
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Unit (optional)"
                value={draft.unit || ''}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                className="h-9 rounded-lg border border-gray-200 px-2.5 text-[12px]"
              />
              <input
                type="number"
                placeholder="Round digits"
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
                className="h-9 rounded-lg border border-gray-200 px-2.5 text-[12px]"
              />
            </div>
          ) : null}

          <div className="relative">
            <div className="mb-1 text-[11px] font-semibold text-gray-700">
              Formula
            </div>
            <textarea
              ref={formulaRef}
              placeholder={
                outputKind === 'text'
                  ? 'if_(q_smoke == "Yes", "Smoker", "Non-smoker")'
                  : 'Click questions below, or type q_ to insert an id.'
              }
              value={draft.formula}
              onChange={(e) => {
                setDraft({ ...draft, formula: e.target.value });
                setCaret(e.target.selectionStart);
              }}
              onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
              onClick={(e) => setCaret(e.currentTarget.selectionStart)}
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-2 font-mono text-[12px] outline-none focus:border-[#10B981]"
            />
            {suggestions.length > 0 ? (
              <div className="absolute left-0 right-0 z-10 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      const qid = ensureId(item.index);
                      insertIdAtCaret(qid, partial?.start);
                    }}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[12px] hover:bg-gray-50"
                  >
                    <code className="rounded bg-[#E8F0F3] px-1.5 text-[10px] text-Primary-DeepTeal">
                      {item.id}
                    </code>
                    <span className="truncate text-gray-700">
                      {item.question.question}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-1 flex flex-wrap gap-1">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => insertSnippet(chip.snippet, chip.offset || 0)}
                  className="rounded-md border border-gray-200 bg-[#F3F6F8] px-2 py-[2px] text-[11px] hover:border-[#10B981]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {formulaUnknownIds.length > 0 ? (
              <div className="mt-1 text-[10px] text-red-500">
                Unknown variable
                {formulaUnknownIds.length > 1 ? 's' : ''}:{' '}
                {formulaUnknownIds.join(', ')}.
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[11px] font-semibold text-gray-700">
                Questions
              </div>
              <input
                type="text"
                value={questionQuery}
                onChange={(e) => setQuestionQuery(e.target.value)}
                placeholder="Search…"
                className="h-7 w-[140px] rounded-md border border-gray-200 px-2 text-[11px]"
              />
            </div>
            <div className="max-h-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-[#FAFBFC]">
              {filteredQuestions.length === 0 ? (
                <div className="p-3 text-[11px] text-gray-500">
                  Add questions above first.
                </div>
              ) : (
                filteredQuestions.map(({ question: q, index }) => {
                  const displayId =
                    q.id && ID_REGEX.test(q.id)
                      ? q.id
                      : `q${q.order ?? index + 1} (auto)`;
                  const isSelected =
                    !!q.id && ID_REGEX.test(q.id) && selectedIds.has(q.id);
                  const kind = questionFormulaKind(q);
                  return (
                    <div
                      key={`q-picker-${index}`}
                      className="flex items-center gap-2 border-b border-gray-100 px-2 py-1 last:border-b-0 hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(index)}
                        className="accent-[#10B981]"
                        aria-label="Select question for aggregation"
                      />
                      <button
                        type="button"
                        onClick={() => insertQuestion(index)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <code className="shrink-0 rounded bg-[#E8F0F3] px-1.5 py-[1px] text-[10px] text-Primary-DeepTeal">
                          {displayId}
                        </code>
                        <span className="truncate text-[11px] text-gray-800">
                          {q.question || '(untitled)'}
                        </span>
                        <span className="shrink-0 text-[10px] text-gray-500">
                          {KIND_LABEL[kind]}
                        </span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            {selectedIds.size > 0 && outputKind === 'number' ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-gray-500">
                  With {selectedIds.size} selected:
                </span>
                <button
                  type="button"
                  onClick={() => wrapSelectedWith('sum')}
                  className="rounded-md bg-[#10B981] px-2 py-[2px] text-[11px] text-white"
                >
                  Sum
                </button>
                <button
                  type="button"
                  onClick={() => wrapSelectedWith('avg')}
                  className="rounded-md bg-[#10B981] px-2 py-[2px] text-[11px] text-white"
                >
                  Average
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[10px] text-gray-400"
                >
                  Clear
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={cancelDraft}
              className="text-[11px] text-gray-400"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={!canSave}
              className={`text-[11px] ${
                canSave
                  ? 'font-medium text-[#10B981]'
                  : 'cursor-not-allowed text-gray-300'
              }`}
            >
              {editIndex >= 0 ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CalculationsEditor;
