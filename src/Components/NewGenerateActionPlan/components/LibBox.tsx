import { FC, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
// import BasedOnModal from './BasedOnModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LibBoxProps {
  data: any;
  onAdd: () => void;
}

const LibBox: FC<LibBoxProps> = ({ data, onAdd }) => {
  const [valueData, setValueData] = useState('');
  useEffect(() => {
    switch (data.Category) {
      case 'Diet':
        setValueData('Macros');
        break;
      case 'Supplement':
        setValueData('Dose');
        break;
      case 'Lifestyle':
        setValueData('Value');
        break;
      case 'Activity':
        setValueData('File');
        break;
    }
  }, [data.Category]);
  const [showMore, setShowMore] = useState(false);
  return (
    <>
      <div className="w-full overflow-hidden bg-white border border-gray-50 rounded-[12px] py-3 px-3">
        <div className="flex justify-between items-center">
          <div className="flex justify-start gap-2 items-center">
            <img
              onClick={onAdd}
              className="w-4 cursor-pointer"
              src="/icons/add-square-green.svg"
              alt=""
            />
            <div
              data-tooltip-id={`tooltip-${data.Category}-${data.Title}`}
              className="select-none text-[12px] text-Text-Primary w-[200px] overflow-hidden"
              style={{
                textWrap: 'nowrap',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {data.Title.length > 43
                ? data.Title.substring(0, 43) + '...'
                : data.Title}
            </div>
            {data.Title.length > 43 && (
              <Tooltip
                id={`tooltip-${data.Category}-${data.Title}`}
                place="top"
                className="!bg-white !w-[200px] !leading-5 !text-wrap !shadow-100 !text-Text-Quadruple !text-[10px] !rounded-[6px] !border !border-gray-50 flex flex-col !z-20"
              >
                {data.Title}
              </Tooltip>
            )}
          </div>
          <img
            onClick={() => {
              setShowMore(!showMore);
            }}
            className={`cursor-pointer ${showMore ? 'rotate-180' : ''}`}
            src="/icons/arrow-down-blue.svg"
            alt=""
          />
        </div>
        <div
          className={`flex items-center mt-2 gap-1 ${showMore ? '' : 'ml-6'}`}
        >
          <div className="w-[35px] h-[14px] rounded-3xl bg-Boarder gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center">
            <span
              className={`w-[5px] h-[5px] rounded-full bg-Primary-DeepTeal`}
            />
            {data['System Score']}
          </div>
          <div className="w-[35px] h-[14px] rounded-3xl bg-[#DAF6C6] gap-[2.5px] text-[8px] text-Text-Primary flex items-center justify-center">
            <span
              className={`w-[5px] h-[5px] rounded-full bg-Primary-EmeraldGreen`}
            />
            {data.Base_Score}
          </div>
        </div>
        {showMore && (
          <div className="mt-2">
            <div className="flex justify-start mt-1 items-start">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • Instruction:
              </div>
              <div className="text-[10px] text-Text-Primary text-justify ml-1">
                {data.Instruction}
              </div>
            </div>
            <div className="flex justify-start mt-1 items-start">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • {valueData}:
              </div>
              <div className="text-[10px] text-Text-Primary text-justify ml-1">
                {valueData === 'Macros' ? (
                  <div className="flex justify-start items-center gap-4">
                    <div className="flex justify-start items-center">
                      Carbs: {data['Total Macros']?.Carbs}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                    <div className="flex justify-start items-center">
                      Protein: {data['Total Macros']?.Protein}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                    <div className="flex justify-start items-center">
                      Fat: {data['Total Macros']?.Fats}
                      <div className="text-Text-Quadruple">gr</div>
                    </div>
                  </div>
                ) : (
                  data[valueData]
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default LibBox;
