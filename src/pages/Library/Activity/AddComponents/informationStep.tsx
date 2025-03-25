/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import Checkbox from '../../../../Components/checkbox';
import CustomSelect from '../../../../Components/CustomSelect';
import TextField from '../../../../Components/TextField';
import RangeCardLibraryActivity from './RangeCard';
import Application from '../../../../api/app';

interface InformationStepProps {
  addData: {
    title: string;
    description: string;
    score: number;
    instruction: string;
    type: string;
    terms: string;
    condition: string;
    muscle: string;
    equipment: string;
    level: string;
    location: string;
  };
  updateAddData: (
    key:
      | 'type'
      | 'title'
      | 'description'
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
}

const InformationStep: FC<InformationStepProps> = ({
  addData,
  updateAddData,
}) => {
  const [ConditionsOptions, setConditionsOptions] = useState([]);
  const [EquipmentOptions, setEquipmentOptions] = useState([]);
  const [LevelOptions, setLevelOptions] = useState([]);
  const [MuscleOptions, setMuscleOptions] = useState([]);
  const [TermsOptions, setTermsOptions] = useState([]);
  const [TypesOptions, setTypeOptions] = useState([]);
  // const [type, setType] = useState('');
  // const [terms, setTerms] = useState('');
  // const [condition, setCondition] = useState('');
  // const [muscle, setMuscle] = useState('');
  // const [equipment, setEquipment] = useState('');
  // const [level, setLevel] = useState('');
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
    updateAddData('location', addData.location === value ? '' : value);
  };
  return (
    <>
      <div className="w-full flex gap-4 mt-6 relative">
        <div className="flex flex-col gap-4">
          <TextField
            type="text"
            newStyle
            label="Title"
            placeholder="Write the activity’s title..."
            value={addData.title}
            onChange={(e) => updateAddData('title', e.target.value)}
            className="w-[360px]"
          />
          <div className="flex flex-col w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Description
            </div>
            <textarea
              placeholder="Write the activity’s description..."
              value={addData.description}
              onChange={(e) => updateAddData('description', e.target.value)}
              className="w-full h-[62px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <div className="text-xs font-medium text-Text-Primary">
              Base Weight
            </div>
            <RangeCardLibraryActivity
              value={addData.score}
              changeValue={updateAddData}
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <div className="text-xs font-medium text-Text-Primary">
              Instruction
            </div>
            <textarea
              placeholder="Write the activity’s Instruction..."
              value={addData.instruction}
              onChange={(e) => updateAddData('instruction', e.target.value)}
              className="w-full h-[62px] rounded-[16px] py-1 px-3 border border-Gray-50 bg-backgroundColor-Card text-xs font-light placeholder:text-Text-Fivefold resize-none"
            />
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
              selectedOption={addData.terms}
              onOptionSelect={(option: string) =>
                updateAddData('terms', option)
              }
            />
            <CustomSelect
              placeHolder="Condition"
              options={ConditionsOptions}
              selectedOption={addData.condition}
              onOptionSelect={(option: string) =>
                updateAddData('condition', option)
              }
            />
            <CustomSelect
              placeHolder="Muscle"
              options={MuscleOptions}
              selectedOption={addData.muscle}
              onOptionSelect={(option: string) =>
                updateAddData('muscle', option)
              }
            />
            <CustomSelect
              placeHolder="Equipment"
              options={EquipmentOptions}
              selectedOption={addData.equipment}
              onOptionSelect={(option: string) =>
                updateAddData('equipment', option)
              }
            />
            <CustomSelect
              placeHolder="Level"
              options={LevelOptions}
              selectedOption={addData.level}
              onOptionSelect={(option: string) =>
                updateAddData('level', option)
              }
            />
          </div>
          <div className="flex flex-col text-xs gap-3 mt-2">
            Exercise Location
            <div className="flex gap-6">
              <Checkbox
                checked={addData.location === 'Home'}
                onChange={() => handleCheckboxChange('Home')}
                label="Home"
              />
              <Checkbox
                checked={addData.location === 'Gym'}
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
