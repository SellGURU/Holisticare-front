/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useState } from 'react';
import InformationStep from './AddComponents/informationStep';
import ExersiceStep from './AddComponents/ExersiceStep';
import Application from '../../../api/app';

interface AddActivityProps {
  onClose: () => void;
}

const AddActivity: FC<AddActivityProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [sectionList,setSectionList] = useState([])
  const nextStep = () => {
    if (step === 0) {
      setStep(step + 1);
    } else {
      Application.addActivity({
        "Title": addData.title,
        "Description": addData.description,
        "Base_Score": addData.score,
        "Instruction": addData.instruction,
        "Sections": sectionList,
        "Activity_Filters": {
          "Conditions":addData.condition,
          "Equipment":addData.equipment,
          "Level":addData.level,
          "Muscle":addData.muscle,
          "Terms":addData.terms,
        },
        "Activity_Location": [addData.location]

      })
      console.log('save');
    }
  };
  const backStep = () => {
    if (step === 1) {
      setStep(step - 1);
    }
  };
  const [addData, setAddData] = useState({
    title: '',
    description: '',
    score: 0,
    instruction: '',
    type: '',
    terms: '',
    condition: '',
    muscle: '',
    equipment: '',
    level: '',
    location: '',
  });
  const updateAddData = (key: keyof typeof addData, value: any) => {
    setAddData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  return (
    <>
      <div
        className={`bg-white ${step === 0 ? 'w-[784px]' : 'w-[884px]'} p-4 rounded-[16px] h-full`}
      >
        <div className="flex w-full  justify-start">
          <div className="text-[14px] font-medium text-Text-Primary">
            Add Activity
          </div>
        </div>
        <div className="w-full h-[1px] bg-Boarder my-3"></div>
        <div className="min-h-[300px]">
          {step === 0 ? (
            <InformationStep addData={addData} updateAddData={updateAddData} />
          ) : (
            <ExersiceStep onChange={(values:any) => {
              setSectionList(values)
            }} />
          )}
        </div>
        <div
          className={`flex ${step === 0 ? 'justify-end' : 'justify-between'} items-center mb-1 mt-4`}
        >
          {step !== 0 && (
            <div
              onClick={backStep}
              className="text-Disable text-[14px] cursor-pointer font-medium flex items-center gap-1"
            >
              <img src="/icons/arrow-left.svg" alt="" className="w-5 h-5" />
              Back
            </div>
          )}

          <div className="flex items-center gap-3">
            <div
              onClick={onClose}
              className="text-Disable text-[14px] cursor-pointer font-medium"
            >
              Cancel
            </div>
            <div
              onClick={nextStep}
              className="text-Primary-DeepTeal text-[14px] cursor-pointer font-medium"
            >
              {step === 0 ? 'Next' : 'Save'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddActivity;
