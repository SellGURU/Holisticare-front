import { useState } from 'react';
import TooltipTextAuto from '../../TooltipText/TooltipTextAuto';
import Legends from '../Legends';
import resolveAnalyseIcon from '../resolveAnalyseIcon';
import MarkdownText from '../../markdownText';
import AcordinRefrenceBox from './AcordinRefrenceBox';
import ChartLoadingPlaceholder from '../ChartLoadingPlaceholder';
import CategoryStats from './CategoryStats';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface NewDetailedAcordinProps {
  data: any;
  refrences: any;
  isScoringComplete?: boolean;
  isDescriptionReady?: boolean;
  isProcessing?: boolean;
  needFocusAnalyzing?: boolean;
  ringLoading?: boolean;
}
const NewDetailedAcordin: React.FC<NewDetailedAcordinProps> = ({
  data,
  refrences,
  isScoringComplete = true,
  isDescriptionReady = true,
  isProcessing = false,
  needFocusAnalyzing,
  ringLoading,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const showNeedFocusAnalyzing =
    needFocusAnalyzing ?? (isProcessing || !isScoringComplete);
  const showRingLoading = ringLoading ?? (isProcessing || !isScoringComplete);
  const categoryProcessing = showRingLoading;

  return (
    <>
      <div
        id={data.subcategory}
        className={`w-full mb-4 py-4 px-3 xs:px-6 bg-white border shadow-100 rounded-[6px] ${
          categoryProcessing
            ? 'border-dashed border-Primary-100 opacity-90'
            : 'border-Gray-50'
        }`}
      >
        <div className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center ">
            <div
              className={`md:w-10 md:h-10 w-8 h-8 items-center rounded-full flex justify-center ${
                categoryProcessing ? 'animate-pulse bg-Gray-100' : ''
              }`}
              style={
                categoryProcessing
                  ? undefined
                  : {
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
                    }
              }
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
              <CategoryStats
                numOfBiomarkers={data?.num_of_biomarkers}
                outOfRef={data?.out_of_ref}
                isProcessing={showNeedFocusAnalyzing}
                biomarkerLabel="biomarkers"
                needFocusQuoted={false}
              />
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
            {isDescriptionReady && data.description ? (
              <>
                <div className="text-Text-Primary TextStyle-Headline-5 mt-4">
                  Description
                </div>
                <div className=" md:h-[30px] overflow-y-auto text-Text-Secondary TextStyle-Body-2 mt-2 text-justify">
                  <MarkdownText text={data.description} />
                </div>
              </>
            ) : !isDescriptionReady ? (
              <div className="mt-4">
                <ChartLoadingPlaceholder
                  variant="text"
                  label="Generating description…"
                />
              </div>
            ) : null}
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
                          isScoringComplete={isScoringComplete}
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
