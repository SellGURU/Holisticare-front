import TooltipTextAuto from '../TooltipText/TooltipTextAuto';
import resolveAnalyseIcon from './resolveAnalyseIcon';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SummaryBoxProps {
  data: any;
  isActive?: boolean;
}
const SummaryBox: React.FC<SummaryBoxProps> = ({ data, isActive }) => {
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
        } h-[64px] p-4 rounded-[6px] bg-white border-gray-50 shadow-100 `}
      >
        <div
          className="w-10 h-10 items-center rounded-full flex justify-center"
          style={{
            background: `conic-gradient(#37B45E 0% ${data.status[0]}%,#72C13B ${data.status[0]}% ${data.status[1] + data.status[0]}%,#D8D800 ${
              data.status[1] + data.status[0]
            }% ${data.status[1] + data.status[2] + data.status[0]}%,#BA5225 ${
              data.status[2] + data.status[1] + data.status[0]
            }% ${data.status[3] + data.status[2] + data.status[1] + data.status[0]}%,#B2302E ${
              data.status[3] + data.status[2] + data.status[1] + data.status[0]
            }% 100%)`,
          }}
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
              <span className=" text-Text-Secondary">
                {data.num_of_biomarkers}
              </span>{' '}
              {data.num_of_biomarkers > 1 ? 'Biomarkers' : 'Biomarker'}
            </div>
            <div className=" text-Text-Secondary ml-2 text-[10px]">
              <span className="text-Text-Secondary">{data.out_of_ref}</span>{' '}
              {data.out_of_ref > 1 ? 'Needs Focus' : 'Needs Focus'}{' '}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SummaryBox;
