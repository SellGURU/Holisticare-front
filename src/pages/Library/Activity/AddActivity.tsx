/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
import InformationStep from './AddComponents/informationStep';
import ExersiceStep2 from './AddComponents/excercieModal2/ExersiceStep2';
import Application from '../../../api/app';
import Circleloader from '../../../Components/CircleLoader';
import SpinnerLoader from '../../../Components/SpinnerLoader';

interface AddActivityProps {
  onClose: () => void;
  editid: string | null;
  onSave: () => void;
}

type Step = 'info' | 'groups' | 'exercises';

const AddActivity: FC<AddActivityProps> = ({ onClose, onSave, editid }) => {
  const [step, setStep] = useState<Step>('info');

  const [loading, setLoading] = useState(!!editid);
  const [loadingCall, setLoadingCall] = useState(false);

  const [sectionList, setSectionList] = useState<any[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isExerciseStepValid, setIsExerciseStepValid] = useState(false);

  const [showValidation, setShowValidation] = useState(false);
  const [showExerciseValidation, setShowExerciseValidation] = useState(false);

  const [activityLibrary, setActivityLibrary] = useState<
    { title: string; uid: string }[]
  >([]);

  /* ---------------- API ---------------- */

  useEffect(() => {
    Application.getActivityLibrary().then((res) => {
      setActivityLibrary(res.data);
    });
  }, []);

  /* ---------------- ADD DATA ---------------- */

  const [addData, setAddData] = useState({
    title: '',
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
    Set_Order: [
      { name: 'Warm-Up', enabled: true, order: 1 },
      { name: 'Main work out', enabled: true, order: 2 },
      { name: 'Cool Down', enabled: true, order: 3 },
      { name: 'Recovery', enabled: true, order: 4 },
      { name: 'Finisher', enabled: true, order: 5 },
    ],
  });

  const updateAddData = (key: keyof typeof addData, value: any) => {
    setAddData((prev) => ({ ...prev, [key]: value }));
  };

  const handleChangeSetOrder = (value: typeof addData.Set_Order) => {
    setAddData((prev) => ({ ...prev, Set_Order: value }));
  };

  /* ---------------- VALIDATION ---------------- */

  useEffect(() => {
    setIsFormValid(
      addData.title.trim() !== '' &&
        addData.instruction.trim() !== '' &&
        addData.score > 0 &&
        (addData.Parent_Title.trim() !== '' || editid !== null),
    );
  }, [addData, editid]);

  useEffect(() => {
    const invalid =
      sectionList.length === 0 ||
      sectionList.some(
        (s: any) =>
          s.Sets === '' ||
          s.Exercises.some((e: any) => e.Reps === ''),
      );

    setIsExerciseStepValid(!invalid);
  }, [sectionList]);

  /* ---------------- STEP NAVIGATION ---------------- */

  const nextStep = () => {
    if (step === 'info') {
      setShowValidation(true);
      if (!isFormValid) return;
      setShowValidation(false);
      setStep('groups');
      return;
    }

    if (step === 'groups') {
      if (!sectionList.length) return;
      setStep('exercises');
      return;
    }

    if (step === 'exercises') {
      setShowExerciseValidation(true);
      if (!isExerciseStepValid) return;
      saveActivity();
    }
  };

  const backStep = () => {
    if (step === 'groups') setStep('info');
    if (step === 'exercises') setStep('groups');
  };

  /* ---------------- SAVE ---------------- */

  const resolveSectionsForApi = () =>
    sectionList.map((item: any) => ({
      ...item,
      Exercises: item.Exercises.map((val: any) => ({
        Exercise_Id: val.Exercise.Exercise_Id,
        Weight: val.Weight,
        Reps: val.Reps,
        Rest: val.Rest,
      })),
    }));

  const saveActivity = () => {
    setLoadingCall(true);

    const payload = {
      Title: addData.title,
      set_order: addData.Set_Order,
      Base_Score: addData.score,
      Instruction: addData.instruction,
      Ai_note: addData.clinical_guidance,
      Sections: resolveSectionsForApi(),
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
          (v) => v.title === addData.Parent_Title,
        )?.uid || '',
      ...(editid && { Act_Id: editid }),
    };

    const request = editid
      ? Application.editActivity(payload)
      : Application.addActivity(payload);

    request
      .then(onSave)
      .finally(() => setLoadingCall(false));
  };

  /* ---------------- EDIT LOAD ---------------- */

  useEffect(() => {
    if (!editid) return;

    Application.getActivity(editid).then((res) => {
      setAddData({
        ...addData,
        title: res.data.Title,
        score: res.data.Base_Score,
        instruction: res.data.Instruction,
        clinical_guidance: res.data.Ai_note,
        Parent_Title: res.data.Parent_Title,
        Set_Order: res.data.Set_Order,
      });

      setSectionList(
        res.data.Sections.map((s: any) => ({
          ...s,
          Exercises: s.Exercises.map((e: any) => ({
            Reps: e.Reps,
            Rest: e.Rest,
            Weight: e.Weight,
            Exercise: { ...e },
          })),
        })),
      );

      setLoading(false);
    });
  }, [editid]);

  /* ---------------- UI ---------------- */

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
          <Circleloader />
        </div>
      )}

  <div
        className={`bg-white ${step === 'info' ? 'w-[90vw] md:w-[800px]' : 'w-[90vw] md:w-[884px]'} p-4 rounded-[16px] h-full`}
      >
        <div className="text-sm font-medium">
          {editid ? 'Edit Activity' : 'Add Activity'}
        </div>

        <div className="h-px bg-Boarder my-3" />

        <div className="min-h-[300px]">
          {step === 'info' && (
            <InformationStep
              showValidation={showValidation}
              addData={addData}
              updateAddData={updateAddData}
              activityLibrary={activityLibrary}
              mode={editid ? 'edit' : 'add'}
            />
          )}

          {step !== 'info' && (
            <ExersiceStep2
             
              sectionList={sectionList}
              orderList={addData.Set_Order}
              handleChangeSetOrder={handleChangeSetOrder}
              onChange={setSectionList}
              showValidation={showExerciseValidation}
              onValidationChange={setIsExerciseStepValid}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between mt-4">
          {step !== 'info' ? (
            <div
              onClick={backStep}
              className="cursor-pointer text-sm text-gray-400 flex items-center gap-1"
            >
              ← Back
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <span onClick={onClose} className="cursor-pointer text-gray-400">
              Cancel
            </span>

            <span
              onClick={nextStep}
              className="cursor-pointer text-Primary-DeepTeal font-medium"
            >
              {!loadingCall ? (
                step === 'exercises'
                  ? editid
                    ? 'Update'
                    : 'Save'
                  : 'Next'
              ) : (
                <SpinnerLoader color="#005F73" />
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddActivity;
