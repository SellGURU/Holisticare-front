import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';
import {
  catalogSelectionId,
  filterCatalogBiomarkers,
} from './intelligenceApi';
import type { ClinicBiomarkerOption } from './types';

interface CatalogBiomarkerPickerProps {
  items: ClinicBiomarkerOption[];
  value: string;
  onChange: (uid: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function CatalogBiomarkerPicker({
  items,
  value,
  onChange,
  disabled,
  loading,
}: CatalogBiomarkerPickerProps) {
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterCatalogBiomarkers(items, query),
    [items, query],
  );

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [query]);

  const selected = items.find((item) => catalogSelectionId(item) === value);

  return (
    <div className="space-y-2">
      {selected ? (
        <div className="rounded-lg border border-[#10B981]/30 bg-[#F4FBFA] px-3 py-2 text-[12px] text-gray-800">
          <p className="font-medium">{selected.name}</p>
          <p className="text-[11px] text-Text-Quadruple">
            {[selected.unit, selected.benchmark_area]
              .filter(Boolean)
              .join(' · ') || 'Catalog biomarker'}
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-Text-Quadruple">
          Choose an existing Custom Biomarkers item. Parametric does not create
          a new biomarker.
        </p>
      )}

      {!disabled ? (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search existing biomarkers…"
              className="relative z-10 h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-[12px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#10B981] focus:ring-[3px] focus:ring-[#10B981]/20"
            />
          </div>
          <div
            key={query}
            ref={listRef}
            className="max-h-[240px] overflow-y-auto rounded-lg border border-gray-200 bg-white [overflow-anchor:none]"
          >
            {loading ? (
              <p className="px-3 py-6 text-center text-[12px] text-Text-Quadruple">
                Loading clinic catalog…
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12px] text-Text-Quadruple">
                {items.length === 0
                  ? 'No catalog biomarkers found. Add the biomarker in Custom Biomarkers first.'
                  : 'No matching catalog biomarkers.'}
              </p>
            ) : (
              filtered.map((item, index) => {
                const rowId = catalogSelectionId(item);
                const isSelected = rowId === value;
                const taken = Boolean(item.has_parametric) && !isSelected;
                return (
                  <button
                    key={`${rowId}-${index}`}
                    type="button"
                    disabled={taken}
                    onClick={() => onChange(rowId)}
                    className={`flex w-full items-start justify-between gap-2 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 ${
                      taken
                        ? 'cursor-not-allowed bg-gray-50 opacity-60'
                        : isSelected
                          ? 'bg-[#F4FBFA]'
                          : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[12px] font-medium text-Text-Primary">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-Text-Quadruple">
                        {[item.unit, item.benchmark_area]
                          .filter(Boolean)
                          .join(' · ') || 'No unit / category'}
                        {taken ? ' · already attached' : ''}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-[#10B981]" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
