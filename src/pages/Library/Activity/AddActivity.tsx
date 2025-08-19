/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import InformationStep from './AddComponents/informationStep';
import ExersiceStep from './AddComponents/ExersiceStep';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';
import SpinnerLoader from '../../../Components/SpinnerLoader';
// import SectionOrderModal from './AddComponents/SectionOrder';

interface AddActivityProps {
  onClose: () => void;
  editid: string | null;
  onSave: () => void;
}

const AddActivity: FC<AddActivityProps> = ({ onClose, onSave, editid }) => {
  const [step, setStep] = useState(0);
  // const [showSectionOrder, setShowSectionOrder] = useState(false);
  const [loading, setLoading] = useState(editid ? true : false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isExerciseStepValid, setIsExerciseStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showExerciseValidation, setShowExerciseValidation] = useState(false);
  const [activityLibrary, setActivityLibrary] = useState<
    { title: string; uid: string }[]
  >([]);
  useEffect(() => {
    Application.getActivityLibrary().then((res) => {
      setActivityLibrary(res.data);
    });
  }, []);
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
      setShowValidation(true);
      // Validate required fields before proceeding
      if (!isFormValid) {
        // Show validation errors
        return;
      }
      setStep(1);
      setShowValidation(false);
    } else {
      setShowExerciseValidation(true);
      // Validate that there's at least one section before saving
      if (!isExerciseStepValid) {
        // Show validation error
        return;
      }

      if (editid) {
        setLoadingCall(true);
        Application.editActivity({
          Title: addData.title,
          // Description: addData.description,
          Base_Score: addData.score,
          Instruction: addData.instruction,
          Ai_note: addData.clinical_guidance,
          Sections: rsolveSectionListforSendToApi(),
          Activity_Filters: {
            Conditions: addData.condition,
            Equipment: addData.equipment,
            Type: addData.type ? [addData.type] : [],
            Level: addData.level ? [addData.level] : [],
            Muscle: addData.muscle,
            Terms: addData.terms,
          },
          Activity_Location: addData.location,
          Act_Id: editid,
          Parent_Id:
            activityLibrary.find(
              (value: any) => value.title === addData.Parent_Title,
            )?.uid || '',
        })
          .then(() => {
            onSave();
            setShowExerciseValidation(false);
            setShowValidation(false);
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            setLoadingCall(false);
          });
      } else {
        setLoadingCall(true);
        Application.addActivity({
          Title: addData.title,
          // Description: addData.description,
          Base_Score: addData.score,
          Instruction: addData.instruction,
          Ai_note: addData.clinical_guidance,
          Sections: rsolveSectionListforSendToApi(),
          Activity_Filters: {
            Conditions: addData.condition,
            Equipment: addData.equipment,
            Type: addData.type ? [addData.type] : [],
            Level: addData.level ? [addData.level] : [],
            Muscle: addData.muscle,
            Terms: addData.terms,
          },
          Activity_Location: addData.location,
          Parent_Id:
            activityLibrary.find(
              (value: any) => value.title === addData.Parent_Title,
            )?.uid || '',
        })
          .then(() => {
            onSave();
            setShowExerciseValidation(false);
            setShowValidation(false);
          })
          .catch((err) => {
            console.error(err);
          })
          .finally(() => {
            setLoadingCall(false);
          });
      }
    }
  };
  const backStep = () => {
    if (step === 1) {
      setStep(0);
      setShowExerciseValidation(false);
      setShowValidation(false);
    }
  };
  useEffect(() => {
    if (editid) {
      Application.getActivity(editid).then((res) => {
        setAddData({
          title: res.data.Title,
          // description: res.data.Description,
          score: res.data.Base_Score,
          instruction: res.data.Instruction,
          type:
            res.data.Activity_Filters.Type.length > 0
              ? res.data.Activity_Filters.Type[0]
              : '',
          terms: res.data.Activity_Filters.Terms,
          condition: res.data.Activity_Filters.Conditions,
          muscle: res.data.Activity_Filters.Muscle,
          equipment: res.data.Activity_Filters.Equipment,
          level:
            res.data.Activity_Filters.Level.length > 0
              ? res.data.Activity_Filters.Level[0]
              : '',
          location: res.data.Activity_Location,
          clinical_guidance: res.data.Ai_note,
          Parent_Title: res.data.Parent_Title,
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
        setLoading(false);
      });
    }
  }, [editid]);
  const [addData, setAddData] = useState({
    title: '',
    // description: '',
    score: 0,
    instruction: '',
    type: '',
    terms: [],
    condition: [],
    muscle: [],
    equipment: [],
    level: '',
    location: [],
    clinical_guidance: '',
    Parent_Title: '',
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
      addData.title.trim() !== '' &&
        addData.instruction.trim() !== '' &&
        addData.score > 0 &&
        addData.Parent_Title.trim() !== '',
    );
  }, [addData.title, addData.instruction, addData.score, addData.Parent_Title]);

  // Check if exercise step is valid whenever sectionList changes
  useEffect(() => {
    const emptySetSections = sectionList.filter(
      (section: any) => section.Sets === '',
    );
    const emptyRepsSections = sectionList.filter((section: any) =>
      section.Exercises.some((exercise: any) => exercise.Reps === ''),
    );
    setIsExerciseStepValid(
      sectionList.length > 0 &&
        emptySetSections.length == 0 &&
        emptyRepsSections.length == 0,
    );
  }, [sectionList]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-[50]">
          <Circleloader></Circleloader>
        </div>
      )}
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
            <InformationStep
              showValidation={showValidation}
              addData={addData}
              updateAddData={updateAddData}
              activityLibrary={activityLibrary}
              mode={editid ? 'edit' : 'add'}
            />
          ) : (
            <ExersiceStep
              showValidation={showExerciseValidation}
              setShowValidation={(val: any) => {
                setShowExerciseValidation(val);
              }}
              sectionList={sectionList}
              onChange={(values: any) => {
                setSectionList(values);
              }}
              onValidationChange={setIsExerciseStepValid}
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
              onClick={nextStep}
              className={`text-Primary-DeepTeal text-[14px] cursor-pointer font-medium`}
            >
              {!loadingCall ? (
                step === 0 ? (
                  'Next'
                ) : editid ? (
                  'Update'
                ) : (
                  'Save'
                )
              ) : (
                <SpinnerLoader color="#005F73" />
              )}
            </div>
            {/* <div
              onClick={step === 0 && !isFormValid ? undefined : nextStep}
              className={`text-Primary-DeepTeal text-[14px] ${
                (step === 0) ||
                (step === 1 && !isExerciseStepValid)
                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer font-medium'
              }`}
            >
              {step === 0 ? 'Next' : editid ? 'Update' : 'Save'}
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AddActivity;
