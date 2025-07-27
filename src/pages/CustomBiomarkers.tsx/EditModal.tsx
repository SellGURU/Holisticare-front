import { FC, useEffect } from 'react';
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from 'react-hook-form';
import SpinnerLoader from '../../Components/SpinnerLoader'; // Adjust path as needed
import ThresholdRangesEditor from './ThresholdRangesEditor'; // Adjust path as needed
import TextField from '../../Components/TextField'; // Import TextField

// Import types from the shared file
import {
  ApiBiomarkerData,
  FormBiomarkerData,
  ApiThresholdRange,
} from '../../types/biormarker'; // Adjust path as needed

interface EditModalProps {
  data: ApiBiomarkerData; // Data is expected to be complete for editing
  onCancel: () => void;
  onSave: (values: ApiBiomarkerData) => void;
  loading: boolean;
  errorDetails: string;
  setErrorDetails: (errorDetails: string) => void;
}

const EditModal: FC<EditModalProps> = ({
  data,
  onCancel,
  onSave,
  loading,
  errorDetails,
  setErrorDetails,
}) => {
  console.log(data);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormBiomarkerData>({
    defaultValues: {
      'Benchmark areas': data['Benchmark areas'] || '',
      Biomarker: data.Biomarker || '',
      Definition: data.Definition || '',
      unit: data.unit || '',
      thresholds: {
        male: Object.entries(data.thresholds?.male || {}).map(
          ([ageRange, ranges]) => ({
            ageRange,
            ranges: (Array.isArray(ranges)
              ? ranges
              : []) as ApiThresholdRange[],
          }),
        ),
        female: Object.entries(data.thresholds?.female || {}).map(
          ([ageRange, ranges]) => ({
            ageRange,
            ranges: (Array.isArray(ranges)
              ? ranges
              : []) as ApiThresholdRange[],
          }),
        ),
      },
    } as FormBiomarkerData, // Explicitly cast for type safety
  });

  useEffect(() => {
    reset({
      'Benchmark areas': data['Benchmark areas'] || '',
      Biomarker: data.Biomarker || '',
      Definition: data.Definition || '',
      unit: data.unit || '',
      thresholds: {
        male: Object.entries(data.thresholds?.male || {}).map(
          ([ageRange, ranges]) => ({
            ageRange,
            ranges: (Array.isArray(ranges)
              ? ranges
              : []) as ApiThresholdRange[],
          }),
        ),
        female: Object.entries(data.thresholds?.female || {}).map(
          ([ageRange, ranges]) => ({
            ageRange,
            ranges: (Array.isArray(ranges)
              ? ranges
              : []) as ApiThresholdRange[],
          }),
        ),
      },
    } as FormBiomarkerData);
  }, [data, reset]);

  const {
    fields: maleAgeRangeFields,
    append: appendMaleAgeRange,
    remove: removeMaleAgeRange,
  } = useFieldArray({
    control,
    name: 'thresholds.male',
  });

  const {
    fields: femaleAgeRangeFields,
    append: appendFemaleAgeRange,
    remove: removeFemaleAgeRange,
  } = useFieldArray({
    control,
    name: 'thresholds.female',
  });

  const onSubmit: SubmitHandler<FormBiomarkerData> = (formValues) => {
    setErrorDetails('');

    const transformedValues: ApiBiomarkerData = {
      'Benchmark areas': formValues['Benchmark areas'],
      Biomarker: formValues.Biomarker,
      Definition: formValues.Definition || undefined,
      unit: formValues.unit || undefined,
      thresholds: formValues.thresholds
        ? {
            male:
              formValues.thresholds.male?.reduce(
                (acc, current) => {
                  if (current.ageRange) {
                    acc[current.ageRange] =
                      current.ranges as ApiThresholdRange[];
                  }
                  return acc;
                },
                {} as Record<string, ApiThresholdRange[]>,
              ) || undefined,
            female:
              formValues.thresholds.female?.reduce(
                (acc, current) => {
                  if (current.ageRange) {
                    acc[current.ageRange] =
                      current.ranges as ApiThresholdRange[];
                  }
                  return acc;
                },
                {} as Record<string, ApiThresholdRange[]>,
              ) || undefined,
          }
        : undefined,
    };

    onSave(transformedValues);
  };

  return (
    <div className="w-[644px] p-4 max-w-[644px] relative bg-white min-h-[500px] h-[60%] rounded-[16px]">
      {errorDetails && (
        <div className="absolute top-2 right-2 z-10 flex max-w-[493px] items-start rounded-2xl bg-[#F9DEDC] pb-3 pt-2 px-4">
          <img
            src="/icons/info-circle-orange.svg"
            alt=""
            className="w-4 h-4 mt-[3px]"
          />
          <div className="text-Text-Primary text-[10px] leading-5 px-2 text-wrap">
            {errorDetails}
          </div>
          <img
            src="/icons/close-black.svg"
            alt=""
            className="cursor-pointer w-5 h-5"
            onClick={() => setErrorDetails('')}
          />
        </div>
      )}
      <div className="">
        <div className=" text-Text-Primary TextStyle-Headline-5">
          Edit Biomarker
        </div>{' '}
        {/* Changed Title */}
        <div className="w-full h-1 border-b-2 mt-2 border-gray-50"></div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-[400px] overflow-y-auto pr-2"
      >
        {/* Basic Biomarker Details */}
        <div className="mb-4">
          <label
            htmlFor="benchmarkArea"
            className="block text-sm font-medium text-gray-700"
          >
            Benchmark Area
          </label>
          <Controller
            control={control}
            name="Benchmark areas"
            rules={{ required: 'Benchmark area is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                id="benchmarkArea"
                type="text"
                newStyle
                placeholder="Enter benchmark area"
                inValid={!!error}
                errorMessage={error?.message}
              />
            )}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="biomarkerName"
            className="block text-sm font-medium text-gray-700"
          >
            Biomarker Name
          </label>
          <Controller
            control={control}
            name="Biomarker"
            rules={{ required: 'Biomarker name is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                id="biomarkerName"
                type="text"
                newStyle
                placeholder="Enter biomarker name"
                inValid={!!error}
                errorMessage={error?.message}
                disabled={true} // Set to disabled as per original behavior
              />
            )}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="definition"
            className="block text-sm font-medium text-gray-700"
          >
            Definition
          </label>
          <Controller
            control={control}
            name="Definition"
            render={({ field }) => (
              <textarea
                {...field}
                value={field.value || ''}
                id="definition"
                placeholder="Enter definition"
                className=" bg-[#FDFDFD] border border-Gray-50 w-full pt-2 min-h-[80px] resize-none rounded-[16px] mt-1 placeholder:text-xs placeholder:font-light placeholder:text-[#B0B0B0] text-[12px] px-3 outline-none"
              />
            )}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="unit"
            className="block text-sm font-medium text-gray-700"
          >
            Unit
          </label>
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <TextField
                {...field}
                id="unit"
                type="text"
                newStyle
                placeholder="Enter unit"
                value={field.value || ''}
              />
            )}
          />
        </div>

        {/* Thresholds Section */}
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
          Thresholds
        </h3>

        {/* Male Thresholds */}
        <div className="mb-6 border p-4 rounded-md bg-gray-50">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Male Thresholds
          </h4>
          {maleAgeRangeFields.map((field, ageRangeIndex) => (
            <div
              key={field.id}
              className="border p-4 mb-3 rounded-md bg-white relative"
            >
              <button
                type="button"
                onClick={() => removeMaleAgeRange(ageRangeIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove Age Group
              </button>
              <div className="mb-3">
                <label
                  htmlFor={`maleAgeRange-${ageRangeIndex}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Age Range (e.g., 18-100)
                </label>
                <Controller
                  control={control}
                  name={`thresholds.male.${ageRangeIndex}.ageRange`}
                  rules={{ required: 'Age range is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      id={`maleAgeRange-${ageRangeIndex}`}
                      type="text"
                      newStyle
                      placeholder="e.g., 18-40"
                      inValid={!!error}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </div>

              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Ranges for this Age Group:
              </h5>
              <ThresholdRangesEditor
                nestIndex={ageRangeIndex}
                gender="male"
                control={control}
                errors={errors}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendMaleAgeRange({
                ageRange: '',
                ranges: [
                  { label: '', status: '', low: null, high: null, color: '' },
                ],
              })
            }
            className="mt-2 text-indigo-600 hover:text-indigo-900 border border-indigo-600 px-3 py-1 rounded-md text-sm"
          >
            Add Male Age Group
          </button>
        </div>

        {/* Female Thresholds */}
        <div className="mb-6 border p-4 rounded-md bg-gray-50">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            Female Thresholds
          </h4>
          {femaleAgeRangeFields.map((field, ageRangeIndex) => (
            <div
              key={field.id}
              className="border p-4 mb-3 rounded-md bg-white relative"
            >
              <button
                type="button"
                onClick={() => removeFemaleAgeRange(ageRangeIndex)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove Age Group
              </button>
              <div className="mb-3">
                <label
                  htmlFor={`femaleAgeRange-${ageRangeIndex}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Age Range (e.g., 18-100)
                </label>
                <Controller
                  control={control}
                  name={`thresholds.female.${ageRangeIndex}.ageRange`}
                  rules={{ required: 'Age range is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      id={`femaleAgeRange-${ageRangeIndex}`}
                      type="text"
                      newStyle
                      placeholder="e.g., 18-40"
                      inValid={!!error}
                      errorMessage={error?.message}
                    />
                  )}
                />
              </div>

              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Ranges for this Age Group:
              </h5>
              <ThresholdRangesEditor
                nestIndex={ageRangeIndex}
                gender="female"
                control={control}
                errors={errors}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              appendFemaleAgeRange({
                ageRange: '',
                ranges: [
                  { label: '', status: '', low: null, high: null, color: '' },
                ],
              })
            }
            className="mt-2 text-indigo-600 hover:text-indigo-900 border border-indigo-600 px-3 py-1 rounded-md text-sm"
          >
            Add Female Age Group
          </button>
        </div>

        {/* Buttons */}
        <div className=" w-full flex justify-end gap-4 items-center absolute bottom-4 right-4 ">
          <div
            onClick={onCancel}
            className="TextStyle-Headline-5 cursor-pointer text-Disable"
          >
            Cancel
          </div>
          <button
            type="submit"
            className="TextStyle-Headline-5 cursor-pointer text-Primary-DeepTeal"
            disabled={loading}
          >
            {loading ? <SpinnerLoader color="#005F73" /> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditModal;
