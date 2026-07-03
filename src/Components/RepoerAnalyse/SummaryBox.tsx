import SpinnerLoader from '../SpinnerLoader';
import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import resolveAnalyseIcon from './resolveAnalyseIcon';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SummaryBoxProps {
  data: any;
  isActive?: boolean;
  /** True while backend scoring/LLM is still running — counts are not final. */
  isProcessing?: boolean;
  /** When set, gates only the need-focus row (counts still show). */
  needFocusAnalyzing?: boolean;
  /** When set, gates the status ring animation. */
  ringLoading?: boolean;
}
const SummaryBox: React.FC<SummaryBoxProps> = ({
  data,
  isActive,
  needFocusAnalyzing,
  ringLoading,
}) => {
  const biomarkerCountMissing = data.num_of_biomarkers == null;
  const needFocusMissing = data.out_of_ref == null;
  const ringMissing = data.status == null || !Array.isArray(data.status);
  const showNeedFocusAnalyzing = needFocusAnalyzing ?? needFocusMissing;
  const showRingLoading = ringLoading ?? ringMissing;
  // const resolveStatusColor =() => {
  //     if(data.status == 'Normal') {
  //         return '#06C78D'
  //     }
  //     if(data.status == 'At risk') {
  //         return '#FBAD37'
  //     }
  //     if(data.status == 'Need action') {
  //         return '#FC5474'
  //     }
  // }
  // console.log(data);
  return (
    <>
      <div
        onClick={() => {
          document.getElementById(data.subcategory)?.scrollIntoView({
            behavior: 'smooth',
          });
        }}
        className={`w-full flex cursor-pointer justify-start items-center ${
          isActive ? 'border ' : ''
        } h-[64px] p-4 rounded-[6px] bg-white border-gray-50 shadow-100 ${
          showRingLoading ? 'opacity-75 border-dashed border-Primary-100' : ''
        }`}
      >
        <div
          className={`w-10 h-10 items-center rounded-full flex justify-center ${
            showRingLoading ? 'animate-pulse bg-Gray-100' : ''
          }`}
          style={
            showRingLoading
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
            className="w-[35px] h-[35px]  flex justify-center bg-white items-center  rounded-full"
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
          <div className="TextStyle-Headline-6 text-Text-Primary">
            <TooltipTextAuto maxWidth="350px">
              {data.subcategory}
            </TooltipTextAuto>
          </div>
          <div className="flex justify-start items-center">
            <div className=" text-Text-Secondary text-[10px]">
              {' '}
              {biomarkerCountMissing ? (
                <span className="inline-flex items-center gap-1 text-Text-Triarty">
                  <SpinnerLoader color="#9CA3AF" />
                </span>
              ) : (
                <>
                  <span className=" text-Text-Secondary">
                    {data.num_of_biomarkers}
                  </span>{' '}
                  {data.num_of_biomarkers > 1 ? 'Biomarkers' : 'Biomarker'}
                </>
              )}
            </div>
            <div className="text-Text-Secondary ml-2 text-[10px]">
              {showNeedFocusAnalyzing ? (
                <span className="inline-flex items-center gap-1 text-Text-Triarty">
                  <SpinnerLoader color="#9CA3AF" />
                  Analyzing…
                </span>
              ) : (
                <>
                  <span className="text-Text-Secondary">{data.out_of_ref}</span>{' '}
                  {data.out_of_ref > 1 ? '"Need Focus"' : '"Need Focus"'}{' '}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryBox;
