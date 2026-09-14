import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

export interface AdminClinicSearchOption {
  clinic_email: string;
  clinic_name: string;
}

interface AdminClinicSearchSelectProps {
  clinics: AdminClinicSearchOption[];
  value: string;
  onChange: (email: string) => void;
  loading?: boolean;
  allowAll?: boolean;
  placeholder?: string;
}

const normalize = (value?: string | null) =>
  String(value || '')
    .toLowerCase()
    .trim();

export const filterAdminClinics = (
  clinics: AdminClinicSearchOption[],
  query: string,
) => {
  const term = normalize(query);
  if (!term) return clinics;
  const tokens = term.split(/\s+/).filter(Boolean);
  return clinics.filter((clinic) => {
    const haystack = [
      clinic.clinic_name,
      clinic.clinic_email,
      clinic.clinic_email?.split('@')[0],
    ]
      .map(normalize)
      .join(' ');
    return tokens.every((token) => haystack.includes(token));
  });
};

const AdminClinicSearchSelect = ({
  clinics,
  value,
  onChange,
  loading = false,
  allowAll = true,
  placeholder = 'Search clinic email or name',
}: AdminClinicSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    position: 'fixed',
    zIndex: 9990,
    visibility: 'hidden',
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = clinics.find((clinic) => clinic.clinic_email === value) || null;
  const filtered = useMemo(
    () => filterAdminClinics(clinics, query),
    [clinics, query],
  );
  const showAllOption = allowAll && !query.trim();
  const options = useMemo(
    () =>
      showAllOption
        ? [
            { kind: 'all' as const },
            ...filtered.map((clinic) => ({ kind: 'clinic' as const, clinic })),
          ]
        : filtered.map((clinic) => ({ kind: 'clinic' as const, clinic })),
    [filtered, showAllOption],
  );

  const updateMenuPosition = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 280 && rect.top > spaceBelow;
    setMenuStyle({
      position: 'fixed',
      left: rect.left,
      width: Math.max(rect.width, 280),
      zIndex: 9990,
      visibility: 'visible',
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4, top: 'auto' }
        : { top: rect.bottom + 4, bottom: 'auto' }),
    });
  };

  useEffect(() => {
    if (!open) {
      setQuery('');
      setHighlightedIndex(0);
      return undefined;
    }
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open]);

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
  }, [query]);

  useEffect(() => {
    const option = listRef.current?.querySelector<HTMLElement>(
      `[data-option-index="${highlightedIndex}"]`,
    );
    option?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, options.length]);

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.kind === 'all' ? '' : option.clinic.clinic_email);
    setOpen(false);
    setQuery('');
  };

  const displayValue = open
    ? query
    : selected
      ? `${selected.clinic_name}  ·  ${selected.clinic_email}`
      : value || '';

  const menu = open ? (
    <div
      ref={listRef}
      style={menuStyle}
      className="max-h-72 overflow-y-auto rounded-2xl border border-Gray-50 bg-white p-1 shadow-100"
    >
      {loading && clinics.length === 0 ? (
        <div className="px-3 py-2 text-[12px] text-Text-Secondary">
          Loading clinics…
        </div>
      ) : options.length === 0 ? (
        <div className="px-3 py-2 text-[12px] text-Text-Secondary">
          No clinics match “{query}”. Try the owner email.
        </div>
      ) : (
        options.map((option, index) => {
          const active = highlightedIndex === index;
          if (option.kind === 'all') {
            return (
              <button
                key="all-clinics"
                type="button"
                data-option-index={index}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(index)}
                className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ${
                  active ? 'bg-[#E8F4F6]' : 'hover:bg-[#F8FAFB]'
                }`}
              >
                <span className="text-[12px] font-medium text-Text-Primary">
                  All clinics
                </span>
                <span className="text-[11px] text-Text-Secondary">
                  Wider reports across every clinic
                </span>
              </button>
            );
          }

          const clinic = option.clinic;
          const isSelected = clinic.clinic_email === value;
          return (
            <button
              key={clinic.clinic_email || `${clinic.clinic_name}-${index}`}
              type="button"
              data-option-index={index}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(index)}
              className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ${
                active || isSelected ? 'bg-[#E8F4F6]' : 'hover:bg-[#F8FAFB]'
              }`}
            >
              <span className="text-[12px] font-medium text-Text-Primary">
                {clinic.clinic_name || clinic.clinic_email}
              </span>
              <span className="text-[11px] text-Text-Secondary">
                {clinic.clinic_email}
              </span>
            </button>
          );
        })
      )}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className={`flex min-h-[48px] items-center rounded-2xl border bg-[#F8FAFB] px-3 ${
          open ? 'border-Primary-DeepTeal bg-white' : 'border-Gray-50'
        } ${loading && clinics.length === 0 ? 'opacity-60' : ''}`}
      >
        <Search size={14} className="mr-2 shrink-0 text-Text-Secondary" />
        <input
          ref={inputRef}
          disabled={loading && clinics.length === 0}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-label="Search clinic by email or name"
          value={displayValue}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery('');
            window.requestAnimationFrame(updateMenuPosition);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            window.requestAnimationFrame(updateMenuPosition);
          }}
          onKeyDown={(event) => {
            if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
              setOpen(true);
              return;
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setHighlightedIndex((current) =>
                Math.min(current + 1, Math.max(options.length - 1, 0)),
              );
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setHighlightedIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === 'Enter') {
              event.preventDefault();
              selectOption(highlightedIndex);
            } else if (event.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="w-full bg-transparent py-2 text-[12px] text-Text-Primary outline-none"
          autoComplete="off"
          spellCheck={false}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear clinic"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
              setQuery('');
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="ml-1 text-Text-Secondary"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="ml-1 shrink-0 text-Text-Secondary" />
        )}
      </div>
      {open && typeof document !== 'undefined'
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
};

export default AdminClinicSearchSelect;
