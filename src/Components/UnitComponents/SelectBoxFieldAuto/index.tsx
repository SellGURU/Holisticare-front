import { FC, useEffect, useRef, useState } from 'react';
import {
  computePosition,
  flip,
  shift,
  autoUpdate,
  size,
} from '@floating-ui/dom';

interface SelectBoxFieldAutoProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  validationText?: string;
  margin?: string;
  disabled?: boolean;
  showDisabled?: boolean;
  placeholder: string;
}

const SelectBoxFieldAuto: FC<SelectBoxFieldAutoProps> = ({
  label,
  options,
  value,
  onChange,
  isValid = true,
  validationText,
  margin,
  disabled,
  placeholder,
  showDisabled,
}) => {
  const [showSelect, setShowSelect] = useState(false);
  const [openDirection, setOpenDirection] = useState<'top' | 'bottom'>('top');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!showSelect || !buttonRef.current || !dropdownRef.current) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      return;
    }

    cleanupRef.current = autoUpdate(
      buttonRef.current,
      dropdownRef.current,
      () => {
        computePosition(buttonRef.current!, dropdownRef.current!, {
          placement: 'top-start',
          middleware: [
            flip({
              fallbackPlacements: ['top-start', 'bottom-start'],
            }),
            shift({ padding: 8 }),
            size({
              apply({ rects, elements }) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                });
              },
            }),
          ],
        }).then(({ x, y, placement }) => {
          if (dropdownRef.current) {
            Object.assign(dropdownRef.current.style, {
              left: `${x}px`,
              top: `${y}px`,
            });

            // تشخیص جهت باز شدن
            setOpenDirection(placement.startsWith('top') ? 'top' : 'bottom');
          }
        });
      },
    );

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [showSelect]);

  return (
    <div
      ref={wrapperRef}
      className={`w-full relative overflow-visible ${margin ? margin : 'mt-1 mb-4'}`}
    >
      <label
        className={`text-xs font-medium text-Text-Primary ${showDisabled ? 'opacity-50' : 'opacity-100'}`}
        htmlFor="select-box-field-auto"
        onClick={() => setShowSelect(false)}
      >
        {label}
      </label>
      <div
        onClick={() => !disabled && setShowSelect(!showSelect)}
        id="select-box-field-auto"
        ref={buttonRef}
        className={`w-full h-[28px] flex justify-between items-center px-3 bg-backgroundColor-Card rounded-[16px] border mt-1 ${
          !isValid ? 'border-Red' : 'border-Gray-50'
        } ${showDisabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}`}
      >
        {value ? (
          <div className="text-[12px] text-Text-Primary">{value}</div>
        ) : (
          <div className="text-[10px] md:text-[12px] text-Text-Fivefold">
            {placeholder}
          </div>
        )}
        <div>
          <img
            className={`${showSelect && 'rotate-180'}`}
            src="/icons/arow-down-drop.svg"
            alt=""
          />
        </div>
      </div>
      {validationText && (
        <div className="text-Red text-[10px] mt-1">{validationText}</div>
      )}
      {showSelect && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            width: buttonRef.current?.offsetWidth,
          }}
          className={`z-[9999] shadow-300 py-1 px-3 ${
            openDirection === 'bottom'
              ? 'rounded-br-2xl rounded-bl-2xl'
              : 'rounded-tr-2xl rounded-tl-2xl'
          } bg-backgroundColor-Card border border-gray-50 max-h-[250px] overflow-y-auto`}
        >
          {options.map((option, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  onChange(option);
                  setShowSelect(false);
                }}
                className="text-[12px] hover:bg-gray-100 py-1 text-Text-Primary my-1 cursor-pointer"
              >
                {option}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectBoxFieldAuto;
