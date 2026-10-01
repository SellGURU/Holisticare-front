import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { GlobalDemoCandidate } from '../../../types/admin';
import { isCandidateSelectable } from './globalDemoUtils';

interface GlobalDemoClientSelectProps {
  candidates: GlobalDemoCandidate[];
  value: GlobalDemoCandidate | null;
  query: string;
  loading?: boolean;
  error?: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (candidate: GlobalDemoCandidate | null) => void;
}

const GlobalDemoClientSelect = ({
  candidates,
  value,
  query,
  loading = false,
  error = null,
  onQueryChange,
  onSelect,
}: GlobalDemoClientSelectProps) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, candidates.length]);

  useEffect(() => {
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex}"]`,
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, candidates.length]);

  const selectIndex = (index: number) => {
    const candidate = candidates[index];
    if (!candidate || !isCandidateSelectable(candidate)) return;
    onSelect(candidate);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className={`flex min-h-[48px] items-center rounded-2xl border bg-[#F8FAFB] px-3 ${
          open ? 'border-Primary-DeepTeal bg-white' : 'border-Gray-50'
        }`}
      >
        <Search size={14} className="mr-2 shrink-0 text-Text-Secondary" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-label="Search existing clients"
          value={open ? query : value ? value.display_name : query}
          placeholder="Search by name, clinic, or ID"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onSelect(null);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
              setOpen(true);
              return;
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setHighlightedIndex((current) =>
                Math.min(current + 1, Math.max(candidates.length - 1, 0)),
              );
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlightedIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              selectIndex(highlightedIndex);
            } else if (event.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="w-full bg-transparent py-2 text-[12px] text-Text-Primary outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {(query || value) && (
          <button
            type="button"
            aria-label="Clear selected client"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onQueryChange('');
              onSelect(null);
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="ml-1 text-Text-Secondary"
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && (
        <div
          ref={listRef}
          className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-2xl border border-Gray-50 bg-white p-1 shadow-100"
        >
          {loading ? (
            <div className="px-3 py-2 text-[12px] text-Text-Secondary">
              Searching clients…
            </div>
          ) : error ? (
            <div className="px-3 py-2 text-[12px] text-red-600">{error}</div>
          ) : candidates.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-Text-Secondary">
              {query.trim()
                ? `No clients match “${query}”.`
                : 'Type to search existing clients.'}
            </div>
          ) : (
            candidates.map((candidate, index) => {
              const disabled = !isCandidateSelectable(candidate);
              const active = highlightedIndex === index;
              return (
                <button
                  key={candidate.patient_id}
                  type="button"
                  data-option-index={index}
                  disabled={disabled}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectIndex(index)}
                  className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                    active ? 'bg-[#E8F4F6]' : 'hover:bg-[#F8FAFB]'
                  }`}
                >
                  <span className="flex items-center gap-2 text-[12px] font-medium text-Text-Primary">
                    {candidate.display_name}
                    {candidate.already_global && (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">
                        Global Demo
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-Text-Secondary">
                    {candidate.clinic_name || `Clinic ${candidate.clinic_id}`} ·
                    member {candidate.member_id_masked} · patient{' '}
                    {candidate.patient_id_masked}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalDemoClientSelect;
