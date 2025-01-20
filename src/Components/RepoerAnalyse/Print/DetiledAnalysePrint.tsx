/* eslint-disable @typescript-eslint/no-explicit-any */

import resolveAnalyseIcon from '../resolveAnalyseIcon';
import BiomarkersPrint from './BiomarkersPrint';

// import Toggle from "./Toggle";

interface DetiledAnalyseProps {
  data: any;
  refrences: any;
}

const DetiledAnalyse: React.FC<DetiledAnalyseProps> = ({ data, refrences }) => {
  console.log(refrences)

  return (
    <div className='bg-white' style={{borderRadius:'16px',padding:'12px'}}>
      <div
        className={`w-full  no-split flex cursor-pointer justify-start items-center h-16 rounded-md `}
      >
        <div
          className="w-10 h-10 items-center rounded-full flex justify-center"
          style={{
            background: `conic-gradient(#7F39FB 0% ${data.status[0]}%,#06C78D ${data.status[0]}% ${data.status[1] + data.status[0]}%,#FBAD37 ${
              data.status[1] + data.status[0]
            }% ${data.status[1] + data.status[2] + data.status[0]}%,#FC5474 ${
              data.status[2] + data.status[1] + data.status[0]
            }% 100%)`,
          }}
        >
          <div
            className="w-8 h-8  flex justify-center  items-center  rounded-full"
            // style={{backgroundColor}}
            style={{backgroundColor:'white'}}
          >
            <img
              className="w-5 h-5"
              src={resolveAnalyseIcon(data.subcategory)}
              alt=""
            />
          </div>
        </div>
        <div className="ml-2">
          <div
            id={data.subcategory}
            style={{color:'#005F73',fontSize:'12px'}}
            className=" text-sm"
          >
            {data?.subcategory}
          </div>
          <div className="flex justify-start items-center " style={{color:'#B0B0B0',fontSize:'10px'}}>
            <div className=" ">
              {' '}
              <span className=" ">
                {data?.num_of_biomarkers}
              </span>{' '}
              biomarkers
            </div>
            <div className="  ml-2 ">
              <span className="">
                {data?.out_of_ref}
              </span>{' '}
              {data?.out_of_ref > 1 ? 'Needs Focus' : 'Need Focus'}{' '}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-0 grid gap-1 grid-cols-1">
        <div className='text-xs ' style={{color:'#383838',marginBottom:'12px'}}>
          Description
        </div>
        <div className="text-xs " style={{color:'#888888',marginBottom:'12px'}}>{data?.description}</div>
        {refrences?.biomarkers.slice(0,4).map((el: any) => {
          return (
            <div style={{
              pageBreakInside:'avoid',
              pageBreakBefore:'auto',
              pageBreakAfter:'auto',
            }}>
              <BiomarkersPrint data={el}></BiomarkersPrint>
              <div className="text-xs text-justify text-gray-700 py-2" style={{color:'#888888',fontSize:'10px'}}>
                {el?.more_info}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetiledAnalyse;
