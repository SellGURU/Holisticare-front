/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useEffect, useState } from 'react';
// import { useNavigate } from "react-router-dom";
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ButtonPrimary } from '../../Components/Button/ButtonPrimary';
import Circleloader from '../../Components/CircleLoader';
import MiniAnallyseButton from '../../Components/MiniAnalyseButton';
import { SlideOutPanel } from '../../Components/SlideOutPanel';
import Application from '../../api/app';
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

// Add this CSS at the top of the file or in your global CSS file

export const Action: FC<ActionProps> = ({ memberID }) => {
  const [RoadMapData, SetRoadMapData] = useState<MessageOption[]>([]);
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
  const [isRoadCompleted, setIsRoadCompleted] = useState(false);
  useEffect(() => {
    // Check if all roadmap options are processed
    const allProcessed = RoadMapData.every((option) => option.isDone);
    setIsRoadCompleted(allProcessed);
  }, [RoadMapData]);

  const handleMessageDone = (id: string, Description: string) => {
    Application.driftAnalysisApporve({
      member_id: memberID,
      description: Description,
    }).then(() => {
      setMessagesData((prevData) =>
        prevData.map((message) =>
          message.id === id ? { ...message, isDone: true } : message,
        ),
      );

      // Set a timeout to hide the success message after 3 seconds
      setTimeout(() => {
        setMessagesData((prevData) =>
          prevData.map((message) =>
            message.id === id ? { ...message, isDone: false } : message,
          ),
        );
      }, 3000);
    });
  };
  const handleDelete = (id: string) => {
    setMessagesData((prevData) =>
      prevData.filter((message) => message.id !== id),
    );
  };
  const handleOptionDelete = (id: string) => {
    SetRoadMapData((prevData: any) =>
      prevData.filter((option: any) => option.id !== id),
    );
  };
  //   const navigate = useNavigate();
  // const { id } = useParams<{ id: string }>();

  const [showModal, setshowModal] = useState(false);
  const [, setErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      setisLoading(true);
      try {
        const response = await Application.driftPatientInfo({
          member_id: memberID,
        });

        if (response && response.data && response.data.State) {
          setemptyActionPlan(false);
          setDescription(response.data.State.description);
          // setRecommendation(response.data.State.recommendation);
          setReference(response.data.State.reference);
          SetRoadMapData(response.data.RoadMap.options);

          setMessagesData(response.data.Message.options);
        } else {
          throw new Error('Invalid data structure');
        }

        console.log(response);
      } catch (err: any) {
        setemptyActionPlan(true);
        console.error('Error fetching data:', err);
        const errorMessage =
          err.detail || 'An error occurred while fetching data.';
        setErrorMsg(errorMessage);
        setDescription(''); // or whatever your default value is
        // setRecommendation(''); // if you have a default value
        setReference(''); // or whatever your default value is
        SetRoadMapData([]); // assuming an empty array is the default
        setMessagesData([]); // assuming an empty array is the default
      }
      setisLoading(false);
    };

    fetchData();
  }, [memberID]);
  const [Description, setDescription] = useState('');
  // const [recommendation, setRecommendation] = useState('');
  const [reference, setReference] = useState('');

  const toggleDaySelection = (
    categoryIndex: number,
    actionIndex: number,
    day: string,
  ) => {
    setData((prevData: any) => {
      const newData = { ...prevData };
      const action = newData[Object.keys(newData)[categoryIndex]][actionIndex];
      if (!Array.isArray(action.repeat_days)) {
        action.repeat_days = [];
      }
      if (action.repeat_days?.includes(day)) {
        action.repeat_days = action.repeat_days.filter(
          (d: string) => d !== day,
        );
      } else {
        action.repeat_days?.push(day);
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
  const [isLoading, setisLoading] = useState(false);
  const [blockID, setblockID] = useState();
  const [buttonLoading, setbuttonLoading] = useState(false);
  const [isloadingAi, setisloadingAi] = useState(false);
  const [emptyActionPlan, setemptyActionPlan] = useState(false);
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
          <div className=" w-full bg-backgroundColor-Card rounded-2xl px-4 py-3 border border-Gray-50 shadow-100 mt-3 min-h-[500px] h-fit md:h-[600px] 2xl:h-[700px] overflow-auto   ">
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
                        {categoryName == 'Lifestyle' && (
                          <img src={'/icons/LifeStyle2.svg'} alt="" />
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
                        <div className="mt-2 w-[170px] xs:w-[200px] lg:w-[224px] h-[32px] border rounded-[4px] text-[10px] md:text-xs bg-white border-Gray-50 inline-flex">
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
                                action.repeat_days?.includes(day)
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
      <div className="w-full h-full md:pb-0 flex flex-col gap-2">
        {' '}
        {isLoading && (
          <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
            <Circleloader></Circleloader>
          </div>
        )}
        {Description !== '' && (
          <div className="w-full h-fit bg-white rounded-2xl  shadow-200 p-4 text-Text-Primary font-medium">
            <div className="text-sm font-medium">State</div>
            <p className="text-xs text-justify my-2 font-normal">
              {Description}
            </p>
            {/* <p className="text-xs text-justify ">{recommendation}</p> */}
            {reference && (
              <a className="text-xs text-[#55B0FF]" href="">
                {reference}/
              </a>
            )}
          </div>
        )}
        {RoadMapData?.length > 0 ? (
          <div className="w-full  md:min-h-[186px] md:max-h-[244px] bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
            <div className={`w-full flex justify-between items-center ${RoadMapData?.length >1 ?'pr-[14px] ' : 'pr-0'}`}>
              <h5 className="text-sm font-medium text-light-primary-text dark:text-primary-text">
                Roadmap
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
                  Application.roadMapGenerateAi({
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
              <div
                className={`flex flex-col gap-2 h-[80%] mt-2 overflow-y-auto ${RoadMapData?.length >1 ?'pr-1 ' : 'pr-0'}`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#E5E5E5 transparent',
                }}
              >
                {RoadMapData?.map((option: any) => (
                  <AccordionCard
                    onClick={() => {
                      Application.driftAction({ member_id: memberID })
                        .then((res) => {
                          setData(res.data.plan);
                          setblockID(res.data.block_id);
                        })
                        .catch((err) => console.log(err))
                        .finally(() => setshowModal(true));
                    }}
                    onDelete={() => handleOptionDelete(option.id)}
                    key={option.id}
                    title={option.id}
                    description={option.description}
                    buttonText={'Procced'}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
        {MessagesData.length > 0 && (
          <div className="w-full  md:min-h-[120px] md:max-h-[244px] bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
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
              className={`flex flex-col gap-3 pr-3 mt-5  h-[80%] overflow-y-auto`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#E5E5E5 transparent',
              }}
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
                  <div className="mt-2 pr-1 ">
                    <AccordionCard
                      key={option.id}
                      title={option.id}
                      description={option.description}
                      onClick={() =>
                        handleMessageDone(option.id, option.description)
                      }
                      onDelete={() => handleDelete(option.id)}
                      buttonText={'Apporve'}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        )}
        {emptyActionPlan && (
          <div className="w-full flex justify-center items-center  h-[550px] bg-white rounded-2xl shadow-200 p-4 text-Text-Primary">
            <div>
              <img src="./icons/rafiki.svg" alt="" />
              <div className="text-base font-medium text-center mt-2">
                No drift analysis yet.
              </div>
              <div className="text-xs text-Text-Secondary dark:text-secondary-text t mt-1">
                This client does not have a holistic plan.
              </div>
            </div>
          </div>
        )}
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
const AccordionCard: FC<AccordionCardProps> = ({
  title,
  description,
  onClick,
  onDelete,
  buttonText,
}) => {
  const formatTitle = (text: string) => {
    // Add space between word and number, and between number and word
    const withSpaces = text
      .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
      .replace(/(\d)([a-zA-Z])/g, '$1 $2'); // Add space between number and letter
    // Capitalize first letter
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  return (
    <div className=" bg-backgroundColor-Card border border-Gray-50 w-full  p-4 rounded-lg flex flex-col md:flex-row justify-between items-center text-Text-Primary">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex md:hidden w-full justify-between items-center">
          <h6 className="text-xs font-medium whitespace-nowrap">
            {formatTitle(title)}
          </h6>
          <div className="flex items-center gap-3">
            <ButtonPrimary size="small" onClick={onClick}>
              {' '}
              <div className="text-[10px]">{buttonText}</div>
            </ButtonPrimary>

            <img
              onClick={onDelete}
              className="w-4 h-4 cursor-pointer"
              src="/icons/close.svg"
              alt=""
            />
          </div>
        </div>
        <h6 className="text-xs font-medium hidden md:block whitespace-nowrap">
          {formatTitle(title)}
        </h6>
        <div className="md:border-l border-Secondary-SelverGray pl-4 pr-4 text-xs font-normal text-justify max-w-[810px] ">
          {description}
        </div>
      </div>
      <div className=" hidden md:flex items-center gap-3">
        <ButtonPrimary size="small" onClick={onClick}>
          {' '}
          {buttonText}
        </ButtonPrimary>

        <img
          onClick={onDelete}
          className="w-6 h-6 cursor-pointer"
          src="/icons/close.svg"
          alt=""
        />
      </div>
    </div>
  );
};
