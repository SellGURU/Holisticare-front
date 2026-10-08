import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookOpen, Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import {
  filterInsertable,
  insertBiomarkerToken,
  shouldOfferBiomarkerSuggestions,
  toInsertableBiomarkers,
  unknownBiomarkerTokens,
  type InsertableBiomarker,
} from './formulaBiomarker';
import {
  extractNamespacedTokens,
  filterInsertableItems,
  formatValueType,
  formulaSuggestTriggerAtCaret,
  groupQuestionnairesByForm,
  insertNamespacedToken,
  readableFormulaLabel,
  toInsertableProfile,
  toInsertableQuestionnaires,
  unknownProfileTokens,
  unknownQuestionnaireTokens,
  type FormulaInsertableItem,
  type FormulaNamespace,
  type FormulaOptionsCatalog,
} from './formulaTokens';

export { formulaHasUnknownBiomarkers } from './formulaBiomarker';

interface FormulaCodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  catalog: Array<{ name: string; unit?: string }>;
  placeholder?: string;
  rows?: number;
  textareaClassName?: string;
  formulaOptions?: FormulaOptionsCatalog | null;
  showInsertPanel?: boolean;
  optionsLoading?: boolean;
  onInsertOpen?: () => void;
}

const EDITOR_PAD =
  'px-3 py-2.5 font-mono text-[12px] leading-[1.7] whitespace-pre-wrap break-words';

