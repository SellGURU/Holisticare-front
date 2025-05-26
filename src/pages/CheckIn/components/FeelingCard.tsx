/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';

interface FeelingCardProps {
  question: string;
  value: 'Angry' | 'Sad' | 'Neutral' | 'Smile' | 'Loved' | string;
  index?: number;
  onSubmit?: (value: string) => void;
  hideQuestions?: boolean;
}

const FeelingCard: React.FC<FeelingCardProps> = ({
  question,
  index,
  onSubmit,
  value,
  hideQuestions,
}) => {
  const touchStartX = useRef(0);
  // const touchEndX = useRef(0);
  const emojeys = [
    {
      name: 'Angry',
      order: 0,
      icon: '/images/emoji/angery.gif',
    },
    {
      name: 'Sad',
      order: 1,
      icon: '/images/emoji/sad.gif',
    },
    {
      name: 'Neutral',
      order: 2,
      icon: '/images/emoji/poker.gif',
    },
    {
      name: 'Smile',
      order: 3,
      icon: '/images/emoji/smile.gif',
    },
    {
      name: 'Loved',
      order: 4,
      icon: '/images/emoji/love.gif',
    },
  ];
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: any) => {
    const touchMoveX = e.touches[0].clientX;
    const diff = touchStartX.current - touchMoveX;

    if (diff > 50) {
      // Swipe Left
      if (active.order + 1 <= 4) {
        setActive(emojeys.filter((el) => el.order == active.order + 1)[0]);
      }
      touchStartX.current = touchMoveX; // Reset start point to prevent multiple changes per swipe
    } else if (diff < -50) {
      // Swipe Right
      if (active.order - 1 >= 0) {
        setActive(emojeys.filter((el) => el.order == active.order - 1)[0]);
      }
      touchStartX.current = touchMoveX; // Reset start point
    }
  };
  // const [active, setActive] = useState(
  //   value ? emojeys.filter((el) => el.name == value)[0] : emojeys[2],
  // );
  const [active, setActive] = useState(() => {
    const initial = emojeys.find((el) => el.name === value) || emojeys[2];
    return initial;
  });
  useEffect(() => {
    if (onSubmit) {
      onSubmit(active.name);
    }
  }, [active]);

  return (
    <>
      <div className="bg-[#FCFCFC] p-3 w-full  h-full rounded-[12px] border border-gray-50">
        {!hideQuestions && (
          <div className="text-[12px] text-Text-Primary">
            {index}. {question}
          </div>
        )}

        <div className="bg-white mt-2 w-full rounded-[20px] py-3 px-2">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className="flex w-full select-none justify-center items-center gap-4"
          >
            {Array.from({ length: 5 }).map((_em, ind) => {
              const itemIndex = active.order - 2 + ind;
              return (
                <>
                  {itemIndex >= 0 && itemIndex <= 4 ? (
                    <>
                      {active.order == emojeys[itemIndex].order ? (
                        <div className="w-[40px] h-[40px] bg-[#FFD64F] flex justify-center items-center rounded-full">
                          <img className="w-[32px]" src={active.icon} />
                        </div>
                      ) : (
                        <img
                          // onClick={() => {
                          //   setActive(emojeys[itemIndex]);
                          // }}
                          className="w-[28px] cursor-pointer"
                          src={emojeys[itemIndex].icon}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-[28px]"></div>
                    </>
                  )}
                </>
              );
            })}
            {/* <div className="w-[40px] h-[40px] bg-[#FFD64F] flex justify-center items-center rounded-full">
                        <img className="w-[32px]" src={active.icon}/>

                    </div>
                    {emojeys.filter((el)=>el.name != active.name).slice(2,4).map(em => {
                        return (
                            <>
                            <img onClick={() => {
                                setActive(em)
                            }} className="w-[28px] h-[28px]" src={em.icon}/>
                            </>
                        )
                    })}                     */}
          </div>
          <div className="w-full mt-4 flex justify-center">
            <div className="text-[14px] text-[#005F73]">{active.name}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeelingCard;
