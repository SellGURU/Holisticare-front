import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
    unknownQuestionnaires.forEach((token) => next.add(`Questionnaire.${token}`));
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
  const showSuggest = Boolean(offeringNs && suggestOpen && suggestions.length > 0);
  const isEmpty = !value;

  const pickerItems = useMemo(() => {
    if (pickerNs === 'Profile') return filterInsertableItems(profileItems, pickerQuery);
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
                {(['Questionnaire', 'Biomarker', 'Profile'] as FormulaNamespace[]).map(
                  (ns) => (
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
                  ),
                )}
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
                  <p className="px-2.5 py-3 text-[12px] text-gray-400">Loading…</p>
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
    </div>
  );
}

function toBiomarkerInsertItem(item: InsertableBiomarker): FormulaInsertableItem {
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
      <span
        key={key++}
        title={title}
        className={bad ? 'text-red-600' : color}
      >
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
