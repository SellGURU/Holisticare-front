/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Checkbox from '../../../../Components/checkbox';
import CustomSelect from '../../../../Components/CustomSelect';
import Application from '../../../../api/app';
import { TextField } from '../../../../Components/UnitComponents';
import TextAreaField from '../../../../Components/UnitComponents/TextAreaField';
import ValidationForms from '../../../../utils/ValidationForms';
import RangeCardLibraryThreePages from '../../../../Components/LibraryThreePages/components/RangeCard';

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
    clinical_guidance: string;
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
      | 'location'
      | 'clinical_guidance',
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
  const [locationBoxs, setLocationBoxs] = useState([]);

  useEffect(() => {
    Application.getExerciseFilters({}).then((res) => {
      setConditionsOptions(res.data.Conditions);
      setEquipmentOptions(res.data.Equipment);
      setMuscleOptions(res.data.Muscle);
      setLevelOptions(res.data.Level);
      setTermsOptions(res.data.Terms);
      setTypeOptions(res.data.Type);
      setLocationBoxs(res.data.Location);
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
          <TextField
            label="Title"
            placeholder="Write the activity's title..."
            margin="!w-[360px]"
            value={addData.title}
            onChange={(e) => {
              updateAddData('title', e.target.value);
            }}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField('Title', addData.title)
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText('Title', addData.title)
                : ''
            }
          />

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

          <TextAreaField
            label="Instruction"
            placeholder="Write the activity's Instruction..."
            value={addData.instruction}
            onChange={(e) => {
              updateAddData('instruction', e.target.value);
            }}
            isValid={
              showValidation
                ? ValidationForms.IsvalidField(
                    'Instruction',
                    addData.instruction,
                  )
                : true
            }
            validationText={
              showValidation
                ? ValidationForms.ValidationText(
                    'Instruction',
                    addData.instruction,
                  )
                : ''
            }
            margin="mt-0"
          />
          <div className="flex flex-col w-full">
            <div className="text-xs font-medium text-Text-Primary">
              Priority Weight
            </div>
            <RangeCardLibraryThreePages
              value={addData.score}
              onChange={(value) => {
                updateAddData('score', value);
              }}
              isValid={
                showValidation
                  ? ValidationForms.IsvalidField('Score', addData.score)
                  : true
              }
              validationText={
                showValidation
                  ? ValidationForms.ValidationText('Score', addData.score)
                  : ''
              }
            />
          </div>
          {/* Clinical Guidance Field */}
          <TextAreaField
            label="Clinical Guidance"
            placeholder="Enter clinical notes (e.g., Avoid in pregnancy; monitor in liver conditions)"
            value={addData.clinical_guidance}
            onChange={(e) => {
              updateAddData('clinical_guidance', e.target.value);
            }}
            margin="mt-0"
          />
        </div>
        <div className="bg-[#E9EDF5] h-[362px] w-px"></div>
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
            <div className="flex flex-wrap gap-6">
              {locationBoxs.map((el) => {
                return (
                  <Checkbox
                    checked={addData.location.includes(el)}
                    onChange={() => handleCheckboxChange(el)}
                    label={el}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InformationStep;
