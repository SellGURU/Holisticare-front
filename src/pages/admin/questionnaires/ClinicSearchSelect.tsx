import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { AdminClinicOption } from './types';

interface ClinicSearchSelectProps {
  clinics: AdminClinicOption[];
  value: number | '';
  onChange: (clinicId: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
}

const clinicLabel = (clinic: AdminClinicOption) =>
  `${clinic.name || `Clinic #${clinic.clinic_id}`} (${clinic.clinic_id})`;

const clinicMatches = (clinic: AdminClinicOption, term: string) => {
  const haystack = [
    clinic.name,
    String(clinic.clinic_id),
    clinic.primary_email,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(term);
};

const ClinicSearchSelect = ({
  clinics,
  value,
  onChange,
  placeholder = 'Search clinic name, email, or ID',
  disabled = false,
}: ClinicSearchSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = clinics.find((clinic) => clinic.clinic_id === value) || null;

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clinics;
    return clinics.filter((clinic) => clinicMatches(clinic, term));
  }, [clinics, query]);

  return (
    <div ref={rootRef} className="relative w-full">
      <div
        className={`flex min-h-[36px] items-center rounded-2xl border border-Gray-50 bg-[#F8FAFB] px-3 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <Search size={14} className="mr-2 shrink-0 text-Text-Secondary" />
        <input
          ref={inputRef}
          disabled={disabled}
          value={open ? query : selected ? clinicLabel(selected) : ''}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          className="w-full bg-transparent py-2 text-[12px] text-Text-Primary outline-none"
        />
        {selected && !disabled ? (
          <button
            type="button"
            aria-label="Clear clinic"
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
      {open && !disabled ? (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-Gray-50 bg-white p-1 shadow-100">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-[12px] text-Text-Secondary">
              No clinics match “{query}”.
            </div>
          ) : (
            filtered.map((clinic) => {
              const active = clinic.clinic_id === value;
              return (
                <button
                  key={clinic.clinic_id}
                  type="button"
                  onClick={() => {
                    onChange(clinic.clinic_id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ${
                    active ? 'bg-[#E8F4F6]' : 'hover:bg-[#F8FAFB]'
                  }`}
                >
                  <span className="text-[12px] font-medium text-Text-Primary">
                    {clinic.name || `Clinic #${clinic.clinic_id}`}
                  </span>
                  <span className="text-[11px] text-Text-Secondary">
                    ID {clinic.clinic_id}
                    {clinic.primary_email ? ` · ${clinic.primary_email}` : ''}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ClinicSearchSelect;