export default function FormulaCodeEditor({
  value,
  onChange,
  catalog,
  placeholder,
  rows = 6,
  textareaClassName = '',
  formulaOptions,
  showInsertPanel = false,
  optionsLoading = false,
  onInsertOpen,
}: FormulaCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);
  const insertRef = useRef<HTMLDivElement>(null);
  const [caret, setCaret] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerNs, setPickerNs] = useState<FormulaNamespace>('Questionnaire');
  const [pickerQuery, setPickerQuery] = useState('');

  const catalogNames = useMemo(
    () => catalog.map((item) => item.name),
    [catalog],
  );
  const insertable = useMemo(() => toInsertableBiomarkers(catalog), [catalog]);
  const profileItems = useMemo(
    () =>
      toInsertableProfile(
        formulaOptions?.profile?.length
          ? formulaOptions.profile
          : [{ token: 'age', label: 'Age', unit: 'years' }],
      ),
    [formulaOptions?.profile],
  );
  const questionnaireItems = useMemo(
    () => toInsertableQuestionnaires(formulaOptions?.questionnaires || []),
    [formulaOptions?.questionnaires],
  );
  const allLabeledItems = useMemo((): FormulaInsertableItem[] => {
    return [
      ...insertable.map(toBiomarkerInsertItem),
      ...profileItems,
      ...questionnaireItems,
    ];
  }, [insertable, profileItems, questionnaireItems]);
  const unknown = useMemo(
    () => unknownBiomarkerTokens(value, catalogNames),
    [value, catalogNames],
  );
  const unknownProfiles = useMemo(() => unknownProfileTokens(value), [value]);
  const unknownQuestionnaires = useMemo(
    () =>
      unknownQuestionnaireTokens(
        value,
        questionnaireItems.map((item) => item.token),
      ),
    [value, questionnaireItems],
  );
  const unknownSet = useMemo(() => {
    const next = new Set(unknown.map((token) => `Biomarker.${token}`));
    unknownProfiles.forEach((token) => next.add(`Profile.${token}`));
    unknownQuestionnaires.forEach((token) =>
      next.add(`Questionnaire.${token}`),
    );
    return next;
  }, [unknown, unknownProfiles, unknownQuestionnaires]);

  const trigger = formulaSuggestTriggerAtCaret(value, caret);
  const offeringBiomarker = shouldOfferBiomarkerSuggestions(
    value,
    caret,
    insertable,
  );
  const offeringNs = Boolean(
    trigger &&
      (trigger.namespace === 'Biomarker'
        ? offeringBiomarker
        : trigger.namespace === 'Profile' || showInsertPanel),
  );
  const suggestions = useMemo((): FormulaInsertableItem[] => {
    if (!offeringNs || !trigger) return [];
    if (trigger.namespace === 'Biomarker') {
      return filterInsertable(insertable, trigger.query)
        .slice(0, 8)
        .map(toBiomarkerInsertItem);
    }
    if (trigger.namespace === 'Profile') {
      return filterInsertableItems(profileItems, trigger.query).slice(0, 8);
    }
    return filterInsertableItems(questionnaireItems, trigger.query).slice(0, 8);
  }, [offeringNs, trigger, insertable, profileItems, questionnaireItems]);
  const showSuggest = Boolean(
    offeringNs && suggestOpen && suggestions.length > 0,
  );
  const isEmpty = !value;

  const pickerItems = useMemo(() => {
    if (pickerNs === 'Profile')
      return filterInsertableItems(profileItems, pickerQuery);
    if (pickerNs === 'Questionnaire') {
      return filterInsertableItems(questionnaireItems, pickerQuery);
    }
    return filterInsertable(insertable, pickerQuery).map(toBiomarkerInsertItem);
  }, [pickerNs, pickerQuery, profileItems, questionnaireItems, insertable]);
  const groupedQuestions = useMemo(
    () => groupQuestionnairesByForm(pickerItems),
    [pickerItems],
  );
  const usedFields = useMemo(() => {
    return extractNamespacedTokens(value, 'Questionnaire').map((token) => {
      const item = questionnaireItems.find((row) => row.token === token);
      return (
        item || {
          namespace: 'Questionnaire' as const,
          token,
          label: token,
        }
      );
    });
  }, [value, questionnaireItems]);

  useEffect(() => {
    setHighlight(0);
    setSuggestOpen(offeringNs);
  }, [trigger?.query, trigger?.start, trigger?.namespace, offeringNs]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!insertRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [pickerOpen]);

  const applyInsert = (item: FormulaInsertableItem | InsertableBiomarker) => {
    const el = textareaRef.current;
    const at = el ? el.selectionStart : caret;
    const namespace =
      'namespace' in item ? item.namespace : ('Biomarker' as const);
    const { next, caret: nextCaret } =
      namespace === 'Biomarker' && !showInsertPanel
        ? insertBiomarkerToken(value, at, item.token)
        : insertNamespacedToken(value, at, namespace, item.token);
    setSuggestOpen(false);
    setPickerOpen(false);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
    });
  };

  const syncCaret = () => {
    const el = textareaRef.current;
    if (el) setCaret(el.selectionStart);
  };

  const syncScroll = () => {
    const el = textareaRef.current;
    const overlay = overlayRef.current;
    if (!el || !overlay) return;
    overlay.scrollTop = el.scrollTop;
    overlay.scrollLeft = el.scrollLeft;
  };

  return (
    <div className="space-y-1.5">
      {showInsertPanel ? (
        <div ref={insertRef} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPickerOpen((open) => {
                const next = !open;
                if (next) onInsertOpen?.();
                return next;
              });
            }}
            className="h-8 shrink-0 rounded-md border border-gray-200 bg-white px-2.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
          >
            Insert field
          </button>
          {usedFields.length > 0 ? (
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
              {usedFields.map((item) => (
                <span
                  key={item.token}
                  title={`Questionnaire.${item.token}`}
                  className="max-w-[180px] truncate rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700"
                >
                  {readableFormulaLabel(
                    'Questionnaire',
                    item.token,
                    questionnaireItems,
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="truncate text-[11px] text-gray-400">
              Type quest or Biomarker. — or insert a field
            </p>
          )}
          {pickerOpen ? (
            <div className="absolute top-[calc(100%+6px)] left-0 z-30 w-[min(100%,320px)] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <div className="flex gap-1 border-b border-gray-100 p-1.5">
                {(
                  [
                    'Questionnaire',
                    'Biomarker',
                    'Profile',
                  ] as FormulaNamespace[]
                ).map((ns) => (
                  <button
                    key={ns}
                    type="button"
                    onClick={() => {
                      setPickerNs(ns);
                      setPickerQuery('');
                    }}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                      pickerNs === ns
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {ns}
                  </button>
                ))}
              </div>
              <input
                autoFocus
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder={
                  pickerNs === 'Questionnaire'
                    ? 'Search question or form'
                    : `Search ${pickerNs.toLowerCase()}`
                }
                className="h-8 w-full border-b border-gray-100 px-2.5 text-[12px] outline-none"
              />
              <div className="max-h-[168px] overflow-y-auto">
                {optionsLoading ? (
                  <p className="px-2.5 py-3 text-[12px] text-gray-400">
                    Loading…
                  </p>
                ) : pickerNs === 'Questionnaire' &&
                  questionnaireItems.length === 0 ? (
                  <p className="px-2.5 py-3 text-[12px] text-gray-400">
                    No questionnaire questions for this clinic.
                  </p>
                ) : pickerItems.length === 0 ? (
                  <p className="px-2.5 py-3 text-[12px] text-gray-400">
                    No matches.
                  </p>
                ) : pickerNs === 'Questionnaire' ? (
                  groupedQuestions.map((group) => (
                    <div key={group.form}>
                      <p className="sticky top-0 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-400">
                        {group.form}
                      </p>
                      {group.items.map((item) => (
                        <InsertRow
                          key={`${item.namespace}.${item.token}`}
                          item={item}
                          onInsert={applyInsert}
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  pickerItems.map((item) => (
                    <InsertRow
                      key={`${item.namespace}.${item.token}`}
                      item={item}
                      onInsert={applyInsert}
                    />
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white focus-within:border-[#10B981] focus-within:ring-[3px] focus-within:ring-[#10B981]/20">
        <div className="relative">
          <pre
            ref={overlayRef}
            aria-hidden
            className={`pointer-events-none absolute inset-0 m-0 overflow-hidden bg-white text-gray-800 ${EDITOR_PAD} ${textareaClassName} ${
              isEmpty ? 'opacity-0' : ''
            }`}
          >
            {renderHighlighted(value, unknownSet, allLabeledItems)}
            {value.endsWith('\n') ? '\n' : null}
          </pre>
          <textarea
            ref={textareaRef}
            value={value}
            rows={rows}
            placeholder={placeholder}
            spellCheck={false}
            onChange={(e) => {
              onChange(e.target.value);
              setCaret(e.target.selectionStart);
            }}
            onClick={syncCaret}
            onKeyUp={syncCaret}
            onSelect={syncCaret}
            onScroll={syncScroll}
            onKeyDown={(e) => {
              if (!showSuggest) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight((i) => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight((i) => Math.max(i - 1, 0));
              } else if (e.key === 'Enter' || e.key === 'Tab') {
                const item = suggestions[highlight];
                if (item) {
                  e.preventDefault();
                  applyInsert(item);
                }
              } else if (e.key === 'Escape') {
                setSuggestOpen(false);
              }
            }}
            className={`relative z-[1] w-full min-w-0 resize-y rounded-lg border-0 bg-transparent outline-none ${EDITOR_PAD} ${
              isEmpty ? 'text-gray-800' : 'text-transparent caret-gray-800'
            } ${textareaClassName}`}
          />
        </div>
      </div>

      {showSuggest ? (
        <div
          role="listbox"
          aria-label="Formula suggestions"
          className="max-h-[132px] w-[min(100%,260px)] overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-sm"
        >
          {suggestions.map((item, index) => (
            <button
              key={`${item.namespace}.${item.token}`}
              type="button"
              role="option"
              aria-selected={index === highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInsert(item)}
              className={`flex w-full items-center gap-2 px-2 py-1 text-left ${
                index === highlight ? 'bg-[#F4FBFA]' : 'hover:bg-gray-50'
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-[12px] text-gray-800">
                {item.label}
              </span>
              {item.detail ? (
                <span className="max-w-[88px] shrink-0 truncate text-[10px] text-gray-400">
                  {item.detail}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {unknown.length > 0 ? (
        <p className="text-[11px] text-red-600">
          Unknown biomarker
          {unknown.length > 1 ? 's' : ''}:{' '}
          {unknown.map((token) => `Biomarker.${token}`).join(', ')}
        </p>
      ) : unknownQuestionnaires.length > 0 && showInsertPanel ? (
        <p className="text-[11px] text-red-600">
          Unknown questionnaire field
          {unknownQuestionnaires.length > 1 ? 's' : ''}:{' '}
          {unknownQuestionnaires
            .map((token) =>
              readableFormulaLabel('Questionnaire', token, questionnaireItems),
            )
            .join(', ')}
        </p>
      ) : null}

      <FormulaDocumentation
        catalog={catalog}
        profileItems={profileItems}
        questionnaireItems={questionnaireItems}
        multiSourceEnabled={formulaOptions?.multiSourceEnabled !== false}
      />
    </div>
  );
}

function FormulaDocumentation({
  catalog,
  profileItems,
  questionnaireItems,
  multiSourceEnabled,
}: {
  catalog: Array<{ name: string; unit?: string }>;
  profileItems: FormulaInsertableItem[];
  questionnaireItems: FormulaInsertableItem[];
  multiSourceEnabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );

  const documentationText = useMemo(() => {
    const biomarkers = catalog.length
      ? catalog
          .map(
            (item) =>
              `- Biomarker.${item.name.replace(/\s/g, '_')}${item.unit ? ` (${item.unit})` : ''}`,
          )
          .join('\n')
      : '- No biomarkers are currently available.';
    const profiles = profileItems.length
      ? profileItems
          .map(
            (item) =>
              `- Profile.${item.token}${item.unit ? ` (${item.unit})` : ''}`,
          )
          .join('\n')
      : '- Profile.age';
    const questionnaires =
      multiSourceEnabled && questionnaireItems.length
        ? questionnaireItems
            .map(
              (item) =>
                `- Questionnaire.${item.token} — ${item.label}${item.valueType ? ` [${item.valueType}]` : ''}`,
            )
            .join('\n')
        : '- No questionnaire fields are currently available.';

    return `HOLISTICARE FORMULA DOCUMENTATION

SYNTAX
- Write one Python-style expression; do not use imports, assignments, loops, classes, or custom functions.
- Use exact field tokens from the lists below: Biomarker.<token>, Profile.<token>, or Questionnaire.<token>.
- Supported arithmetic: +, -, *, /, ** and parentheses.
- Supported comparisons and logic: <, <=, >, >=, ==, !=, and, or, not.
- Conditional expression: value_if_true if condition else value_if_false.
- Literals: numbers, quoted strings, True, False, None.

SUPPORTED FUNCTIONS
- sum(...), avg(...), min(...), max(...)
- round(value, digits), abs(value), sqrt(value)
- ln(value), log(value), exp(value)
- if_(condition, value_if_true, value_if_false)
- status_weight(value, optimal_threshold, high_risk_threshold)
- phenoage(albumin, creatinine, glucose, crp, lymphocytes, mcv, rdw, alp, wbc, age)

IMPORTANT RULES
- The final result must be one finite numeric value.
- Copy field tokens exactly; never invent or rename them.
- Keep units consistent and convert them inside the expression when required.
- Protect division with max(denominator, 0.001) when the denominator may be zero.
- Questionnaire answers must be numeric, scored, or explicitly compared to a quoted value.
- Risk formulas normally return 0–100 with higher = worse.
- Health scores normally return 0–100 with higher = better.
- Parametric biomarkers return a value in the biomarker's declared unit.
- Use round(expression, 2) for a two-decimal result.

COMPLEX EXAMPLES

1. Weighted multi-biomarker risk:
round((
  status_weight(Biomarker.C_Reactive_Protein_high_sensitivity, 1.0, 3.0) * 0.45 +
  status_weight(Biomarker.Homocysteine, 8, 15) * 0.20 +
  status_weight(Biomarker.Fibrinogen, 250, 400) * 0.15 +
  status_weight(Biomarker.Erythrocyte_Sedimentation_Rate, 8, 30) * 0.10 +
  status_weight(Biomarker.White_Blood_Cells, 6000, 11000) * 0.10
) * 100, 2)

2. Health score where higher is better:
round((1 - (
  status_weight(Biomarker.Hb_A1c, 5.2, 6.5) * 0.6 +
  status_weight(Biomarker.Glucose, 90, 126) * 0.4
)) * 100, 2)

3. Biomarker risk plus questionnaire modifier, capped at 100:
min(
  status_weight(Biomarker.Homocysteine, 8, 15) * 85 +
  if_(Questionnaire.smoking_status == "Current", 15, 0),
  100
)

4. Age-dependent thresholds:
round(status_weight(
  Biomarker.Example,
  10 if Profile.age < 50 else 12,
  20 if Profile.age < 50 else 24
) * 100, 2)

5. Safe parametric ratio:
round(Biomarker.Weight / max((Biomarker.Height / 100) ** 2, 0.0001), 2)

6. PhenoAge with required unit conversions:
round(phenoage(
  Biomarker.Albumin * 0.0665,
  Biomarker.Creatinine,
  Biomarker.Glucose / 18,
  max(Biomarker.C_Reactive_Protein_high_sensitivity / 10, 0.001),
  Biomarker.Lymphocytes,
  Biomarker.Mean_Corpuscular_Volume,
  Biomarker.Red_Cell_Distribution_Width,
  Biomarker.Alkaline_Phosphatase,
  Biomarker.White_Blood_Cells / 1000,
  Profile.age
), 2)

AVAILABLE BIOMARKERS
${biomarkers}

AVAILABLE PROFILE FIELDS
${profiles}

AVAILABLE QUESTIONNAIRE FIELDS
${questionnaires}

FORMULA REQUIREMENT
[Describe the desired calculation, output range, thresholds, weights, and units here.]`;
  }, [catalog, multiSourceEnabled, profileItems, questionnaireItems]);

  const copyDocumentation = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(documentationText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = documentationText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('Copy command failed');
      }
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50/60">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-2 text-left text-[11px] font-semibold text-gray-700 hover:text-gray-950"
        >
          <BookOpen className="size-3.5 shrink-0 text-[#059669]" />
          <span>Formula documentation</span>
          {open ? (
            <ChevronUp className="size-3.5 shrink-0 text-gray-400" />
          ) : (
            <ChevronDown className="size-3.5 shrink-0 text-gray-400" />
          )}
        </button>
        <button
          type="button"
          onClick={copyDocumentation}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 text-[10px] font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
          title="Copy the formula rules and this clinic's available fields"
        >
          {copyState === 'copied' ? (
            <Check className="size-3 text-emerald-600" />
          ) : (
            <Copy className="size-3" />
          )}
          {copyState === 'copied'
            ? 'Copied'
            : copyState === 'failed'
              ? 'Copy failed'
              : 'Copy documentation'}
        </button>
      </div>

      {open ? (
        <div className="max-h-[380px] space-y-4 overflow-y-auto border-t border-gray-200 bg-white px-3 py-3 text-[11px] leading-relaxed text-gray-600">
          <section>
            <h4 className="font-semibold text-gray-900">Syntax and fields</h4>
            <p>
              Write one Python-style expression using exact{' '}
              <code>Biomarker.*</code>, <code>Profile.*</code>, or{' '}
              <code>Questionnaire.*</code> tokens. Operators include{' '}
              <code>+ - * / **</code>, comparisons, boolean logic, and
              conditional expressions.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900">Supported functions</h4>
            <p className="mt-1 font-mono text-[10px]">
              sum · avg · min · max · round · abs · sqrt · ln · log · exp · if_
              · status_weight · phenoage
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900">Important rules</h4>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              <li>Return one finite numeric result.</li>
              <li>Keep units and clinical direction consistent.</li>
              <li>Guard division by zero and other invalid operations.</li>
              <li>Use only fields available in this clinic.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900">Complex examples</h4>
            <div className="mt-1 space-y-1.5">
              <pre className="overflow-x-auto rounded-md bg-gray-950 p-2 text-[10px] leading-relaxed text-gray-100 whitespace-pre-wrap">
                {`round((
  status_weight(Biomarker.C_Reactive_Protein_high_sensitivity, 1, 3) * 0.6 +
  status_weight(Biomarker.Homocysteine, 8, 15) * 0.4
) * 100, 2)`}
              </pre>
              <pre className="overflow-x-auto rounded-md bg-gray-950 p-2 text-[10px] leading-relaxed text-gray-100 whitespace-pre-wrap">
                {`min(
  status_weight(Biomarker.Homocysteine, 8, 15) * 85 +
  if_(Questionnaire.smoking_status == "Current", 15, 0),
  100
)`}
              </pre>
              <pre className="overflow-x-auto rounded-md bg-gray-950 p-2 text-[10px] leading-relaxed text-gray-100 whitespace-pre-wrap">
                {`round(status_weight(
  Biomarker.Example,
  10 if Profile.age < 50 else 12,
  20 if Profile.age < 50 else 24
) * 100, 2)`}
              </pre>
            </div>
          </section>

          <p className="rounded-md border border-emerald-100 bg-emerald-50 p-2 text-emerald-800">
            “Copy documentation” also includes the full examples and all{' '}
            <strong>{catalog.length} biomarkers</strong>, profile fields, and
            questionnaire fields available in this clinic.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function toBiomarkerInsertItem(
  item: InsertableBiomarker,
): FormulaInsertableItem {
  return {
    namespace: 'Biomarker',
    token: item.token,
    label: item.name,
    unit: item.unit,
  };
}

function InsertRow({
  item,
  onInsert,
}: {
  item: FormulaInsertableItem;
  onInsert: (item: FormulaInsertableItem) => void;
}) {
  const typeLabel = formatValueType(item.valueType);
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onInsert(item)}
      className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-gray-50"
    >
      <span className="min-w-0 flex-1 truncate text-[12px] text-gray-800">
        {item.label}
      </span>
      <span className="shrink-0 text-[10px] text-gray-400">
        {typeLabel || item.unit || item.detail || ''}
      </span>
    </button>
  );
}

function renderHighlighted(
  formula: string,
  unknownSet: Set<string>,
  items: FormulaInsertableItem[],
) {
  const text = formula || '';
  const re = /\b(Biomarker|Profile|Questionnaire)\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      parts.push(<span key={key++}>{text.slice(last, idx)}</span>);
    }
    const full = match[0];
    const namespace = match[1] as FormulaNamespace;
    const token = match[2];
    const bad = unknownSet.has(full);
    const title = readableFormulaLabel(namespace, token, items);
    const color =
      namespace === 'Questionnaire'
        ? 'text-indigo-600'
        : namespace === 'Profile'
          ? 'text-sky-600'
          : 'text-[#059669]';
    parts.push(
      <span key={key++} title={title} className={bad ? 'text-red-600' : color}>
        {full}
      </span>,
    );
    last = idx + full.length;
  }
  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>);
  }
  return parts.length > 0 ? parts : ' ';
}
