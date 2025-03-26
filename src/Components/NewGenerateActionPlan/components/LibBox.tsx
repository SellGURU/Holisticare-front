import { useState } from 'react';
import SvgIcon from '../../../utils/svgIcon';
// import BasedOnModal from './BasedOnModal';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface LibBoxProps {
  data: any;
  onAdd: () => void;
  setShowBasedOn: (value: boolean) => void;
  setValueBasedOn: (value: []) => void;
}

const LibBox: React.FC<LibBoxProps> = ({
  data,
  onAdd,
  setShowBasedOn,
  setValueBasedOn,
}) => {
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
            <div className="text-[12px] text-Text-Primary w-[200px] overflow-hidden text-nowrap text-ellipsis">
              {data.Title}
            </div>
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
        {showMore && (
          <div className=" mt-2">
            <div className=" flex justify-start mt-1 items-start">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • Instruction:
              </div>
              <div className="text-[10px] text-Text-Primary text-justify ml-1">
                {data.Instruction}
              </div>
            </div>
            <div className=" flex justify-start mt-1 flex-wrap  gap-2 items-center">
              <div className="text-Text-Secondary text-[10px]  flex justify-start items-center text-nowrap">
                • Score
              </div>
              <div className="rounded-[12px] text-[10px] text-Text-Primary py-1 px-2 bg-red-100">
                {data.Score} <span className="text-Text-Secondary">/ 10</span>
              </div>
              <div
                onClick={() => {
                  setValueBasedOn(data['Practitioner Comments']);
                  setShowBasedOn(true);
                }}
                className="flex justify-start gap-1 items-center"
              >
                <div className="text-[10px] text-Text-Secondary">
                  {' '}
                  Based on:
                </div>
                <div className="text-Primary-DeepTeal text-[10px] flex items-center ml-1 gap-2 cursor-pointer">
                  {data['Based on']}
                </div>
                <SvgIcon src="/icons/export.svg" color="#005F73" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default LibBox;
