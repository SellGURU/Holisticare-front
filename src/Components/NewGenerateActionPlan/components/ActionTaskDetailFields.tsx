/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, ReactNode } from 'react';

export const hasActionText = (value: unknown): boolean => {
  if (value == null || value === '') return false;
  if (typeof value === 'number') return Number.isFinite(value);
  return String(value).trim().length > 0;
};

export const hasAnyMacros = (macros: any): boolean => {
  if (!macros || typeof macros !== 'object') return false;
  return [macros.Carbs, macros.Protein, macros.Fats].some(hasActionText);
};

export const associatedInterventionOf = (item: any): string => {
  const value =
    item?.Parent || item?.Parent_Title || item?.Parent_title || '';
  return hasActionText(value) ? String(value).trim() : '';
};

const formatMacro = (value: unknown): string =>
  hasActionText(value) ? String(value) : '-';

const DetailField: FC<{
  icon: string;
  label: string;
  children: ReactNode;
}> = ({ icon, label, children }) => (
  <div className="flex flex-col gap-1 ml-2 mb-1.5">
    <div className="flex items-center gap-1 text-Primary-DeepTeal text-xs text-nowrap">
      <img src={icon} alt="" className="ml-[-2px]" />
      {label}
    </div>
    <div className="text-[#666666] text-xs leading-5 text-wrap">{children}</div>
  </div>
);

interface ActionTaskDetailFieldsProps {
  value: any;
  onOpenFiles?: () => void;
  hasExerciseFiles?: boolean;
}

const ActionTaskDetailFields: FC<ActionTaskDetailFieldsProps> = ({
  value,
  onOpenFiles,
  hasExerciseFiles = false,
}) => {
  const associated = associatedInterventionOf(value);
  const instruction = hasActionText(value?.Instruction)
    ? String(value.Instruction).trim()
    : '';
  const recommendation = hasActionText(value?.Recommendation)
    ? String(value.Recommendation).trim()
    : '';
  const typeName = hasActionText(value?.Type) ? String(value.Type).trim() : '';
  const dose = hasActionText(value?.Dose) ? String(value.Dose).trim() : '';
  const hasValue = hasActionText(value?.Value);
  const macros = value?.['Total Macros'];
  const showMacros = value?.Category === 'Diet' && hasAnyMacros(macros);

  return (
    <>
      {associated && (
        <DetailField
          icon="/icons/directbox-default.svg"
          label="Associated Intervention"
        >
          {associated}
        </DetailField>
      )}
      {value?.Category === 'Other' && typeName && (
        <DetailField icon="/icons/ruler-new.svg" label="Type">
          {typeName}
        </DetailField>
      )}
      {value?.Category === 'Supplement' && dose && (
        <DetailField icon="/icons/ruler-new.svg" label="Dosage">
          {dose}
        </DetailField>
      )}
      {value?.Category === 'Lifestyle' && hasValue && (
        <DetailField icon="/icons/ruler-new.svg" label="Value">
          {value.Value} {value?.Unit || ''}
        </DetailField>
      )}
      {showMacros && (
        <DetailField icon="/icons/ruler-new.svg" label="Macros">
          <div className="flex justify-start items-center gap-4 flex-wrap">
            <div>Carb: {formatMacro(macros?.Carbs)} gr</div>
            <div>Protein: {formatMacro(macros?.Protein)} gr</div>
            <div>Fat: {formatMacro(macros?.Fats)} gr</div>
          </div>
        </DetailField>
      )}
      {value?.Category === 'Activity' && hasExerciseFiles && (
        <DetailField icon="/icons/directbox-default.svg" label="Files">
          <div
            onClick={onOpenFiles}
            className="cursor-pointer text-[#4C88FF] underline"
          >
            Youtube Link / Video / Image
          </div>
        </DetailField>
      )}
      {value?.Category === 'Medical Peptide Therapy' &&
        Array.isArray(value?.Dose_Schedules) &&
        value.Dose_Schedules.length > 0 && (
          <DetailField icon="/icons/ruler-new.svg" label="Schedule">
            {value.Dose_Schedules.map((schedule: any, idx: number) => {
              const type = schedule.Frequency_Type;
              const days = schedule.Frequency_Days || [];
              let freq = '';
              if (type === 'daily') freq = 'Daily';
              else if (type === 'weekly') {
                if (days.length === 0) freq = 'Weekly';
                else {
                  const dayNames = [
                    'Sun',
                    'Mon',
                    'Tue',
                    'Wed',
                    'Thu',
                    'Fri',
                    'Sat',
                  ];
                  freq = `Weekly: ${days.map((d: number) => dayNames[d % 7]).join(', ')}`;
                }
              } else if (type === 'monthly') {
                freq =
                  days.length === 0
                    ? 'Monthly'
                    : `Monthly: Days ${days.join(', ')}`;
              } else if (type) freq = type;
              return (
                <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
                  {schedule.Title && (
                    <span className="font-medium">{schedule.Title}: </span>
                  )}
                  {schedule.Dose || '-'}
                  {freq && (
                    <span className="text-gray-500"> • {freq}</span>
                  )}
                </div>
              );
            })}
          </DetailField>
        )}
      {instruction && (
        <DetailField icon="/icons/note-blue.svg" label="Instruction">
          {instruction}
        </DetailField>
      )}
      {recommendation && (
        <DetailField icon="/icons/note-blue.svg" label="Recommendation">
          {recommendation}
        </DetailField>
      )}
    </>
  );
};

export default ActionTaskDetailFields;
