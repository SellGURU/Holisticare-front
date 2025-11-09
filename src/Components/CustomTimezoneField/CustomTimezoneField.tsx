import { useMemo, useRef, useState } from "react";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
import useModalAutoClose from "../../hooks/UseModalAutoClose";

interface Props {
  value: any;
  onChange: (val: any) => void;
}

export default function CustomTimezoneField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value?.label || "");

  const { options } = useTimezoneSelect({
    labelStyle: "original",
    timezones: allTimezones,
  });

  const filtered = useMemo(() => {
    return options.filter((o: any) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  const handleSelect = (option: any) => {
    onChange(option);
    setQuery(option.label);
    setOpen(false);
  };

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useModalAutoClose({
    refrence: dropdownRef,
    buttonRefrence: buttonRef,
    close: () => setOpen(false),
  });

  return (
    <div className="tz-wrapper" >
      {/* Custom input */}
      <div    ref={buttonRef} className="tz-input-box">
        <img src="/icons/search-normal.svg" className="tz-left-icon" alt="" />
        <input
          value={query}
          className="tz-input-field"
          placeholder="Search timezone"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        //   onFocus={() => setOpen(true)}
        />
        <img
     
          src="/icons/arrow-down.svg"
          className={`tz-right-icon  absolute right-3 transition-transform ${open ? "rotate-180" : ""}`}
          alt=""
          onClick={() => setOpen(!open)}
        />
      </div>

      {open && (
        <div ref={dropdownRef} className="tz-dropdown p-1">
          <div className="tz-list">
            {filtered.map((option: any) => (
              <div
                key={option.value}
                className="tz-item"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="tz-item tz-empty">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
