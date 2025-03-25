/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import SearchBox from '../../../../Components/SearchBox';
import TabNavigation from './TabNavigation';
import Application from '../../../../api/app';
import ExerciseItem from './ExersiseItem';

interface Exercise {
  Title: string;
  Description: string;
  Instruction: string;
  Base_Score: number;
  Files: Array<{
    Title: string;
    Type: string;
    Content: {
      url?: string;
      file_id?: string;
    };
  }>;
}

interface ExerciseSet {
  Exercise: Exercise;
  Weight: string;
  Reps: string;
  Rest: string;
}

interface ExerciseGroup {
  Type: string;
  Section: string;
  Sets: string;
  Exercises: ExerciseSet[];
}

interface ExersiceStepProps {
  onChange: (data: Array<ExerciseGroup>) => void;
}
const ExersiceStep: React.FC<ExersiceStepProps> = ({onChange}) => {
  const [exercises, setExercises] = useState<ExerciseGroup[]>([]);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState('Warm-Up');
  useEffect(() => {
    Application.getExercisesList({}).then((res) => {
      setExerciseList(res.data);
    });
  }, []);

  const addExercise = (exercise: Exercise) => {
    const resolveExercise: ExerciseGroup = {
      Type: 'Normalset',
      Section: activeTab,
      Sets: '',
      Exercises: [
        {
          Exercise: exercise,
          Weight: '',
          Reps: '',
          Rest: '',
        },
      ],
    };
    setExercises((prevExercises) => [...prevExercises, resolveExercise]);
  };

  // const removeExercise = (index: number) => {
  //   setExercises((prevExercises) => prevExercises.filter((_, i) => i !== index));
  // };
  useEffect(() => {
    onChange(exercises)
  },[exercises, onChange])

  return (
    <>
      <div className="w-full mt-6">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex w-full items-center justify-between">
          <div
            className={`w-[530px] h-[432px] border border-Gray-50 rounded-xl flex flex-col items-center ${!exercises.length && 'justify-center'} p-3 overflow-y-auto`}
          >
            {exercises.length == 0 && (
              <>
                <img src="/icons/amico.svg" alt="" />
                <div className="font-medium text-xs text-Text-Primary mt-8">
                  No exercise existed yet.
                </div>
              </>
            )}
            <div className="grid gap-2 w-full">
              {exercises
                .filter((el: any) => el.Section === activeTab)
                .map((exercise: any, index: any) => {
                  return (
                    <ExerciseItem
                      key={index}
                      index={index}
                      exercise={exercise}
                    />
                  );
                })}
            </div>
          </div>
          <div className="w-[314px] h-[432px] rounded-xl bg-backgroundColor-Main flex flex-col p-3">
            <div className="flex w-full items-center justify-between mt-1">
              <div className="font-medium text-sm text-Text-Primary">
                Exercise
              </div>
              <div className="flex items-center gap-1 text-Primary-DeepTeal font-medium text-xs cursor-pointer">
                <img src="/icons/add-blue.svg" alt="" className="w-5 h-5" />
                Add Exercise
              </div>
            </div>
            <SearchBox
              ClassName="rounded-2xl !h-8 !min-w-full border border-Gray-50 !py-[0px] !px-3 !shadow-[unset] !bg-white mt-3"
              placeHolder="Search ..."
              onSearch={() => {}}
            />
            <div className="flex flex-col overflow-y-auto w-full min-h-[300px] gap-1 mt-1">
              {exerciseList.map((el: any) => {
                return (
                  <>
                    <div className="w-full h-[40px] bg-white px-2 py-1 rounded-xl flex items-center justify-between">
                      <div className="flex items-center justify-center gap-[5px]">
                        <div className="relative">
                          <img
                            src="/images/activity/activity-demo.png"
                            alt=""
                            className="w-8 h-8 bg-cover rounded-lg mr-1"
                          />
                          <img
                            src="/icons/video-octagon.svg"
                            alt=""
                            className="w-[17.79px] h-[17.79px] absolute top-[7px] left-[7px]"
                          />
                        </div>
                        <div className="text-xs text-Text-Primary">
                          {el.Title}
                        </div>
                        <div className="text-[8px] text-Text-Quadruple">
                          (2 Videos)
                        </div>
                      </div>
                      <img
                        onClick={() => addExercise(el)}
                        src="/icons/add-blue.svg"
                        alt=""
                        className="w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExersiceStep;
