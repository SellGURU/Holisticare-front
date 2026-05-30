import { FC } from 'react';
import {
  useFieldArray,
  Control,
  FieldErrors,
  Controller,
  UseFormSetValue,
} from 'react-hook-form';

import { FormBiomarkerData, ApiThresholdRange } from '../../types/biormarker';

const ALLOWED_STATUSES = [
  { value: 'OptimalRange', label: 'Optimal Range', color: '#22C55E' },
  { value: 'HealthyRange', label: 'Healthy Range', color: '#86EFAC' },
  { value: 'BorderlineRange', label: 'Borderline Range', color: '#FDE68A' },
  { value: 'DiseaseRange', label: 'Disease Range', color: '#F97316' },
  { value: 'CriticalRange', label: 'Critical Range', color: '#EF4444' },
];

interface ThresholdRangesEditorProps {
  nestIndex: number;
  gender: 'male' | 'female';
  control: Control<FormBiomarkerData>;
  errors: FieldErrors<FormBiomarkerData>;
  setValue?: UseFormSetValue<FormBiomarkerData>;
}

const ThresholdRangesEditor: FC<ThresholdRangesEditorProps> = ({
  nestIndex,
  gender,
  control,
  setValue,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `thresholds.${gender}.${nestIndex}.ranges` as `thresholds.${typeof gender}.${number}.ranges`,
  });

  return (
    <div>
      {/* Column headers */}
      <div className="flex items-center gap-1.5 text-[9px] text-Text-Secondary mb-1 px-0.5">
        <span className="w-4 shrink-0" />
        <span className="flex-1 min-w-[70px]">Label</span>
        <span className="w-[120px] shrink-0">Status</span>
        <span className="w-[65px] text-center shrink-0">Low</span>
        <span className="w-[65px] text-center shrink-0">High</span>
        <span className="w-5 shrink-0" />
      </div>

      {fields.map((field, k) => (
        <div key={field.id} className="flex items-center gap-1.5 mb-1.5">
          {/* Color indicator */}
          <Controller
            control={control}
            name={`thresholds.${gender}.${nestIndex}.ranges.${k}.color`}
            render={({ field: { value } }) => {
              const statusInfo = ALLOWED_STATUSES.find((s) => s.color === value);
              return (
                <div
                  className="w-4 h-4 rounded-full shrink-0 border border-gray-200"
                  style={{ backgroundColor: statusInfo?.color || value || '#ddd' }}
                />
              );
            }}
          />

          {/* Label */}
          <Controller
            control={control}
            name={`thresholds.${gender}.${nestIndex}.ranges.${k}.label`}
            render={({ field: { onChange, value } }) => (
              <input
                type="text"
                value={value || ''}
                onChange={onChange}
                placeholder="e.g. Optimal"
                className="flex-1 min-w-[70px] border border-Gray-50 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-Primary-DeepTeal"
              />
            )}
          />

          {/* Status dropdown */}
          <Controller
            control={control}
            name={`thresholds.${gender}.${nestIndex}.ranges.${k}.status`}
            render={({ field: { onChange, value } }) => (
              <select
                value={value || ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  const found = ALLOWED_STATUSES.find((s) => s.value === e.target.value);
                  if (found && setValue) {
                    setValue(
                      `thresholds.${gender}.${nestIndex}.ranges.${k}.color` as never,
                      found.color as never,
                    );
                  }
                }}
                className="w-[120px] shrink-0 border border-Gray-50 rounded-lg px-1 py-1 text-[11px] outline-none focus:border-Primary-DeepTeal bg-white"
              >
                <option value="">— select —</option>
                {ALLOWED_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          />

          {/* Low */}
          <Controller
            control={control}
            name={`thresholds.${gender}.${nestIndex}.ranges.${k}.low`}
            render={({ field: { onChange, value } }) => (
              <input
                type="number"
                step="any"
                value={value === null || value === undefined ? '' : value}
                onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                placeholder="null"
                className="w-[65px] shrink-0 border border-Gray-50 rounded-lg px-1.5 py-1 text-[11px] outline-none text-center focus:border-Primary-DeepTeal"
              />
            )}
          />

          {/* High */}
          <Controller
            control={control}
            name={`thresholds.${gender}.${nestIndex}.ranges.${k}.high`}
            render={({ field: { onChange, value } }) => (
              <input
                type="number"
                step="any"
                value={value === null || value === undefined ? '' : value}
                onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
                placeholder="null"
                className="w-[65px] shrink-0 border border-Gray-50 rounded-lg px-1.5 py-1 text-[11px] outline-none text-center focus:border-Primary-DeepTeal"
              />
            )}
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => remove(k)}
            className="w-5 shrink-0 text-red-400 hover:text-red-600 text-[14px] leading-none"
            title="Remove range"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({
            label: '',
            status: 'OptimalRange',
            low: null,
            high: null,
            color: '#22C55E',
          } as ApiThresholdRange)
        }
        className="mt-1 text-[10px] text-Primary-DeepTeal hover:underline"
      >
        + Add Threshold Range
      </button>
    </div>
  );
};
export default ThresholdRangesEditor;
