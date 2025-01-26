import React, { useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom";
import MiniAnallyseButton from '../../Components/MiniAnalyseButton';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import Application from '../../api/app';
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface ActionProps {
  memberID: number | null;
}
interface RoadMapOption {
  id: string;
  description: string;
  action: string;
}

interface MessageOption extends RoadMapOption {
  isDone?: boolean;
}

export const Action: React.FC<ActionProps> = ({ memberID }) => {
  console.log(memberID);

  const [RoadMapData, SetRoadMapData] = useState<any>({});
  const [MessagesData, setMessagesData] = useState<MessageOption[]>([
    // {
    //   id: 1,
    //   title: "Option 1",
    //   description:
    //     "Considering the patient's current condition and limited resources while traveling, it would be best to adjust her exercise program and provide an alternative plan tailored to her situation.",
    //   isDone: false,
    // },
    // {
    //   id: 2,
    //   title: "Option 2",
    //   description:
    //     "The client is currently traveling and has forgotten to bring their prescription medications, with no access to replacements in the destination country. It is recommended to create an alternative plan for the 10-day travel period.",
    //   isDone: false,
    // },
  ]);
  //   const [isRoadMapOpen, setisRoadMapOpen] = useState(true);
  //   const [isMessagesOpen, setisMessagesOpen] = useState(true);
  const [isRoadCompleted] = useState(false);
  const handleMarkAsDone = (id: string) => {
    setMessagesData((prevData) =>
      prevData.map((message) =>
        message.id === id ? { ...message, isDone: true } : message,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setMessagesData((prevData) =>
      prevData.filter((message) => message.id !== id),
    );
  };
  const handleOptionDelete = (id: string) => {
    SetRoadMapData((prevData: any) =>
      prevData.options.filter((option: any) => option.id !== id),
    );
  };
  //   const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();

  const [showModal, setshowModal] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Application.driftPatientInfo({
          member_id: memberID,
        });

        if (response && response.data && response.data.State) {
          setDescription(response.data.State.description);
          setRecommendation(response.data.State.recommendation);
          setReference(response.data.State.reference);
          SetRoadMapData(response.data.RoadMap);

          setMessagesData(response.data.Message.options);
        } else {
          throw new Error('Invalid data structure');
        }

        console.log(response);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [memberID]);
  const [Description, setDescription] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [reference, setReference] = useState('');

  const toggleDaySelection = (
    categoryIndex: number,
    actionIndex: number,
    day: string,
  ) => {
    setData((prevData: any) => {
      const newData = { ...prevData };
      const action = newData[Object.keys(newData)[categoryIndex]][actionIndex];
      if (action.repeat_days.includes(day)) {
        action.repeat_days = action.repeat_days.filter(
          (d: string) => d !== day,
        );
      } else {
        action.repeat_days.push(day);
      }
      return newData;
    });
  };
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpand = (index: number) => {
    const newExpandedCategories = new Set(expandedCategories);
    if (newExpandedCategories.has(index)) {
      newExpandedCategories.delete(index);
    } else {
      newExpandedCategories.add(index);
    }
    setExpandedCategories(newExpandedCategories);
  };
  const [data, setData] = useState({});
  console.log(RoadMapData);
  const [isLoading, setisLoading] = useState(false);
  const [blockID, setblockID] = useState();
  const [buttonLoading, setbuttonLoading] = useState(false);
  const [isloadingAi, setisloadingAi] = useState(false);
  const [categoryLoadingStates, setCategoryLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  return (
    <>
      {showModal && (
        <SlideOutPanel
          headline="Edit Action Plan"
          isOpen={showModal}
          onClose={() => setshowModal(false)}
        >
          <div className="w-full flex justify-between items-center text-Text-Primary text-xs font-medium">
            Ordering
            <div className="w-8 h-8">
              <MiniAnallyseButton
                isLoading={isloadingAi}
                onResolve={(val) => {
                  setisloadingAi(true);
                  Application.generateAi({
                    input_dict: data,
                    ai_generation_mode: val,
                  })
                    .then((res) => setData({ ...res.data }))
                    .finally(() => setisloadingAi(false));
                }}
              />
            </div>
          </div>
          <div className=" w-full bg-backgroundColor-Card rounded-2xl px-4 py-3 border border-Gray-50 shadow-100 mt-3 max-h-[500px] overflow-auto   ">
            {Object.entries(data).map(
              ([categoryName, actions], categoryIndex) => (
                <div className="max-h-[]" key={categoryIndex}>
                  <div className="w-full flex justify-between items-start my-4">
                    <div className="flex items-center mb-2 gap-2">
                      <div className="bg-backgroundColor-Main border border-Gray-50 rounded-lg p-2 ">
                        {categoryName == 'Diet' && (
                          <img src={'/icons/diet.svg'} alt="" />
                        )}
                        {categoryName == 'Activity' && (
                          <img src={'/icons/weight.svg'} alt="" />
                        )}
                        {categoryName == 'Mind' && (
                          <img src={'/icons/mind.svg'} alt="" />
                        )}
                        {categoryName == 'Supplement' && (
                          <img src={'/icons/Supplement.svg'} alt="" />
                        )}
                      </div>
                      <h3 className="text-xs text-Text-Primary">
                        {categoryName}
                      </h3>

                      <MiniAnallyseButton
                        openFromRight
                        isLoading={categoryLoadingStates[categoryName]}
                        onResolve={(val) => {
                          setCategoryLoadingStates((prev) => ({
                            ...prev,
                            [categoryName]: true,
                          }));

                          const categoryData = {
                            [categoryName]: actions,
                          };

                          Application.generateAi({
                            input_dict: categoryData,
                            ai_generation_mode: val,
                          })
                            .then((res) => {
                              setData((prevData) => ({
                                ...prevData,
                                [categoryName]: res.data[categoryName],
                              }));
                            })
                            .finally(() =>
                              setCategoryLoadingStates((prev) => ({
                                ...prev,
                                [categoryName]: false,
                              })),
                            );
                        }}
                      />
                    </div>

                    <img
                      onClick={() => toggleExpand(categoryIndex)}
                      src="/icons/arrow-down.svg"
                      alt=""
                      className={`transition-transform duration-200 ${
                        expandedCategories.has(categoryIndex)
                          ? 'rotate-180'
                          : 'rotate-0'
                      }`}
                    />
                  </div>
                  {expandedCategories.has(categoryIndex) &&
                    (actions as any[]).map((action, actionIndex) => (
                      <div
                        key={actionIndex}
                        className="bg-white p-2 rounded-xl border border-Gray-50 text-[10px] text-Text-Primary mb-3"
                      >
                        <p>{action.instructions}</p>
                        <div className="mt-2 w-[200px] lg:w-[224px] h-[32px] border rounded-[4px] text-xs bg-white border-Gray-50 inline-flex">
                          {[
                            'Sat',
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                          ].map((day) => (
                            <div
                              key={day}
                              onClick={() =>
                                toggleDaySelection(
                                  categoryIndex,
                                  actionIndex,
                                  day,
                                )
                              }
                              className={`w-full cursor-pointer border-r border-Gray-50 flex items-center justify-center bg-white ${
                                action.repeat_days.includes(day)
                                  ? 'text-Primary-EmeraldGreen'
                                  : 'text-Text-Primary'
                              }`}
                            >
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ),
            )}
          </div>
          <div className="w-full flex justify-center mt-5">
            <ButtonPrimary
              onClick={() => {
                setbuttonLoading(true);
                Application.ActionPlanSaveTask({
                  member_id: memberID,
                  blocks_id: blockID,
                  tasks: data,
                })
                  .then(() => toast.success('Tasks saved successfully!'))
                  .finally(() => setbuttonLoading(false));
              }}
            >
              {buttonLoading ? (
                <div className="">
                  <BeatLoader size={5} color="#ffffff"></BeatLoader>
                </div>
              ) : (
                <>
                  <img src="/icons/tick-square.svg" alt="" />
                  Save Changes
                </>
              )}
            </ButtonPrimary>
          </div>
        </SlideOutPanel>
      )}
      <div className="w-full flex flex-col gap-2 ">
        <div className="w-full h-fit bg-white rounded-2xl  shadow-200 p-4 text-Text-Primary">
          <div className="text-sm font-medium">State</div>
          <p className="text-xs text-justify my-2">{Description}</p>
          <p className="text-xs text-justify ">{recommendation}</p>
          {reference && (
            <a className="text-xs text-[#55B0FF]" href="">
              {reference}/
            </a>
          )}
        </div>
        <div className="w-full  h-[220px] overflow-y-scroll  bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
          <div className="w-full flex justify-between items-center">
            <h5 className="text-sm font-medium text-light-primary-text dark:text-primary-text">
              Road Map
            </h5>
            {/* <img
            onClick={() => setisRoadMapOpen(!isRoadMapOpen)}
            className={` ${
              isRoadMapOpen && "rotate-180"
            } w-4 h-4 transition-transform cursor-pointer invert dark:invert-0`}
            src=""
            alt=""
          /> */}
            <MiniAnallyseButton
              isLoading={isLoading}
              onResolve={(val) => {
                setisLoading(true);
                Application.generateAi({
                  input_dict: {
                    RoadMap: RoadMapData,
                  },
                  ai_generation_mode: val,
                })
                  .then((res) => SetRoadMapData(res.data.RoadMap))
                  .finally(() => setisLoading(false));
              }}
            ></MiniAnallyseButton>
          </div>
          {isRoadCompleted ? (
            <div className="flex flex-col  items-center justify-center">
              <img src="./Themes/Aurora/icons/Done.svg" alt="" />
              <div className="font-medium text-sm text-light-primary-text dark:text-primary-text">
                Setup completed!
              </div>
              <div className="text-xs text-light-secandary-text-text dark:text-secondary-text t mt-1">
                Congratulations, you are all set up!
              </div>
            </div>
          ) : (
            <div className={`flex flex-col gap-2 pr-3 mt-2`}>
              {RoadMapData.options?.map((option: any) => (
                <AccordionCard
                  onClick={() => {
                    Application.driftAction({ member_id: memberID })
                      .then((res) => {
                        setData(res.data.plan), setblockID(res.data.block_id);
                      })
                      .catch((err) => console.log(err))
                      .finally(() => setshowModal(true));
                  }}
                  onDelete={() => handleOptionDelete(option.id)}
                  key={option.id}
                  title={option.id}
                  description={option.description}
                  buttonText={option.action}
                />
              ))}
            </div>
          )}
        </div>
        <div className="w-full h-full max-h-[156px] overflow-y-auto bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
          <div className="w-full flex justify-between items-center">
            <h5 className="text-sm font-medium text-light-primary-text dark:text-primary-text">
              Messages{' '}
            </h5>
            {/* <img
            onClick={() => setisMessagesOpen(!isMessagesOpen)}
            className={` ${
              isMessagesOpen && "rotate-180"
            } invert dark:invert-0 w-4 h-4 transition-transform cursor-pointer`}
            src="./Themes/Aurora/icons/chevron-down.svg"
            alt=""
          /> */}
          </div>
          <div
            className={`flex flex-col gap-3 pr-3 mt-5  max-h-[220px] overflow-auto `}
          >
            {MessagesData.map((option) =>
              option.isDone ? (
                <div className="w-[320px] p-4 border border-Gray-50 text-Text-Primary rounded-md flex items-center gap-3">
                  <img src="/icons/tick-circle.svg" alt="" />
                  <div className="border-l border-gray-600 pl-4 text-xs ">
                    Message sent successfully.
                  </div>
                </div>
              ) : (
                <AccordionCard
                  key={option.id}
                  title={option.id}
                  description={option.description}
                  onClick={() => handleMarkAsDone(option.id)}
                  onDelete={() => handleDelete(option.id)}
                  buttonText={option.action}
                />
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
};
interface AccordionCardProps {
  title: string;
  description: string;
  onClick: () => void;
  onDelete: () => void;
  buttonText: string;
}
const AccordionCard: React.FC<AccordionCardProps> = ({
  title,
  description,
  onClick,
  onDelete,
  buttonText,
}) => {
  return (
    <div className=" bg-backgroundColor-Card border border-Gray-50 w-full  p-4 rounded-lg flex justify-between items-center text-Text-Primary">
      <div className="flex gap-3 items-center">
        <h6 className="text-xs font-medium">{title}</h6>
        <div className="border-l border-Secondary-SelverGray pl-4 pr-4 text-xs font-normal text-justify max-w-[810px] ">
          {description}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ButtonPrimary onClick={onClick}> {buttonText}</ButtonPrimary>

        <img
          onClick={onDelete}
          className="w-4 h-4 cursor-pointer"
          src="/icons/close.svg"
          alt=""
        />
      </div>
    </div>
  );
};
