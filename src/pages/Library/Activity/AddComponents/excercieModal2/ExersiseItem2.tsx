import { useState } from 'react';
import SvgIcon from '../../../../../utils/svgIcon';
import { Tooltip } from 'react-tooltip';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ExerciseItemProps {
  isSuperSet?: boolean;
  index: number;
  exercise: any;
  sets: string;
  exesiseIndex: number;
  onDelete: (exersiseIndex: number) => void;
  toSuperSet: () => void;
  removeFromSuperSet?: () => void;
  onChange: (
    index: number,
    field: string,
    value: string,
    exersiseIndex: number,
  ) => void;
  showValidation?: boolean;
  errors: { [key: string]: string };
}

/* ---------------- Small Reusable Field ---------------- */

const Field = ({
  label,
  value,
  onChange,
  error,
  numeric = true,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  numeric?: boolean;
}) => (
  <div className="relative">
    <input
      value={value}
      onChange={onChange}
      inputMode={numeric ? 'numeric' : 'text'}
      className={`
        w-full h-10 rounded-xl border px-3 pt-4 text-sm bg-white
        ${error ? 'border-red-500' : 'border-gray-200'}
        focus:outline-none focus:border-primary
      `}
    />

    {/* Floating label */}
    <span className="absolute left-3 top-1 text-[10px] text-gray-500">
      {label}
    </span>

    {error && (
      <span className="absolute right-2 top-2 text-red-500 text-xs">!</span>
    )}
  </div>
);

/* ---------------- Component ---------------- */

const ExerciseItem2 = ({
  index,
  exesiseIndex,
  exercise,
  onChange,
  onDelete,
  toSuperSet,
  removeFromSuperSet,
  isSuperSet,
  sets,
  showValidation = false,
}: ExerciseItemProps) => {
  const [showInstruction, setShowInstruction] = useState(false);

  const isSetEmpty = sets === '' || Number(sets) === 0;

  const onlyNumbers = (value: string) => /^\d*$/.test(value);

  const handleSetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onlyNumbers(e.target.value)) {
      onChange(index, 'Sets', e.target.value, exesiseIndex);
    }
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onlyNumbers(e.target.value)) {
      onChange(index, 'Reps', e.target.value, exesiseIndex);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(index, 'Weight', e.target.value, exesiseIndex);
  };

  const handleRestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onlyNumbers(e.target.value)) {
      onChange(index, 'Rest', e.target.value, exesiseIndex);
    }
  };

  return (
    <div
      className={`
        relative w-full rounded-2xl z-[2] bg-backgroundColor-Card p-4
        border transition hover:shadow-md
       border-Gray-50
      `}
    >
      {/* ---------------- HEADER ---------------- */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Thumbnail */}
          <div className="relative shrink-0">
            <img
              src="/images/activity/activity-demo.png"
              className="w-10 h-10 rounded-lg object-cover"
            />

            {exercise?.Exercise?.Files?.length > 0 && (
              <img
                src="/icons/video-octagon.svg"
                className="absolute inset-0 m-auto w-4 h-4"
              />
            )}
          </div>

          {/* Title */}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {exercise.Exercise.Title}
            </p>

            <button
              onClick={() => setShowInstruction(!showInstruction)}
              className="text-[11px] text-Primary-DeepTeal hover:underline"
            >
              {showInstruction ? 'Hide instructions' : 'View instructions'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {index > 0 && !isSuperSet && (
            <button
              data-tooltip-id={`${exercise}-addSuperSet`}
              onClick={toSuperSet}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <SvgIcon
                color="#6CC24A"
                src="/icons/link.svg"
                width="16"
                height="16"
              />
              <Tooltip id={`${exercise}-addSuperSet`}>
                Superset with above
              </Tooltip>
            </button>
          )}

          {isSuperSet && removeFromSuperSet && (
            <button
              data-tooltip-id={`${exercise}-reomveSuperSet`}
              onClick={removeFromSuperSet}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <SvgIcon
                color="#6CC24A"
                src="/icons/link.svg"
                width="16"
                height="16"
              />
              <Tooltip id={`${exercise}-reomveSuperSet`}>
                Remove from superset
              </Tooltip>
            </button>
          )}

          <button
            onClick={() => onDelete(exesiseIndex)}
            className="p-2 rounded-lg hover:bg-red-50"
            data-tooltip-id={`${exercise}-Delete`}
          >
            <SvgIcon
              color="#6CC24A"
              src="/icons/delete.svg"
              width="16"
              height="16"
            />
            <Tooltip id={`${exercise}-Delete`}>Delete</Tooltip>
          </button>
        </div>
      </div>

      {/* ---------------- INSTRUCTION ---------------- */}

      {showInstruction && (
        <div className="mt-3 text-xs text-Text-Secondary leading-relaxed">
          {exercise.Exercise.Instruction || 'No instruction provided.'}
        </div>
      )}

      {/* ---------------- INPUT GRID ---------------- */}

      <div className="mt-4 grid grid-cols-4 gap-3">
        <Field
          label="Sets"
          value={sets}
          onChange={handleSetChange}
          error={showValidation && isSetEmpty}
        />

        <Field
          label="Reps"
          value={exercise.Reps}
          onChange={handleRepsChange}
          error={showValidation && !exercise.Reps}
        />

        <Field
          label="Weight"
          value={exercise.Weight}
          onChange={handleWeightChange}
          numeric={false}
        />

        <Field
          label="Rest (min)"
          value={exercise.Rest}
          onChange={handleRestChange}
        />
      </div>
    </div>
  );
};

export default ExerciseItem2;
