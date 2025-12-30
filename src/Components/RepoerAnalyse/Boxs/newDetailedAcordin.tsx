import { useState } from 'react';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import Legends from '../Legends';
import resolveAnalyseIcon from '../resolveAnalyseIcon';
import MarkdownText from '../../markdownText';
import AcordinRefrenceBox from './AcordinRefrenceBox';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface NewDetailedAcordinProps {
  data: any;
  refrences: any;
}
const NewDetailedAcordin: React.FC<NewDetailedAcordinProps> = ({
  data,
  refrences,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div
        id={data.subcategory}
        className="w-full mb-4 py-4 px-3 xs:px-6 bg-white border border-Gray-50 shadow-100 rounded-[6px] "
      >
        <div className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center ">
            <div
              className="md:w-10 md:h-10 w-8 h-8 items-center rounded-full flex justify-center"
              style={{
                background: `conic-gradient(#37B45E 0% ${data.status[0]}%,#72C13B ${data.status[0]}% ${data.status[1] + data.status[0]}%,#D8D800 ${
                  data.status[1] + data.status[0]
                }% ${data.status[1] + data.status[2] + data.status[0]}%,#BA5225 ${
                  data.status[2] + data.status[1] + data.status[0]
                }% ${data.status[3] + data.status[2] + data.status[1] + data.status[0]}%,#B2302E ${
                  data.status[3] +
                  data.status[2] +
                  data.status[1] +
                  data.status[0]
                }% 100%)`,
              }}
            >
              <div
                className="md:w-[35px] md:h-[35px] size-7  flex justify-center bg-white items-center  rounded-full"
                style={{}}
              >
                <img
                  className=""
                  src={resolveAnalyseIcon(data.subcategory)}
                  alt=""
                />
              </div>
            </div>
            <div className="ml-2">
              <div className="TextStyle-Headline-5 text-Text-Primary flex items-center gap-2 ">
                <TooltipTextAuto maxWidth="300px">
                  {data.subcategory}
                </TooltipTextAuto>
                {isOpen && <Legends></Legends>}
              </div>
              <div className="flex justify-start items-center">
                <div className="TextStyle-Body-3 text-Text-Secondary">
                  {data?.num_of_biomarkers} biomarkers
                </div>
                <div className="TextStyle-Body-3 text-Text-Secondary ml-2">
                  {data?.out_of_ref}{' '}
                  {data.out_of_ref > 1 ? 'Needs Focus' : 'Need Focus'}{' '}
                </div>
              </div>
            </div>
          </div>
          <div
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className={`${isOpen ? 'rotate-180' : ''} cursor-pointer`}
          >
            <img
              className=" w-[24px]"
              src="/icons/arrow-down-green.svg"
              alt=""
            />
          </div>
        </div>
        {isOpen && (
          <>
            <div className="text-Text-Primary TextStyle-Headline-5 mt-4">
              Description
            </div>
            <div className=" md:h-[30px] overflow-y-auto text-Text-Secondary TextStyle-Body-2 mt-2 text-justify">
              <MarkdownText text={data.description} />
            </div>
            <div className="w-full  flex items-start gap-2  bg-backgroundColor-Card  rounded-[12px] min-h-[30px] mt-4">
              {refrences.length == 0 && (
                <>
                  <div className=" flex justify-center w-full items-center">
                    <div className="flex flex-col justify-center items-center">
                      <img src="/icons/EmptyState-biomarkerbox.svg" alt="" />
                      <div className="TextStyle-Body-3 mt-[-10px] text-center text-Text-Primary">
                        This biomarker is currently hidden due to changes in its
                        mapping.
                      </div>
                    </div>
                  </div>
                </>
              )}
              {refrences.length > 0 && (
                <>
                  <div className="flex flex-col w-full gap-2">
                    {refrences.map((biomarker: any, index: number) => {
                      return (
                        <AcordinRefrenceBox
                          biomarker={biomarker}
                          key={index + '-refrence-box'}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NewDetailedAcordin;
