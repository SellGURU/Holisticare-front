/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import InformationStep from './AddComponents/informationStep';
import ExersiceStep from './AddComponents/ExersiceStep';
import Application from '../../../api/app';
// import SectionOrderModal from './AddComponents/SectionOrder';

interface AddActivityProps {
  onClose: () => void;
  editid: string | null;
  onSave: () => void;
}

const AddActivity: FC<AddActivityProps> = ({ onClose, onSave, editid }) => {
  const [step, setStep] = useState(0);
  // const [showSectionOrder, setShowSectionOrder] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isExerciseStepValid, setIsExerciseStepValid] = useState(false);
  const rsolveSectionListforSendToApi = () => {
    return sectionList.map((item: any) => {
      return {
        ...item,
        Exercises: item.Exercises.map((val: any) => {
          return {
            Exercise_Id: val.Exercise.Exercise_Id,
            Weight: val.Weight,
            Reps: val.Reps,
            Rest: val.Rest,
          };
        }),
      };
    });
  };
  const nextStep = () => {
    if (step === 0) {
      // Validate required fields before proceeding
      if (!isFormValid) {
        // Show validation errors
        return;
      }
      setStep(step + 1);
    } else {
      // Validate that there's at least one section before saving
      if (!isExerciseStepValid) {
        // Show validation error
        return;
      }

      if (editid) {
        Application.editActivity({
          Title: addData.title,
          Description: addData.description,
          Base_Score: addData.score,
          Instruction: addData.instruction,
          Sections: rsolveSectionListforSendToApi(),
          Activity_Filters: {
            Conditions: addData.condition,
            Equipment: addData.equipment,
            Type: [addData.type],
            Level: [addData.level],
            Muscle: addData.muscle,
            Terms: addData.terms,
          },
          Activity_Location: addData.location,
          Act_Id: editid,
        }).then(() => {
          onSave();
        });
      } else {
        Application.addActivity({
          Title: addData.title,
          Description: addData.description,
          Base_Score: addData.score,
          Instruction: addData.instruction,
          Sections: rsolveSectionListforSendToApi(),
          Activity_Filters: {
            Conditions: addData.condition,
            Equipment: addData.equipment,
            Type: [addData.type],
            Level: [addData.level],
            Muscle: addData.muscle,
            Terms: addData.terms,
          },
          Activity_Location: addData.location,
        }).then(() => {
          onSave();
        });
      }
    }
  };
  const backStep = () => {
    if (step === 1) {
      setStep(step - 1);
    }
  };
  useEffect(() => {
    if (editid) {
      Application.getActivity(editid).then((res) => {
        setAddData({
          title: res.data.Title,
          description: res.data.Description,
          score: res.data.Base_Score,
          instruction: res.data.Instruction,
          type: res.data.Activity_Filters.Type,
          terms: res.data.Activity_Filters.Terms,
          condition: res.data.Activity_Filters.Conditions,
          muscle: res.data.Activity_Filters.Muscle,
          equipment: res.data.Activity_Filters.Equipment,
          level: res.data.Activity_Filters.Level,
          location: res.data.Activity_Location,
        });
        setSectionList(
          res.data.Sections.map((item: any) => {
            return {
              ...item,
              Exercises: item.Exercises.map((val: any) => {
                return {
                  Reps: val.Reps,
                  Rest: val.Rest,
                  Weight: val.Weight,
                  Exercise: {
                    ...val,
                  },
                };
              }),
            };
          }),
        );
      });
    }
  }, [editid]);
  const [addData, setAddData] = useState({
    title: '',
    description: '',
    score: 0,
    instruction: '',
    type: '',
    terms: [],
    condition: [],
    muscle: [],
    equipment: [],
    level: '',
    location: [],
  });
  const updateAddData = (key: keyof typeof addData, value: any) => {
    setAddData((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  // Check if form is valid whenever addData changes
  useEffect(() => {
    setIsFormValid(
      addData.title.trim() !== '' && addData.instruction.trim() !== '',
    );
  }, [addData.title, addData.instruction]);

  // Check if exercise step is valid whenever sectionList changes
  useEffect(() => {
    const emptySetSections = sectionList.filter(
      (section: any) => section.Sets == '',
    );
    setIsExerciseStepValid(
      sectionList.length > 0 && emptySetSections.length == 0,
    );
  }, [sectionList]);

  return (
    <>
      <div
        className={`bg-white ${step === 0 ? 'w-[784px]' : 'w-[884px]'} p-4 rounded-[16px] h-full`}
      >
        <div className="flex w-full  justify-start">
          <div className="text-[14px] font-medium text-Text-Primary">
            {editid ? 'Edit Activity' : 'Add Activity'}
          </div>
        </div>
        <div className="w-full h-[1px] bg-Boarder my-3"></div>
        <div className="min-h-[300px]">
          {step === 0 ? (
            <InformationStep addData={addData} updateAddData={updateAddData} />
          ) : (
            <ExersiceStep
              sectionList={sectionList}
              onChange={(values: any) => {
                setSectionList(values);
              }}
            />
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
              onClick={step === 0 && !isFormValid ? undefined : nextStep}
              className={`text-Primary-DeepTeal text-[14px] ${
                (step === 0 && !isFormValid) ||
                (step === 1 && !isExerciseStepValid)
                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer font-medium'
              }`}
            >
              {step === 0 ? 'Next' : editid ? 'Update' : 'Save'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddActivity;
