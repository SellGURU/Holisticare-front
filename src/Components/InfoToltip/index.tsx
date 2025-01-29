/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import Application from '../../api/app';

interface InfoToltipProps {
  mode?: string;
  isShare?: boolean;
}

const InfoToltip: React.FC<InfoToltipProps> = ({ mode, isShare }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!isShare) {
      if (mode == 'Treatment') {
        Application.showPlanPriorty({}).then((res) => {
          // console.log(res)
          setItems(res.data);
        });
      } else {
        Application.showCategory({}).then((res) => {
          // console.log(res)
          setItems(res.data.items);
        });
      }
    }
  }, []);
  return (
    <div className="relative">
      <div
        onMouseEnter={() => {
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          setIsVisible(false);
        }}
        className="w-full flex justify-end items-center gap-1 cursor-pointer"
      >
        <div>
          <img src="/icons/user-navbar/info-circle.svg" />
        </div>
        <div className="text-[12px] text-Primary-DeepTeal">
          {mode == 'Treatment' ? 'Plan Priority' : 'Category'}
        </div>
      </div>
      {isVisible && (
        <div className="w-[350px] max-w-[350px] p-2 left-[-257px] z-20 top-5 bg-white border border-gray-50 rounded-[6px] shadow-200 absolute">
          {mode == 'Treatment' ? (
            <div className="text-Text-Secondary text-[9px] ">{items}</div>
          ) : (
            <>
              <div className="text-[9px] text-Primary-DeepTeal">Gategory:</div>
              <div className="grid grid-cols-2 text-[9px] gap-2 mt-2 text-Text-Secondary">
                {items.map((el: any) => {
                  return (
                    <>
                      <div>{el.item}</div>
                    </>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoToltip;
