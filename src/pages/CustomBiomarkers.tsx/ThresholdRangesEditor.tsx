import { FC } from 'react';
import {
  useFieldArray,
  Control,
  FieldErrors,
  Controller,
} from 'react-hook-form';
import TextField from '../../Components/TextField'; // Adjust path as needed

// Import types from the shared file
import { FormBiomarkerData, ApiThresholdRange } from '../../types/biormarker'; // Adjust path as needed

interface ThresholdRangesEditorProps {
  nestIndex: number;
  gender: 'male' | 'female';
  control: Control<FormBiomarkerData>;
  errors: FieldErrors<FormBiomarkerData>;
}

const ThresholdRangesEditor: FC<ThresholdRangesEditorProps> = ({
  nestIndex,
  gender,
  control,
  errors,
}) => {
  console.log(errors);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `thresholds.${gender}.${nestIndex}.ranges` as `thresholds.${typeof gender}.${number}.ranges`,
  });

  return (
    <div>
      {fields.map((field, k) => (
        <div
          key={field.id}
          className="border p-3 mb-2 rounded-md bg-gray-100 relative"
        >
          <button
            type="button"
            onClick={() => remove(k)}
            className="absolute top-1 right-1 text-red-400 hover:text-red-600 text-xs"
          >
            Remove Range
          </button>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                htmlFor={`label-${gender}-${nestIndex}-${k}`}
                className="block text-xs font-medium text-gray-600"
              >
                Label
              </label>
              <Controller
                control={control}
                name={`thresholds.${gender}.${nestIndex}.ranges.${k}.label`}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <TextField
                    id={`label-${gender}-${nestIndex}-${k}`}
                    type="text"
                    newStyle
                    placeholder="e.g., Optimal"
                    onBlur={onBlur}
                    name={name}
                    onChange={onChange}
                    value={value || ''}
                    inputRef={ref} // Pass ref
                  />
                )}
              />
            </div>
            <div>
              <label
                htmlFor={`status-${gender}-${nestIndex}-${k}`}
                className="block text-xs font-medium text-gray-600"
              >
                Status
              </label>
              <Controller
                control={control}
                name={`thresholds.${gender}.${nestIndex}.ranges.${k}.status`}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <TextField
                    id={`status-${gender}-${nestIndex}-${k}`}
                    type="text"
                    newStyle
                    placeholder="e.g., Optimal"
                    onBlur={onBlur}
                    name={name}
                    onChange={onChange}
                    value={value || ''}
                    inputRef={ref} // Pass ref
                  />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label
                htmlFor={`low-${gender}-${nestIndex}-${k}`}
                className="block text-xs font-medium text-gray-600"
              >
                Low
              </label>
              <Controller
                control={control}
                name={`thresholds.${gender}.${nestIndex}.ranges.${k}.low`}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <TextField
                    id={`low-${gender}-${nestIndex}-${k}`}
                    type="number" // <--- Use type="number"
                    step="any" // <--- Allow decimals
                    newStyle
                    placeholder="e.g., 10"
                    onBlur={onBlur}
                    name={name}
                    inputRef={ref} // <--- Pass ref
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      );
                    }}
                    value={value === null || value === undefined ? '' : value}
                  />
                )}
              />
            </div>
            <div>
              <label
                htmlFor={`high-${gender}-${nestIndex}-${k}`}
                className="block text-xs font-medium text-gray-600"
              >
                High
              </label>
              <Controller
                control={control}
                name={`thresholds.${gender}.${nestIndex}.ranges.${k}.high`}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <TextField
                    id={`high-${gender}-${nestIndex}-${k}`}
                    type="number" // <--- Use type="number"
                    step="any" // <--- Allow decimals
                    newStyle
                    placeholder="e.g., 20"
                    onBlur={onBlur}
                    name={name}
                    inputRef={ref} // <--- Pass ref
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChange(
                        e.target.value === '' ? null : Number(e.target.value),
                      );
                    }}
                    value={value === null || value === undefined ? '' : value}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`color-${gender}-${nestIndex}-${k}`}
              className="block text-xs font-medium text-gray-600"
            >
              Color
            </label>
            <Controller
              control={control}
              name={`thresholds.${gender}.${nestIndex}.ranges.${k}.color`}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <TextField
                  id={`color-${gender}-${nestIndex}-${k}`}
                  type="text"
                  newStyle
                  placeholder="e.g., #00FF00"
                  onBlur={onBlur}
                  name={name}
                  onChange={onChange}
                  value={value || ''}
                  inputRef={ref} // Pass ref
                />
              )}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          append({
            label: '',
            status: '',
            low: null,
            high: null,
            color: '',
          } as ApiThresholdRange)
        }
        className="mt-2 text-blue-500 hover:text-blue-700 border border-blue-500 px-2 py-1 rounded-md text-xs"
      >
        Add Threshold Range
      </button>
    </div>
  );
};
export default ThresholdRangesEditor;
