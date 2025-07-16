/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Checkbox from '../../../../Components/checkbox';
import CustomSelect from '../../../../Components/CustomSelect';
import TextField from '../../../../Components/TextField';
import RangeCardLibraryActivity from './RangeCard';
import Application from '../../../../api/app';

interface InformationStepProps {
  addData: {
    title: string;
    // description: string;
    score: number;
    instruction: string;
    type: string;
    terms: Array<string>;
    condition: Array<string>;
    muscle: Array<string>;
    equipment: Array<string>;
    level: string;
    location: Array<string>;
  };
  updateAddData: (
    key:
      | 'type'
      | 'title'
      // | 'description'
      | 'score'
      | 'instruction'
      | 'terms'
      | 'condition'
      | 'muscle'
      | 'equipment'
      | 'level'
      | 'location',
    value: any,
  ) => void;
  showValidation: boolean; // Add this prop
  // onValidationChange: (isValid: boolean) => void; // Add this prop
}

const InformationStep: FC<InformationStepProps> = ({
  addData,
  updateAddData,
  showValidation,
  // onValidationChange,
}) => {
  const [ConditionsOptions, setConditionsOptions] = useState([]);
  const [EquipmentOptions, setEquipmentOptions] = useState([]);
  const [LevelOptions, setLevelOptions] = useState([]);
  const [MuscleOptions, setMuscleOptions] = useState([]);
  const [TermsOptions, setTermsOptions] = useState([]);
  const [TypesOptions, setTypeOptions] = useState([]);

  // Formik validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('This field is required.'),
    // description: Yup.string().required('This field is required.'),
    instruction: Yup.string().required('This field is required.'),
    score: Yup.number()
      .min(1, 'This field is required.')
      .required('This field is required.'),
  });

  // Update the Formik initialization
  const formik = useFormik({
    initialValues: {
      title: addData.title,
      // description: addData.description,
      instruction: addData.instruction,
      score: addData.score,
    },
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: () => {}, // Handled by parent
  });

  // useEffect(() => {
  //   onValidationChange(formik.isValid);
  // }, [formik.isValid, onValidationChange]);
  // Update parent component when form values change
  useEffect(() => {
    updateAddData('title', formik.values.title);
    updateAddData('instruction', formik.values.instruction);
  }, [formik.values.title, formik.values.instruction]);

  useEffect(() => {
    Application.getExerciseFilters({}).then((res) => {
      setConditionsOptions(res.data.Conditions);
      setEquipmentOptions(res.data.Equipment);
      setMuscleOptions(res.data.Muscle);
      setLevelOptions(res.data.Level);
      setTermsOptions(res.data.Terms);
      setTypeOptions(res.data.Type);
    });
  }, []);

  const handleCheckboxChange = (value: string) => {
    updateAddData(
      'location',
      addData.location.includes(value)
        ? addData.location.filter((item: string) => item !== value)
        : [...addData.location, value],
    );
  };

  return (
    <>
      <div className="w-full flex gap-4 mt-6 relative">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium text-Text-Primary">Title</div>
            <TextField
              type="text"
              newStyle
              placeholder="Write the activity's title..."
              value={formik.values.title}
              onChange={(e) => formik.setFieldValue('title', e.target.value)}
              onBlur={formik.handleBlur}
              className="w-[360px]"
              errorMessage={
                showValidation ? 'This field is required.' : undefined
              }
              inValid={showValidation && Boolean(formik.errors.title)}
            />
          </div>

          {/* <div className="flex flex-col w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Description
            </div>
            <textarea
              placeholder="Write the activity's description..."
              value={formik.values.description}
              onChange={(e) => {
                formik.setFieldValue('description', e.target.value);
                updateAddData('description', e.target.value);
              }}
              name="description"
              className={`w-full h-[62px] rounded-[16px] py-1 px-3 border ${
                showValidation && formik.errors.description
                  ? 'border-Red'
                  : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {showValidation && formik.errors.description && (
              <div className="text-Red text-[10px]">
                {formik.errors.description}
              </div>
            )}
          </div> */}

          <div className="flex flex-col w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Instruction
            </div>
            <textarea
              placeholder="Write the activity's Instruction..."
              value={formik.values.instruction}
              onChange={(e) => {
                formik.setFieldValue('instruction', e.target.value);
                updateAddData('instruction', e.target.value);
              }}
              name="instruction"
              className={`w-full h-[62px] rounded-[16px] py-1 px-3 border ${
                showValidation && formik.errors.instruction
                  ? 'border-Red'
                  : 'border-Gray-50'
              } bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none`}
            />
            {showValidation && formik.errors.instruction && (
              <div className="text-Red text-[10px]">
                {formik.errors.instruction}
              </div>
            )}
          </div>
          <div className="flex flex-col w-full">
            <div className="text-xs font-medium text-Text-Primary">
              Priority Weight
            </div>
            <RangeCardLibraryActivity
              value={formik.values.score}
              changeValue={(key, value) => {
                formik.setFieldValue('score', value);
                updateAddData(key, value);
              }}
              showValidation={showValidation}
              error={Boolean(formik.errors.score)}
              required={true}
            />
            {/* {formik.touched.score && formik.errors.score && (
              <div className="text-Red text-xs mt-1">{formik.errors.score}</div>
            )} */}
          </div>
        </div>
        <div className="bg-[#E9EDF5] h-[328px] w-px"></div>
        <div className="flex flex-col gap-4">
          <div className="text-xs font-medium">Filters</div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-">
            <CustomSelect
              placeHolder="Type"
              options={TypesOptions}
              selectedOption={addData.type}
              onOptionSelect={(option: string) => updateAddData('type', option)}
            />
            <CustomSelect
              placeHolder="Terms"
              options={TermsOptions}
              isMulti
              selectedOption={addData.terms}
              onOptionSelect={(option: any) => updateAddData('terms', option)}
            />
            <CustomSelect
              placeHolder="Condition"
              isMulti
              options={ConditionsOptions}
              selectedOption={addData.condition}
              onOptionSelect={(option: any) => {
                updateAddData('condition', option);
                // console.log(option)
              }}
            />
            <CustomSelect
              placeHolder="Muscle"
              options={MuscleOptions}
              isMulti
              selectedOption={addData.muscle}
              onOptionSelect={(option: any) => updateAddData('muscle', option)}
            />
            <CustomSelect
              placeHolder="Equipment"
              options={EquipmentOptions}
              isMulti
              selectedOption={addData.equipment}
              onOptionSelect={(option: any) =>
                updateAddData('equipment', option)
              }
            />
            <CustomSelect
              placeHolder="Level"
              options={LevelOptions}
              selectedOption={addData.level}
              onOptionSelect={(option: any) => updateAddData('level', option)}
            />
          </div>
          <div className="flex flex-col text-xs gap-3 mt-2">
            Activity Location
            <div className="flex gap-6">
              <Checkbox
                checked={addData.location.includes('Home')}
                onChange={() => handleCheckboxChange('Home')}
                label="Home"
              />
              <Checkbox
                checked={addData.location.includes('Gym')}
                onChange={() => handleCheckboxChange('Gym')}
                label="Gym"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InformationStep;
