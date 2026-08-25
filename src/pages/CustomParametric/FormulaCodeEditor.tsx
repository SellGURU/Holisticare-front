import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  filterInsertable,
  formulaPartialAtCaret,
  insertBiomarkerToken,
  shouldOfferBiomarkerSuggestions,
  toInsertableBiomarkers,
  unknownBiomarkerTokens,
  type InsertableBiomarker,
} from './formulaBiomarker';

export { formulaHasUnknownBiomarkers } from './formulaBiomarker';

interface FormulaCodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  catalog: Array<{ name: string; unit?: string }>;
  placeholder?: string;
  rows?: number;
  textareaClassName?: string;
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
}: FormulaCodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);
  const [caret, setCaret] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const [suggestOpen, setSuggestOpen] = useState(true);

  const catalogNames = useMemo(
    () => catalog.map((item) => item.name),
    [catalog],
  );
  const insertable = useMemo(() => toInsertableBiomarkers(catalog), [catalog]);
  const unknown = useMemo(
    () => unknownBiomarkerTokens(value, catalogNames),
    [value, catalogNames],
  );
  const unknownSet = useMemo(() => new Set(unknown), [unknown]);
  const partial = formulaPartialAtCaret(value, caret);
  const offering = shouldOfferBiomarkerSuggestions(value, caret, insertable);
  const suggestions = useMemo(() => {
    if (!partial || !offering) return [];
    return filterInsertable(insertable, partial.query);
  }, [insertable, partial, offering]);
  const showSuggest = Boolean(offering && suggestOpen && suggestions.length > 0);
  const isEmpty = !value;

  useEffect(() => {
    setHighlight(0);
    setSuggestOpen(offering);
  }, [partial?.query, partial?.start, offering]);

  const applyInsert = (item: InsertableBiomarker) => {
    const el = textareaRef.current;
    const at = el ? el.selectionStart : caret;
    const { next, caret: nextCaret } = insertBiomarkerToken(value, at, item.token);
    setSuggestOpen(false);
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-[#10B981] focus-within:ring-[3px] focus-within:ring-[#10B981]/20">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-1.5">
          <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
            Formula editor
          </span>
          <span className="font-mono text-[10px] text-gray-400">
            Type Biomarker. to autocomplete
          </span>
        </div>
        <div className="relative">
          <pre
            ref={overlayRef}
            aria-hidden
            className={`pointer-events-none absolute inset-0 m-0 overflow-hidden bg-white text-gray-800 ${EDITOR_PAD} ${textareaClassName} ${
              isEmpty ? 'opacity-0' : ''
            }`}
          >
            {renderHighlighted(value, unknownSet)}
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
            className={`relative z-[1] w-full min-w-0 resize-y rounded-none border-0 bg-transparent outline-none ${EDITOR_PAD} ${
              isEmpty ? 'text-gray-800' : 'text-transparent caret-gray-800'
            } ${textareaClassName}`}
          />
        </div>
      </div>

      {showSuggest ? (
        <div
          role="listbox"
          aria-label="Biomarker suggestions"
          className="max-h-[92px] w-full max-w-[280px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm"
        >
          {suggestions.map((item, index) => (
            <button
              key={`${item.token}-${item.name}`}
              type="button"
              role="option"
              aria-selected={index === highlight}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyInsert(item)}
              className={`flex w-full items-center gap-2 px-2 py-1 text-left ${
                index === highlight ? 'bg-[#F4FBFA]' : 'hover:bg-gray-50'
              }`}
            >
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-gray-800">
                {item.name}
              </span>
              <span className="shrink-0 font-mono text-[10px] text-gray-400">
                .{item.token}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-[11px] text-gray-500">
        One expression only — no <span className="font-mono">score =</span> and
        no dictionaries. Functions:{" "}
        <span className="font-mono">
          round min max abs sqrt sum avg if_ status_weight(value, optimal,
          disease)
        </span>
        .
      </p>

      {unknown.length > 0 ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] text-red-700">
          Unknown biomarker
          {unknown.length > 1 ? 's' : ''}:{' '}
          {unknown.map((token) => (
            <span key={token} className="mr-1 font-mono">
              Biomarker.{token}
            </span>
          ))}
          — pick a name from the clinic catalog.
        </p>
      ) : extractHint(value) ? (
        <p className="text-[11px] text-emerald-700">
          Biomarker names in this formula match the clinic catalog.
        </p>
      ) : (
        <p className="text-[11px] text-gray-500">
          Height and Weight are always valid. Other names must exist in Custom
          Biomarkers.
        </p>
      )}
    </div>
  );
}

function renderHighlighted(formula: string, unknownSet: Set<string>) {
  const text = formula || '';
  const re = /\bBiomarker\.([A-Za-z_][A-Za-z0-9_]*)\b/g;
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > last) {
      parts.push(<span key={key++}>{text.slice(last, idx)}</span>);
    }
    const token = match[1];
    const bad = unknownSet.has(token);
    parts.push(
      <span
        key={key++}
        className={bad ? 'rounded-sm bg-red-50 text-red-600' : 'text-[#059669]'}
      >
        {match[0]}
      </span>,
    );
    last = idx + match[0].length;
  }
  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>);
  }
  return parts.length > 0 ? parts : ' ';
}

function extractHint(formula: string): boolean {
  return /\bBiomarker\.[A-Za-z_]/.test(formula);
}
