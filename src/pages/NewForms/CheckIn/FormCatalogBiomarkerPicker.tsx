import { FC, useEffect, useMemo, useRef, useState } from 'react';
import type { FormCatalogItem } from './questionFormula';

interface FormCatalogBiomarkerPickerProps {
  items: Array<FormCatalogItem>;
  value: string;
  onChange: (item: FormCatalogItem | null) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

const FormCatalogBiomarkerPicker: FC<FormCatalogBiomarkerPickerProps> = ({
  items,
  value,
  onChange,
  loading,
  disabled,
  error,
  placeholder = 'Search clinic biomarkers…',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = items.find((item) => item.name === value);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 40);
    return items
      .filter((item) => {
        const hay = [item.name, item.unit, item.value_type]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 40);
  }, [items, query]);

  const typeLabel = (item?: FormCatalogItem) => {
    const kind = String(item?.value_type || '').toLowerCase();
    if (['string', 'text', 'categorical', 'qualitative'].includes(kind)) {
      return 'text';
    }
    if (kind) return 'number';
    return item?.unit || '';
  };

  return (
    <div ref={rootRef} className="relative w-full">
      {selected && !open ? (
        <div
          className={`flex items-center justify-between gap-2 rounded-lg border bg-white px-2.5 py-1.5 ${
            error ? 'border-Red' : 'border-gray-200'
          }`}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setQuery('');
              setOpen(true);
            }}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block truncate text-[12px] font-medium text-gray-800">
              {selected.name}
            </span>
            <span className="block text-[10px] text-gray-500">
              {[typeLabel(selected), selected.unit].filter(Boolean).join(' · ') ||
                'Catalog biomarker'}
            </span>
          </button>
          {!disabled ? (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-[11px] text-gray-500 hover:text-gray-800"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : (
        <input
          type="text"
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`h-9 w-full rounded-lg border bg-white px-2.5 text-[12px] text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#10B981] focus:ring-[3px] focus:ring-[#10B981]/20 ${
            error ? 'border-Red' : 'border-gray-200'
          }`}
        />
      )}
      {open && !disabled ? (
        <div className="absolute z-20 mt-1 max-h-[200px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <p className="px-3 py-4 text-center text-[12px] text-gray-500">
              Loading clinic catalog…
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-[12px] text-gray-500">
              {items.length === 0
                ? 'No catalog biomarkers found. Add one in Custom Biomarkers first.'
                : 'No matching catalog biomarkers.'}
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onChange(item);
                  setQuery('');
                  setOpen(false);
                }}
                className={`flex w-full items-start justify-between gap-2 border-b border-gray-100 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50 ${
                  item.name === value ? 'bg-[#F4FBFA]' : ''
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-gray-800">
                    {item.name}
                  </span>
                  <span className="block text-[10px] text-gray-500">
                    {[typeLabel(item), item.unit].filter(Boolean).join(' · ') ||
                      'Catalog biomarker'}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default FormCatalogBiomarkerPicker;
